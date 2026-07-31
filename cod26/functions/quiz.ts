import { createClient, createAdminClient } from "npm:@insforge/sdk";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const PASS_MARK = 60;

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const baseUrl = Deno.env.get("INSFORGE_BASE_URL")!;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;

  const user = createClient({ baseUrl, edgeFunctionToken: token });
  const { data: me } = await user.auth.getCurrentUser();
  if (!me?.user?.id) return json({ error: "Unauthorized" }, 401);
  const userId = me.user.id;

  // Admin client: the question bank holds correct answers and is not readable
  // by students under RLS.
  const admin = createAdminClient({ baseUrl, apiKey: Deno.env.get("API_KEY")! });

  // Access gate - a student without active access cannot pull quiz content.
  const { data: profiles } = await admin.database
    .from("profiles").select("access_status, access_expires_at").eq("id", userId).limit(1);
  const profile = profiles?.[0];
  const expired = profile?.access_expires_at && new Date(profile.access_expires_at) < new Date();
  if (!profile || profile.access_status !== "active" || expired) {
    return json({ error: "No active access. Please complete the class fee payment." }, 403);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const unitId = Number(body?.unitId);
  if (!Number.isInteger(unitId) || unitId < 1 || unitId > 17) {
    return json({ error: "Invalid unitId" }, 400);
  }

  const { data: questions, error } = await admin.database
    .from("quiz_questions")
    .select("id, question, options, correct_answer, explanation")
    .eq("unit_id", unitId)
    .order("id", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  if (!questions?.length) return json({ error: "No questions for this unit yet" }, 404);

  if (body.action === "start") {
    // Strip correct_answer before it ever reaches the browser.
    return json({
      quiz: {
        unitId,
        questions: questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options,
        })),
      },
    });
  }

  if (body.action === "submit") {
    const answers: (string | null)[] = Array.isArray(body.answers) ? body.answers : [];
    const timeTaken = Math.max(0, Math.min(Number(body.timeTaken) || 0, 24 * 3600));

    const detailedResults = questions.map((q: any, i: number) => {
      const studentAnswer = answers[i] ?? null;
      return {
        question: q.question,
        studentAnswer,
        correctAnswer: q.correct_answer,
        isCorrect: studentAnswer === q.correct_answer,
        explanation: q.explanation,
      };
    });

    const correctAnswers = detailedResults.filter((d) => d.isCorrect).length;
    const totalQuestions = questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= PASS_MARK;

    await admin.database.from("quiz_attempts").insert([{
      user_id: userId,
      unit_id: unitId,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      percentage,
      passed,
      time_taken: timeTaken,
    }]);

    if (passed) {
      await admin.database.from("unit_progress").upsert(
        [{ user_id: userId, unit_id: unitId, completed: true, updated_at: new Date().toISOString() }],
        { onConflict: "user_id,unit_id" },
      );
    }

    await admin.database.from("activity_logs").insert([{
      user_id: userId,
      activity_type: "quiz_submitted",
      description: `Unit ${unitId}: ${percentage}% (${passed ? "passed" : "failed"})`,
      device_type: "web",
    }]);

    return json({
      result: { correctAnswers, totalQuestions, percentage, passed, timeTaken, detailedResults },
    });
  }

  return json({ error: "Unknown action" }, 400);
}
