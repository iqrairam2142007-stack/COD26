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

/**
 * Redeem a school code. The code table is not readable from the browser, so
 * validation, the use-count increment, and the access grant all happen here.
 */
export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const baseUrl = Deno.env.get("INSFORGE_BASE_URL")!;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;

  const user = createClient({ baseUrl, edgeFunctionToken: token });
  const { data: me } = await user.auth.getCurrentUser();
  if (!me?.user?.id) return json({ error: "Unauthorized" }, 401);
  const userId = me.user.id;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const code = String(body?.code ?? "").trim().toUpperCase();
  if (!code) return json({ error: "School code is required" }, 400);

  const admin = createAdminClient({ baseUrl, apiKey: Deno.env.get("API_KEY")! });

  const { data: rows } = await admin.database
    .from("school_codes").select("*").eq("code", code).limit(1);
  const sc = rows?.[0];

  if (!sc) return json({ error: "Invalid school code" }, 400);
  if (!sc.is_active) return json({ error: "This school code is no longer active" }, 400);
  if (sc.used_count >= sc.max_uses) return json({ error: "This school code has reached its limit" }, 400);

  await admin.database
    .from("school_codes")
    .update({ used_count: sc.used_count + 1 })
    .eq("code", code);

  const expires = new Date();
  expires.setMonth(expires.getMonth() + 6);

  const { data: updated, error } = await admin.database
    .from("profiles")
    .update({
      name: body.name ?? undefined,
      phone: body.phone ?? undefined,
      class_level: body.class ?? undefined,
      school: sc.school_name,
      student_id: body.studentId ?? undefined,
      account_type: "school",
      access_status: "active",
      access_expires_at: expires.toISOString(),
    })
    .eq("id", userId)
    .select();

  if (error) return json({ error: error.message }, 500);

  await admin.database.from("activity_logs").insert([{
    user_id: userId,
    activity_type: "school_code_redeemed",
    description: `Redeemed ${code} (${sc.school_name})`,
    device_type: "web",
  }]);

  return json({ profile: updated?.[0] ?? null });
}
