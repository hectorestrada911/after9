import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape-html";
import { getResendMailEnv } from "@/lib/resend-config";

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "config" | "send"; message?: string };

function dataUrlToBase64(dataUrl: string): string | null {
  const m = /^data:image\/png;base64,(.+)$/i.exec(dataUrl.trim());
  return m ? m[1]! : null;
}

/** One-time host welcome after profile onboarding (Resend). */
export async function sendHostWelcomeEmail(params: { to: string; displayName: string }): Promise<SendResult> {
  const env = getResendMailEnv();
  if (!env) return { ok: false, reason: "config", message: "RESEND_API_KEY or RESEND_FROM_EMAIL missing." };

  const name = escapeHtml(params.displayName.trim() || "there");
  const resend = new Resend(env.apiKey);
  const html = `
    <p>Hi ${name},</p>
    <p>Welcome to <strong>RAGE</strong> — you’re set up to publish events, sell tickets, and run check-in from one place.</p>
    <p><strong>Next steps</strong></p>
    <ul>
      <li>Create your first event from the dashboard.</li>
      <li>Share your public link; guests pay with cards and get mobile tickets with QR codes.</li>
      <li>Use <strong>Scan QR</strong> at the door to check people in fast.</li>
    </ul>
    <p style="margin-top:1.25rem;">
      <a href="${escapeHtml(env.appUrl + "/dashboard/events/new")}" style="color:#111;font-weight:600;">Create an event →</a>
    </p>
    <p style="margin-top:1.5rem;color:#666;font-size:14px;">— RAGE</p>
  `;

  const { error } = await resend.emails.send({
    from: env.from,
    to: [params.to],
    replyTo: env.supportInbox,
    subject: "Welcome to RAGE",
    html,
    text: `Hi ${params.displayName.trim() || "there"},\n\nWelcome to RAGE. Create your first event: ${env.appUrl}/dashboard/events/new\n\n— RAGE`,
    tags: [{ name: "type", value: "welcome_host" }],
  });

  if (error) return { ok: false, reason: "send", message: error.message };
  return { ok: true };
}

export type TicketLine = { ticketCode: string; qrDataUrl: string | null };

/** Buyer receipt after payment: event details + inline QR images (CID). */
export async function sendTicketPurchaseConfirmation(params: {
  to: string;
  buyerName: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: string;
  eventStartTime: string;
  eventLocation: string;
  tickets: TicketLine[];
}): Promise<SendResult> {
  const env = getResendMailEnv();
  if (!env) return { ok: false, reason: "config", message: "RESEND_API_KEY or RESEND_FROM_EMAIL missing." };

  const resend = new Resend(env.apiKey);
  const buyer = escapeHtml(params.buyerName.trim() || "Guest");
  const title = escapeHtml(params.eventTitle);
  const when = escapeHtml(`${params.eventDate} · ${params.eventStartTime}`);
  const where = escapeHtml(params.eventLocation);
  const eventUrl = `${env.appUrl}/events/${encodeURIComponent(params.eventSlug)}`;
  const ticketsUrl = `${env.appUrl}/my-tickets`;

  const attachments: {
    filename: string;
    content: string;
    contentId: string;
    contentType: string;
  }[] = [];

  const qrBlocks: string[] = [];
  params.tickets.forEach((t, i) => {
    const cid = `ticket-qr-${i}`;
    const code = escapeHtml(t.ticketCode);
    if (t.qrDataUrl) {
      const b64 = dataUrlToBase64(t.qrDataUrl);
      if (b64) {
        attachments.push({
          filename: `rage-ticket-${i + 1}.png`,
          content: b64,
          contentId: cid,
          contentType: "image/png",
        });
        qrBlocks.push(
          `<div style="margin-bottom:28px;padding:16px;border:1px solid #e5e5e5;border-radius:12px;">
            <p style="margin:0 0 8px;font-family:ui-monospace,monospace;font-size:13px;font-weight:600;">${code}</p>
            <img src="cid:${cid}" width="200" height="200" alt="Ticket QR" style="display:block;border-radius:8px;" />
          </div>`,
        );
        return;
      }
    }
    qrBlocks.push(
      `<div style="margin-bottom:16px;padding:12px;border:1px solid #e5e5e5;border-radius:12px;">
        <p style="margin:0;font-family:ui-monospace,monospace;font-size:13px;font-weight:600;">${code}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#666;">Open <a href="${escapeHtml(ticketsUrl)}">My tickets</a> to view your QR.</p>
      </div>`,
    );
  });

  const html = `
    <p>Hi ${buyer},</p>
    <p>Thanks for your purchase. You’re going to <strong>${title}</strong>.</p>
    <p style="margin:12px 0;"><strong>When:</strong> ${when}<br/><strong>Where:</strong> ${where}</p>
    <p style="margin:12px 0;"><a href="${escapeHtml(eventUrl)}">Event page →</a> · <a href="${escapeHtml(ticketsUrl)}">My tickets →</a></p>
    <p style="margin:20px 0 8px;font-weight:700;">Your ticket${params.tickets.length > 1 ? "s" : ""}</p>
    ${qrBlocks.join("\n")}
    <p style="margin-top:24px;font-size:13px;color:#666;">Show each QR at the door. If images don’t load, open My tickets in your browser.</p>
    <p style="margin-top:1.5rem;color:#666;font-size:14px;">— RAGE</p>
  `;

  const codesText = params.tickets.map((t) => t.ticketCode).join("\n");
  const text = `Hi ${params.buyerName.trim() || "Guest"},\n\nThanks for your purchase for ${params.eventTitle}.\nWhen: ${params.eventDate} ${params.eventStartTime}\nWhere: ${params.eventLocation}\n\nTickets:\n${codesText}\n\nEvent: ${eventUrl}\nMy tickets: ${ticketsUrl}\n\n— RAGE`;

  const base = {
    from: env.from,
    to: [params.to],
    replyTo: env.supportInbox,
    subject: `Your tickets · ${params.eventTitle}`,
    html,
    text,
    tags: [{ name: "type", value: "ticket_purchase" }],
  };

  const withAttachments = await resend.emails.send({
    ...base,
    attachments: attachments.length ? attachments : undefined,
  });
  if (!withAttachments.error) return { ok: true };

  // Fallback: some providers reject large inline attachments; still deliver ticket codes + links.
  const withoutAttachments = await resend.emails.send(base);
  if (withoutAttachments.error) {
    return { ok: false, reason: "send", message: withoutAttachments.error.message || withAttachments.error.message };
  }
  return { ok: true };
}
