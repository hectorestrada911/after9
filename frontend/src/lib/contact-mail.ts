import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape-html";
import { rageEmailDocument } from "@/lib/email-layout";
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

  const teamBody = `
    <p style="margin:0 0 12px;color:rgba(255,255,255,0.72);font-size:11px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">New contact form message</p>
    <p style="margin:0 0 14px;"><strong style="color:#ffffff;">Name:</strong> ${safeName}<br/>
    <strong style="color:#ffffff;">Email:</strong> ${safeEmail}</p>
    <p style="margin:0 0 10px;color:rgba(255,255,255,0.62);font-size:11px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">Message</p>
    <div style="border-radius:16px;border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.03);padding:14px;">
      <p style="margin:0;white-space:pre-wrap;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.65;">${safeMessage}</p>
    </div>
  `;
  const teamHtml = rageEmailDocument({
    preheader: `New RAGE contact message from ${name}.`,
    title: "Support inbox",
    bodyHtml: teamBody,
    footerNote: "This message was submitted from rage.events/contact.",
  });

  const autoBody = `
    <p style="margin:0 0 14px;">Hi ${safeName},</p>
    <p style="margin:0 0 14px;">Thanks for reaching out — we received your message and will reply within <strong style="color:#ffffff;">24 hours</strong> on business days.</p>
    <p style="margin:0;color:rgba(255,255,255,0.62);font-size:14px;line-height:1.65;">If it’s urgent, reply to this email and it routes straight to our support inbox.</p>
  `;
  const autoHtml = rageEmailDocument({
    preheader: "We received your message — RAGE support.",
    title: "We got your message",
    bodyHtml: autoBody,
  });

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
