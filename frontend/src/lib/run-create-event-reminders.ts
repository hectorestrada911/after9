import type { User } from "@supabase/supabase-js";
import { getResendMailEnv } from "@/lib/resend-config";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";
import { sendCreateEventReminderEmail } from "@/lib/transactional-email";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createEventReminderCooldownMs(): number {
  const hours = Number(process.env.CREATE_EVENT_REMINDER_COOLDOWN_HOURS);
  const h = Number.isFinite(hours) && hours > 0 ? hours : 168;
  return h * 3600_000;
}

function createEventReminderMax(): number {
  const n = Number(process.env.CREATE_EVENT_REMINDER_MAX);
  return Number.isFinite(n) && n > 0 ? Math.min(24, Math.floor(n)) : 6;
}

function getUserMeta(user: User): Record<string, unknown> {
  const raw = user.user_metadata;
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    return { ...raw } as Record<string, unknown>;
  }
  return {};
}

/**
 * Verified users with a profile who have never created an event (no rows in `events` for their host_id).
 * Resend nudges to publish a first night; cooldown + max count in user_metadata.
 */
export async function runCreateEventReminders(): Promise<{
  scanned: number;
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
}> {
  const resendEnv = getResendMailEnv();
  if (!resendEnv) {
    return { scanned: 0, eligible: 0, sent: 0, skipped: 0, failed: 0 };
  }

  const admin = getSupabaseServiceRoleClient();
  const cooldownMs = createEventReminderCooldownMs();
  const maxReminders = createEventReminderMax();

  let scanned = 0;
  let eligible = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const perPage = 200;
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;

    const users = data.users;
    scanned += users.length;

    const confirmed = users.filter((u) => u.email && u.email_confirmed_at && !u.is_anonymous);
    if (confirmed.length === 0) {
      if (users.length < perPage) break;
      page += 1;
      continue;
    }

    const ids = confirmed.map((u) => u.id);
    const { data: eventRows, error: evErr } = await admin.from("events").select("host_id").in("host_id", ids);
    if (evErr) {
      failed += confirmed.length;
      if (users.length < perPage) break;
      page += 1;
      continue;
    }

    const hostsWithEvents = new Set((eventRows ?? []).map((r) => r.host_id));
    const withoutEvents = confirmed.filter((u) => !hostsWithEvents.has(u.id));
    if (withoutEvents.length === 0) {
      skipped += confirmed.length;
      if (users.length < perPage) break;
      page += 1;
      continue;
    }

    const wids = withoutEvents.map((u) => u.id);
    const { data: profiles, error: pErr } = await admin
      .from("profiles")
      .select("id, organizer_name, full_name")
      .in("id", wids);

    if (pErr || !profiles?.length) {
      skipped += withoutEvents.length;
      if (users.length < perPage) break;
      page += 1;
      continue;
    }

    const profileById = new Map(profiles.map((p) => [p.id, p]));

    for (const user of withoutEvents) {
      const email = user.email!.trim().toLowerCase();
      const profile = profileById.get(user.id);
      if (!profile) {
        skipped++;
        continue;
      }

      const meta = getUserMeta(user);
      const lastRaw = meta.last_create_event_reminder_at;
      const count = typeof meta.create_event_reminder_count === "number" ? meta.create_event_reminder_count : 0;

      if (count >= maxReminders) {
        skipped++;
        continue;
      }

      if (typeof lastRaw === "string") {
        const last = Date.parse(lastRaw);
        if (!Number.isNaN(last) && Date.now() - last < cooldownMs) {
          skipped++;
          continue;
        }
      }

      eligible++;

      const displayName = (profile.organizer_name || profile.full_name || "").trim();
      const result = await sendCreateEventReminderEmail({ to: email, displayName });
      if (!result.ok) {
        failed++;
        await sleep(200);
        continue;
      }

      const { error: upErr } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...meta,
          last_create_event_reminder_at: new Date().toISOString(),
          create_event_reminder_count: count + 1,
        },
      });

      if (upErr) {
        failed++;
      } else {
        sent++;
      }

      await sleep(400);
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return { scanned, eligible, sent, skipped, failed };
}
