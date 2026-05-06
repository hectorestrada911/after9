import { getResendMailEnv } from "@/lib/resend-config";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-service";
import { sendUnverifiedRegistrationReminderEmail } from "@/lib/transactional-email";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function reminderCooldownMs(): number {
  const hours = Number(process.env.REGISTRATION_REMINDER_COOLDOWN_HOURS);
  const h = Number.isFinite(hours) && hours > 0 ? hours : 48;
  return h * 3600_000;
}

function reminderMaxPerUser(): number {
  const n = Number(process.env.REGISTRATION_REMINDER_MAX);
  return Number.isFinite(n) && n > 0 ? Math.min(20, Math.floor(n)) : 5;
}

/**
 * Paginates all auth users and sends Resend reminders to accounts that registered
 * but have not confirmed email yet. Cooldown + max count tracked in user_metadata
 * to avoid hammering the same inbox.
 */
export async function runRegistrationReminders(): Promise<{
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
  const cooldownMs = reminderCooldownMs();
  const maxReminders = reminderMaxPerUser();

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

    for (const user of data.users) {
      scanned++;

      const email = user.email?.trim().toLowerCase();
      if (!email || user.email_confirmed_at || user.is_anonymous) {
        skipped++;
        continue;
      }

      eligible++;

      const meta = { ...(typeof user.user_metadata === "object" && user.user_metadata !== null ? user.user_metadata : {}) } as Record<
        string,
        unknown
      >;
      const lastRaw = meta.last_registration_reminder_at;
      const count = typeof meta.registration_reminder_count === "number" ? meta.registration_reminder_count : 0;

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

      const redirectTo = `${resendEnv.appUrl}/auth/callback?next=${encodeURIComponent("/account")}`;
      let confirmUrl = `${resendEnv.appUrl}/login`;

      const gl = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });
      if (!gl.error && gl.data?.properties?.action_link) {
        confirmUrl = gl.data.properties.action_link;
      }

      const result = await sendUnverifiedRegistrationReminderEmail({ to: email, confirmUrl });
      if (!result.ok) {
        failed++;
        await sleep(200);
        continue;
      }

      const { error: upErr } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...meta,
          last_registration_reminder_at: new Date().toISOString(),
          registration_reminder_count: count + 1,
        },
      });

      if (upErr) {
        failed++;
      } else {
        sent++;
      }

      await sleep(400);
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return { scanned, eligible, sent, skipped, failed };
}
