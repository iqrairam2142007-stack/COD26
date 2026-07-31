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

/** Admin-only reads. The caller's role is checked here, never in the browser. */
export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const baseUrl = Deno.env.get("INSFORGE_BASE_URL")!;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;

  const user = createClient({ baseUrl, edgeFunctionToken: token });
  const { data: me } = await user.auth.getCurrentUser();
  if (!me?.user?.id) return json({ error: "Unauthorized" }, 401);

  const admin = createAdminClient({ baseUrl, apiKey: Deno.env.get("API_KEY")! });

  const { data: callers } = await admin.database
    .from("profiles").select("role").eq("id", me.user.id).limit(1);
  if (callers?.[0]?.role !== "admin") return json({ error: "Forbidden" }, 403);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const all = async (table: string, cols = "*") =>
    (await admin.database.from(table).select(cols)).data ?? [];

  switch (body.action) {
    case "dashboard": {
      const [students, orders, logs, codes] = await Promise.all([
        all("profiles"),
        all("orders"),
        all("activity_logs"),
        all("school_codes"),
      ]);

      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);

      return json({
        dashboard: {
          overview: {
            totalStudents: students.length,
            activeSubscriptions: students.filter((s: any) => s.access_status === "active").length,
            pendingSubscriptions: students.filter((s: any) => s.access_status === "pending").length,
            directStudents: students.filter((s: any) => s.account_type === "direct").length,
            schoolStudents: students.filter((s: any) => s.account_type === "school").length,
            todayActivities: logs.filter((l: any) => new Date(l.created_at) >= midnight).length,
          },
          revenue: {
            totalRevenue: orders
              .filter((o: any) => o.status === "paid")
              .reduce((sum: number, o: any) => sum + (o.amount || 0), 0),
          },
          recentLogins: logs
            .filter((l: any) => l.activity_type === "login")
            .sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at))
            .slice(0, 10)
            .map((l: any) => ({
              studentName: students.find((s: any) => s.id === l.user_id)?.name ?? "-",
              school: students.find((s: any) => s.id === l.user_id)?.school ?? "-",
              deviceType: l.device_type,
              timestamp: l.created_at,
            })),
          schools: {
            schoolCodes: codes.map((c: any) => ({
              code: c.code,
              schoolName: c.school_name,
              usedCount: c.used_count,
              maxUses: c.max_uses,
              isActive: c.is_active,
            })),
          },
        },
      });
    }

    case "students": {
      const f = body.filters ?? {};
      const [students, progress] = await Promise.all([all("profiles"), all("unit_progress")]);
      const term = String(f.searchTerm ?? "").toLowerCase();

      const rows = students
        .filter((s: any) => !f.subscriptionStatus || s.access_status === f.subscriptionStatus)
        .filter((s: any) => !f.accountType || s.account_type === f.accountType)
        .filter((s: any) =>
          !term ||
          [s.name, s.email, s.phone].some((v: any) => String(v ?? "").toLowerCase().includes(term)))
        .map((s: any) => {
          const done = progress.filter((p: any) => p.user_id === s.id && p.completed).length;
          return {
            uid: s.id,
            name: s.name,
            email: s.email,
            phone: s.phone,
            school: s.school,
            accountType: s.account_type,
            subscriptionStatus: s.access_status,
            progress: { totalProgress: Math.round((done / 17) * 100) },
          };
        });

      return json({ students: rows });
    }

    case "studentLogs": {
      const { data } = await admin.database
        .from("activity_logs").select("*").eq("user_id", body.userId)
        .order("created_at", { ascending: false }).limit(100);
      return json({
        activities: (data ?? []).map((l: any) => ({
          activityType: l.activity_type,
          activityDescription: l.description,
          deviceType: l.device_type,
          timestamp: l.created_at,
        })),
      });
    }

    case "activity": {
      const days = Math.min(Number(body.days) || 30, 365);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const [logs, students] = await Promise.all([
        (await admin.database.from("activity_logs").select("*")
          .gte("created_at", since).order("created_at", { ascending: false }).limit(500)).data ?? [],
        all("profiles", "id, name"),
      ]);

      const byType: Record<string, number> = {};
      for (const l of logs) byType[l.activity_type] = (byType[l.activity_type] ?? 0) + 1;

      return json({
        summary: { byType },
        timeline: logs.map((l: any) => ({
          studentName: students.find((s: any) => s.id === l.user_id)?.name ?? "-",
          activityType: l.activity_type,
          activityDescription: l.description,
          timestamp: l.created_at,
        })),
      });
    }

    case "createSchoolCode": {
      const schoolName = String(body.schoolName ?? "").trim();
      const schoolId = String(body.schoolId ?? "").trim();
      const maxUses = Number(body.maxUses);
      if (!schoolName || !schoolId || !Number.isFinite(maxUses) || maxUses < 1) {
        return json({ error: "schoolName, schoolId and a positive maxUses are required" }, 400);
      }

      const code = `${schoolId.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-${
        Math.random().toString(36).slice(2, 7).toUpperCase()
      }`;

      const { data, error } = await admin.database.from("school_codes").insert([{
        code, school_name: schoolName, school_id: schoolId, max_uses: Math.floor(maxUses),
      }]).select();

      if (error) return json({ error: error.message }, 500);
      return json({ schoolCode: data?.[0] ?? null });
    }

    default:
      return json({ error: "Unknown action" }, 400);
  }
}
