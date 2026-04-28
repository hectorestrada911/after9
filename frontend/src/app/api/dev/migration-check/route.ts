import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CheckResult = {
  name: string;
  ok: boolean;
  error?: string;
};

function normalizeErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return JSON.stringify(err);
}

async function runCheck(name: string, fn: () => PromiseLike<{ error: unknown }>): Promise<CheckResult> {
  try {
    const { error } = await fn();
    if (error) return { name, ok: false, error: normalizeErrorMessage(error) };
    return { name, ok: true };
  } catch (err) {
    return { name, ok: false, error: normalizeErrorMessage(err) };
  }
}

export async function GET(req: NextRequest) {
  const token = process.env.MIGRATION_CHECK_TOKEN;
  const suppliedToken = req.nextUrl.searchParams.get("token");
  if (token && suppliedToken !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json(
      {
        ok: false,
        error: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing",
      },
      { status: 503 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRole);

  const checks = await Promise.all([
    runCheck("events.archived_at", () => supabase.from("events").select("id, archived_at").limit(1)),
    runCheck("events.show_capacity_publicly", () => supabase.from("events").select("id, show_capacity_publicly").limit(1)),
    runCheck("events.sales_enabled", () => supabase.from("events").select("id, sales_enabled").limit(1)),
    runCheck("orders.confirmation_email_sent_at", () =>
      supabase.from("orders").select("id, confirmation_email_sent_at").limit(1),
    ),
    runCheck("orders.discount_columns", () => supabase.from("orders").select("id, discount_code, discount_percent, discount_amount").limit(1)),
    runCheck("profiles.stripe_connect_account_id", () =>
      supabase.from("profiles").select("id, stripe_connect_account_id").limit(1),
    ),
    runCheck("profiles.stripe_connect_onboarded", () =>
      supabase.from("profiles").select("id, stripe_connect_onboarded").limit(1),
    ),
    runCheck("table:event_team_members", () => supabase.from("event_team_members").select("id").limit(1)),
    runCheck("table:event_team_invites", () => supabase.from("event_team_invites").select("id").limit(1)),
    runCheck("table:event_discount_codes", () => supabase.from("event_discount_codes").select("id").limit(1)),
  ]);

  const missing = checks.filter((c) => !c.ok);
  const ok = missing.length === 0;

  return NextResponse.json(
    {
      ok,
      checkedAt: new Date().toISOString(),
      checks,
      summary: ok ? "All required migrations are present." : `${missing.length} migration checks failed.`,
    },
    { status: ok ? 200 : 503 },
  );
}
