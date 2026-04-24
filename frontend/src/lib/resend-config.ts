const DEFAULT_SUPPORT_INBOX = "ragesupportpage@gmail.com";

export type ResendMailEnv = {
  apiKey: string;
  from: string;
  supportInbox: string;
  appUrl: string;
};

/** Server-only. Returns null if Resend is not configured (missing key or from). */
export function getResendMailEnv(): ResendMailEnv | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return null;
  const supportInbox = process.env.RESEND_SUPPORT_INBOX?.trim() || DEFAULT_SUPPORT_INBOX;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return { apiKey, from, supportInbox, appUrl };
}
