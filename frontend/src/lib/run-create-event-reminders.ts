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

type AuthUserLite = {
  id: string;
  email?: string | null;
  is_anonymous?: boolean;
  user_metadata?: Record<string, unknown> | null;
};

function getUserMeta(user: AuthUserLite): Record<string, unknown> {
  const raw = user.user_metadata;
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    return { ...raw } as Record<string, unknown>;
  }
  return {};
}

/**
 * All registered (non-anonymous) users with an email.
 * Sends Resend create-event nudges with cooldown + max count in user_metadata.
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

    const recipients = users.filter((u) => u.email && !u.is_anonymous);
    if (recipients.length === 0) {
      if (users.length < perPage) break;
      page += 1;
      continue;
    }

    for (const user of recipients) {
      const email = user.email!.trim().toLowerCase();

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

      const displayName =
        (typeof meta.full_name === "string" && meta.full_name.trim()) ||
        (typeof meta.name === "string" && meta.name.trim()) ||
        "";
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
