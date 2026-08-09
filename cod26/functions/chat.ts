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

/** Model is overridable via a backend secret without redeploying. */
const MODEL = Deno.env.get("OPENROUTER_CHAT_MODEL") ?? "anthropic/claude-haiku-4.5";

const MAX_CHARS = 1000;        // per user message
const HISTORY_TURNS = 12;      // messages replayed as context
const HOURLY_LIMIT = 30;       // per user - this endpoint costs real money

const SYSTEM_PROMPT = `You are the COD26 study assistant. COD26 is an online \
Python course for school and first-year engineering students in India.

The course has 17 units, from "Introduction to Python" through OOP, modules, \
libraries, web basics and SQL, to a final capstone. Each unit has theory pages, \
a 30-minute quiz that needs 60% to pass, and a practice assignment. Finishing \
all 17 units earns a certificate. Unit 1 is free for everyone; the rest unlock \
after paying the class fee or redeeming a school code.

Your job:
- Answer Python and course questions clearly, at a beginner's level.
- Prefer short explanations with a small code example over long essays.
- If a student asks about fees, refunds, or their own payment status, tell them \
to check the enrolment screen or contact their school coordinator - you do not \
have access to their account or payment records.
- If you do not know something about COD26 specifically, say so rather than \
inventing a policy.
- Never reveal quiz answers. If asked for the answer to a quiz question, help \
them reason it out instead.
- Reply in the language the student used. Many students write in Hinglish - \
that is fine, answer the same way.

Keep replies under 200 words unless the student asks for more detail.`;

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const baseUrl = Deno.env.get("INSFORGE_BASE_URL")!;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;

  const user = createClient({ baseUrl, edgeFunctionToken: token });
  const { data: me } = await user.auth.getCurrentUser();
  if (!me?.user?.id) return json({ error: "Please sign in to use the assistant." }, 401);
  const userId = me.user.id;

  const admin = createAdminClient({ baseUrl, apiKey: Deno.env.get("API_KEY")! });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // ------------------------------------------------------------- history
  if (body?.action === "history") {
    const { data: rows, error } = await admin.database
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) return json({ error: error.message }, 500);
    return json({ messages: rows ?? [] });
  }

  if (body?.action !== "send") return json({ error: "Unknown action" }, 400);

  // ---------------------------------------------------------------- send
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return json({ error: "Message is empty." }, 400);
  if (message.length > MAX_CHARS) {
    return json({ error: `Please keep it under ${MAX_CHARS} characters.` }, 400);
  }

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    return json({ error: "The assistant is not configured yet. Please try later." }, 503);
  }

  // Rate limit: this endpoint bills per call, so cap it per user per hour.
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { data: recent } = await admin.database
    .from("chat_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", since);
  if ((recent?.length ?? 0) >= HOURLY_LIMIT) {
    return json({ error: "You've hit the hourly limit. Please try again later." }, 429);
  }

  const { data: history } = await admin.database
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_TURNS);

  // Fetched newest-first for the limit; the model needs oldest-first.
  const priorTurns = (history ?? [])
    .slice()
    .reverse()
    .map((m: any) => ({ role: m.role, content: m.content }));

  let answer = "";
  let usage: any = null;
  let usedModel = MODEL;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...priorTurns,
          { role: "user", content: message },
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("OpenRouter error", res.status, detail.slice(0, 500));
      return json({ error: "The assistant is busy right now. Please try again." }, 502);
    }

    const payload = await res.json();
    answer = payload?.choices?.[0]?.message?.content?.trim() ?? "";
    usage = payload?.usage ?? null;
    usedModel = payload?.model ?? MODEL;
  } catch (e) {
    console.error("OpenRouter fetch failed", e);
    return json({ error: "Could not reach the assistant. Please try again." }, 502);
  }

  if (!answer) return json({ error: "The assistant had no reply. Please rephrase." }, 502);

  // Persist only after a successful reply, so a failed call does not leave a
  // dangling user message that skews the next request's context.
  await admin.database.from("chat_messages").insert([
    { user_id: userId, role: "user", content: message },
    {
      user_id: userId,
      role: "assistant",
      content: answer,
      model: usedModel,
      prompt_tokens: usage?.prompt_tokens ?? null,
      completion_tokens: usage?.completion_tokens ?? null,
    },
  ]);

  return json({ reply: answer });
}
