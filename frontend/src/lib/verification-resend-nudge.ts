/**
 * Server-only: confirms an auth user exists for this email and is still unverified,
 * so we only send the nudge to real pending signups (not arbitrary inboxes).
 */
export async function shouldSendVerificationResendNudge(normalizedEmail: string): Promise<boolean> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!base || !key) return false;

  const filter = encodeURIComponent(`email.eq.${normalizedEmail}`);
  const res = await fetch(`${base}/auth/v1/admin/users?per_page=50&filter=${filter}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return false;

  const json = (await res.json()) as {
    users?: { email?: string | null; email_confirmed_at?: string | null }[];
  };
  const users = json.users ?? [];
  const match = users.find((u) => u.email?.toLowerCase() === normalizedEmail);
  return Boolean(match && !match.email_confirmed_at);
}
