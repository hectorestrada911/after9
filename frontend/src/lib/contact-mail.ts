import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape-html";
import { getResendMailEnv } from "@/lib/resend-config";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

/**
 * Sends (1) notification to the support inbox and (2) auto-reply to the visitor.
 * Requires RESEND_API_KEY and RESEND_FROM_EMAIL. RESEND_SUPPORT_INBOX overrides the default Gmail inbox.
 */
export async function sendContactSubmission(payload: ContactPayload): Promise<
  | { ok: true }
  | { ok: false; reason: "config"; detail?: string }
  | { ok: false; reason: "send"; detail: string }
> {
  const env = getResendMailEnv();
  if (!env) {
    return {
      ok: false,
      reason: "config",
      detail: !process.env.RESEND_API_KEY?.trim() ? "RESEND_API_KEY is not set." : "RESEND_FROM_EMAIL is not set.",
    };
  }

  const { apiKey, from, supportInbox } = env;
  const resend = new Resend(apiKey);
  const { name, email, message } = payload;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r\n|\r|\n/g, "<br/>");

  const teamHtml = `
    <p><strong>New message</strong> from the RAGE contact form.</p>
    <p><strong>Name:</strong> ${safeName}<br/>
    <strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap;font-family:system-ui,sans-serif;">${safeMessage}</p>
  `;

  const autoHtml = `
    <p>Hi ${safeName},</p>
    <p>Thanks for reaching out — we received your message and will get back to you within <strong>24 hours</strong> on business days.</p>
    <p>If your question is urgent, reply to this email and it will go to our support inbox.</p>
    <p style="margin-top:1.5rem;color:#666;font-size:14px;">— RAGE</p>
  `;

  const [toTeam, toUser] = await Promise.all([
    resend.emails.send({
      from,
      to: [supportInbox],
      replyTo: email,
      subject: `RAGE contact: ${name}`,
      html: teamHtml,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
    resend.emails.send({
      from,
      to: [email],
      replyTo: supportInbox,
      subject: "We received your message",
      html: autoHtml,
      text: `Hi ${name},\n\nThanks for reaching out — we received your message and will get back to you within 24 hours on business days.\n\n— RAGE`,
    }),
  ]);

  const errMsg = toTeam.error?.message ?? toUser.error?.message;
  if (toTeam.error || toUser.error) {
    return { ok: false, reason: "send", detail: errMsg || "Email send failed." };
  }

  return { ok: true };
}
