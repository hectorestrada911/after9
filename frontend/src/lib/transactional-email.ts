import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape-html";
import { rageEmailDocument, ragePrimaryButton, rageSecondaryLink } from "@/lib/email-layout";
import { getResendMailEnv } from "@/lib/resend-config";

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "config" | "send"; message?: string };

function prettyDate(raw: string): string {
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function prettyTime(raw: string): string {
  const [h, m] = raw.split(":");
  const hh = Number(h);
  const mm = Number(m ?? 0);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return raw;
  return new Date(2000, 0, 1, hh, mm).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

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
  const createUrl = `${env.appUrl}/dashboard/events/new`;
  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi ${name},</p>
    <p style="margin:0 0 14px;">Welcome to <strong style="color:#ffffff;">RAGE</strong>. Publish events, sell tickets, and run door check-in from one clean workflow.</p>
    <p style="margin:0 0 10px;color:rgba(255,255,255,0.72);font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:11px;">Start here</p>
    <ul style="margin:0;padding:0 0 0 18px;color:rgba(255,255,255,0.78);">
      <li style="margin:8px 0;">Create your first event (flyer, date, tickets).</li>
      <li style="margin:8px 0;">Share your guest link. Buyers get mobile tickets with QR codes.</li>
      <li style="margin:8px 0;">Use <strong style="color:#ffffff;">Scan QR</strong> at the door for fast check-in.</li>
    </ul>
    ${ragePrimaryButton("Create your first event", createUrl)}
    ${rageSecondaryLink("Open host dashboard", `${env.appUrl}/dashboard`)}
  `;
  const html = rageEmailDocument({
    preheader: "You’re set up to host on RAGE.",
    title: "Welcome to RAGE",
    bodyHtml,
  });

  const { error } = await resend.emails.send({
    from: env.from,
    to: [params.to],
    replyTo: env.supportInbox,
    subject: "Welcome to RAGE — you’re ready to host",
    html,
    text: `Hi ${params.displayName.trim() || "there"},\n\nWelcome to RAGE. Create your first event: ${env.appUrl}/dashboard/events/new\n\nRAGE`,
    tags: [{ name: "type", value: "welcome_host" }],
  });

  if (error) return { ok: false, reason: "send", message: error.message };
  return { ok: true };
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return "there";
  const cleaned = local.replace(/[._+-]+/g, " ").trim();
  if (!cleaned) return "there";
  return cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Sent right after a user successfully triggers “Resend verification” — companion to Supabase’s
 * confirmation email. Motivates finishing signup and creating a first event (Resend).
 */
export async function sendVerificationResendNudgeEmail(params: { to: string }): Promise<SendResult> {
  const env = getResendMailEnv();
  if (!env) return { ok: false, reason: "config", message: "RESEND_API_KEY or RESEND_FROM_EMAIL missing." };

  const name = escapeHtml(displayNameFromEmail(params.to));
  const resend = new Resend(env.apiKey);
  const loginUrl = `${env.appUrl}/login`;
  const createUrl = `${env.appUrl}/create-event`;

  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi ${name},</p>
    <p style="margin:0 0 14px;">We just sent a <strong style="color:#ffffff;">fresh confirmation link</strong> to this inbox. Tap it once — then your account unlocks and you can move fast.</p>
    <p style="margin:0 0 14px;color:rgba(255,255,255,0.78);">Here’s what happens next (and why hosts don’t wait): your flyer, your story, tickets live in minutes — and a clean QR check-in at the door so the night feels professional, not chaotic.</p>
    <p style="margin:0 0 10px;color:rgba(255,255,255,0.72);font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:11px;">You’re one step from your first night</p>
    <ul style="margin:0;padding:0 0 0 18px;color:rgba(255,255,255,0.78);">
      <li style="margin:8px 0;"><strong style="color:#ffffff;">Confirm</strong> using the email that just arrived.</li>
      <li style="margin:8px 0;"><strong style="color:#ffffff;">Publish</strong> your event — buyers get mobile tickets instantly.</li>
      <li style="margin:8px 0;"><strong style="color:#ffffff;">Run the door</strong> with Scan QR when it’s showtime.</li>
    </ul>
    ${ragePrimaryButton("Confirm, then open RAGE", loginUrl)}
    ${rageSecondaryLink("Preview the create flow (after you verify)", createUrl)}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.55);">If you didn’t request this, you can ignore this note — your account stays as-is.</p>
  `;

  const html = rageEmailDocument({
    preheader: "Confirm your email — then publish your first event in minutes.",
    title: "You’re one tap away",
    bodyHtml,
  });

  const { error } = await resend.emails.send({
    from: env.from,
    to: [params.to],
    replyTo: env.supportInbox,
    subject: "You’re one tap away — then let’s host your first night on RAGE",
    html,
    text: `Hi ${displayNameFromEmail(params.to)},\n\nWe just sent a fresh confirmation link to this inbox. Tap it once to unlock your account.\n\nThen create your first event: ${createUrl}\n\nSign in: ${loginUrl}\n\n— RAGE`,
    tags: [{ name: "type", value: "verification_resend_nudge" }],
  });

  if (error) return { ok: false, reason: "send", message: error.message };
  return { ok: true };
}

/**
 * Scheduled reminder for users who signed up but have not confirmed email yet (cron + Resend).
 * `confirmUrl` should be a Supabase magic link when available, otherwise the login page.
 */
export async function sendUnverifiedRegistrationReminderEmail(params: {
  to: string;
  confirmUrl: string;
}): Promise<SendResult> {
  const env = getResendMailEnv();
  if (!env) return { ok: false, reason: "config", message: "RESEND_API_KEY or RESEND_FROM_EMAIL missing." };

  const name = escapeHtml(displayNameFromEmail(params.to));
  const resend = new Resend(env.apiKey);
  const loginUrl = `${env.appUrl}/login`;
  const createUrl = `${env.appUrl}/create-event`;

  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi ${name},</p>
    <p style="margin:0 0 14px;">You started a <strong style="color:#ffffff;">RAGE</strong> account — your spot is saved. Finish confirming your email and you can publish a night in minutes: flyer, tickets, and QR check-in in one flow.</p>
    <p style="margin:0 0 10px;color:rgba(255,255,255,0.72);font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:11px;">Why hosts finish this step</p>
    <ul style="margin:0;padding:0 0 0 18px;color:rgba(255,255,255,0.78);">
      <li style="margin:8px 0;"><strong style="color:#ffffff;">Fast publish</strong> — get your guest link live without extra tools.</li>
      <li style="margin:8px 0;"><strong style="color:#ffffff;">Clean door</strong> — Scan QR keeps the line moving.</li>
      <li style="margin:8px 0;"><strong style="color:#ffffff;">Built for college nights</strong> — student-first, mobile-first.</li>
    </ul>
    ${ragePrimaryButton("Confirm & open RAGE", params.confirmUrl)}
    ${rageSecondaryLink("Go to sign in", loginUrl)}
    <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.55);">Button not working? Open <a href="${escapeHtml(loginUrl)}" style="color:#4BFA94;font-weight:700;text-decoration:none;">${escapeHtml(loginUrl)}</a> and use <strong style="color:#ffffff;">Resend verification</strong>.</p>
    ${rageSecondaryLink("After you’re in: create an event", createUrl)}
    <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.45);">If you didn’t sign up for RAGE, you can ignore this.</p>
  `;

  const html = rageEmailDocument({
    preheader: "Finish confirming your email — then publish your first night on RAGE.",
    title: "Your account is waiting",
    bodyHtml,
  });

  const textName = displayNameFromEmail(params.to);
  const { error } = await resend.emails.send({
    from: env.from,
    to: [params.to],
    replyTo: env.supportInbox,
    subject: "Finish your RAGE signup — one tap to confirm",
    html,
    text: `Hi ${textName},\n\nYou started a RAGE account. Confirm your email to finish signup:\n${params.confirmUrl}\n\nSign in or resend verification: ${loginUrl}\n\nCreate an event (after you verify): ${createUrl}\n\n— RAGE`,
    tags: [{ name: "type", value: "unverified_registration_reminder" }],
  });

  if (error) return { ok: false, reason: "send", message: error.message };
  return { ok: true };
}

/** Reminder for verified hosts who have not published any event yet (cron + Resend). */
export async function sendCreateEventReminderEmail(params: { to: string; displayName: string }): Promise<SendResult> {
  const env = getResendMailEnv();
  if (!env) return { ok: false, reason: "config", message: "RESEND_API_KEY or RESEND_FROM_EMAIL missing." };

  const name = escapeHtml(params.displayName.trim() || displayNameFromEmail(params.to));
  const resend = new Resend(env.apiKey);
  const createUrl = `${env.appUrl}/create-event`;
  const dashboardUrl = `${env.appUrl}/dashboard`;

  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi ${name},</p>
    <p style="margin:0 0 14px;">You’re verified on <strong style="color:#ffffff;">RAGE</strong> — the fastest next step is to put your first night on the map. Flyer, story, tickets, and QR check-in are built into one flow so you’re not juggling five apps the week of the party.</p>
    <p style="margin:0 0 10px;color:rgba(255,255,255,0.72);font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:11px;">What you’ll have in minutes</p>
    <ul style="margin:0;padding:0 0 0 18px;color:rgba(255,255,255,0.78);">
      <li style="margin:8px 0;">A shareable event page buyers can trust.</li>
      <li style="margin:8px 0;">Mobile tickets with QR codes — no PDF chaos.</li>
      <li style="margin:8px 0;"><strong style="color:#ffffff;">Scan QR</strong> at the door so the line moves.</li>
    </ul>
    ${ragePrimaryButton("Create your first event", createUrl)}
    ${rageSecondaryLink("Open your dashboard", dashboardUrl)}
    <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.45);">Not planning to host? You can ignore this — we’ll only nudge occasionally.</p>
  `;

  const html = rageEmailDocument({
    preheader: "Publish your first night on RAGE — flyer, tickets, and door check-in in one place.",
    title: "Ready to run your first night?",
    bodyHtml,
  });

  const plainName = params.displayName.trim() || displayNameFromEmail(params.to);
  const { error } = await resend.emails.send({
    from: env.from,
    to: [params.to],
    replyTo: env.supportInbox,
    subject: "Your first RAGE event is still one session away",
    html,
    text: `Hi ${plainName},\n\nYou’re set up on RAGE — create your first event here:\n${createUrl}\n\nDashboard: ${dashboardUrl}\n\n— RAGE`,
    tags: [{ name: "type", value: "create_event_reminder" }],
  });

  if (error) return { ok: false, reason: "send", message: error.message };
  return { ok: true };
}

export type TicketLine = { ticketCode: string; qrDataUrl: string | null };

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Best-effort retries for flaky provider/network blips during webhooks. */
export async function sendTicketPurchaseConfirmationWithRetry(
  params: Parameters<typeof sendTicketPurchaseConfirmation>[0],
  opts?: { attempts?: number; delayMs?: number },
): Promise<SendResult> {
  const attempts = Math.max(1, Math.min(5, opts?.attempts ?? 3));
  const delayMs = Math.max(0, opts?.delayMs ?? 650);
  let last: SendResult = { ok: false, reason: "send", message: "Unknown error." };

  for (let i = 0; i < attempts; i += 1) {
    last = await sendTicketPurchaseConfirmation(params);
    if (last.ok) return last;
    if (i < attempts - 1 && delayMs > 0) await sleep(delayMs);
  }

  return last;
}

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
  const when = escapeHtml(`${prettyDate(params.eventDate)} · ${prettyTime(params.eventStartTime)}`);
  const where = escapeHtml(params.eventLocation);
  const eventUrl = `${env.appUrl}/events/${encodeURIComponent(params.eventSlug)}`;
  const ticketsUrl = `${env.appUrl}/my-tickets`;

  const attachments: {
    filename: string;
    content: string;
    contentId: string;
    contentType: string;
  }[] = [];

  const qrBlocksCid: string[] = [];
  const qrBlocksInline: string[] = [];
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
        qrBlocksCid.push(`
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0C0C0C" style="margin:0 0 14px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:#0C0C0C;">
            <tr>
              <td style="padding:14px 14px 10px;">
                <p style="margin:0;font-family:ui-monospace,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:12px;font-weight:900;letter-spacing:0.06em;color:rgba(255,255,255,0.86);">${code}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 14px 14px;">
                <img src="cid:${cid}" width="240" height="240" alt="Ticket QR code" style="display:block;width:240px;max-width:100%;height:auto;border-radius:14px;background:#ffffff;" />
              </td>
            </tr>
          </table>`);
        qrBlocksInline.push(`
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0C0C0C" style="margin:0 0 14px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:#0C0C0C;">
            <tr>
              <td style="padding:14px 14px 10px;">
                <p style="margin:0;font-family:ui-monospace,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:12px;font-weight:900;letter-spacing:0.06em;color:rgba(255,255,255,0.86);">${code}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 14px 14px;">
                <img src="${escapeHtml(t.qrDataUrl)}" width="240" height="240" alt="Ticket QR code" style="display:block;width:240px;max-width:100%;height:auto;border-radius:14px;background:#ffffff;" />
              </td>
            </tr>
          </table>`);
        return;
      }
    }
    qrBlocksCid.push(`
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0C0C0C" style="margin:0 0 14px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:#0C0C0C;">
        <tr>
          <td style="padding:14px;">
            <p style="margin:0;font-family:ui-monospace,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:12px;font-weight:900;letter-spacing:0.06em;color:rgba(255,255,255,0.86);">${code}</p>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.62);font-size:13px;line-height:1.55;">
              QR image couldn’t be embedded in email. Open <a href="${escapeHtml(ticketsUrl)}" style="color:#4BFA94;font-weight:900;text-decoration:none;">My tickets</a> to view your QR.
            </p>
          </td>
        </tr>
      </table>`);
    qrBlocksInline.push(qrBlocksCid[qrBlocksCid.length - 1]!);
  });

  const detailRows = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0C0C0C" style="margin:0 0 16px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:#0C0C0C;">
      <tr>
        <td style="padding:14px;">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.62);font-size:11px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">Event details</p>
          <p style="margin:0;color:rgba(255,255,255,0.86);font-size:14px;line-height:1.55;">
            <strong style="color:#ffffff;">When:</strong> ${when}<br/>
            <strong style="color:#ffffff;">Where:</strong> ${where}
          </p>
        </td>
      </tr>
    </table>`;

  const buildHtml = (qrHtml: string) =>
    rageEmailDocument({
      preheader: `Your QR tickets for ${escapeHtml(params.eventTitle)} are ready.`,
      title: "Your tickets are ready",
      bodyHtml: `
        <p style="margin:0 0 14px;">Hi ${buyer},</p>
        <p style="margin:0 0 16px;">Thanks — your purchase is confirmed for <strong style="color:#ffffff;">${title}</strong>.</p>
        ${detailRows}
        ${ragePrimaryButton("Open My tickets", ticketsUrl)}
        ${rageSecondaryLink("View event page", eventUrl)}
        <p style="margin:18px 0 10px;color:rgba(255,255,255,0.62);font-size:11px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">Your QR ticket${params.tickets.length > 1 ? "s" : ""}</p>
        ${qrHtml}
        <p style="margin:10px 0 0;color:rgba(255,255,255,0.55);font-size:13px;line-height:1.6;">
          Tip: add the QR to your Apple Wallet / Google Wallet screenshot, or keep this email handy. If images don’t load, use <strong style="color:#ffffff;">My tickets</strong>.
        </p>
      `,
    });

  const codesText = params.tickets.map((t) => t.ticketCode).join("\n");
  const text = `Hi ${params.buyerName.trim() || "Guest"},\n\nThanks for your purchase for ${params.eventTitle}.\nWhen: ${params.eventDate} ${params.eventStartTime}\nWhere: ${params.eventLocation}\n\nTickets:\n${codesText}\n\nEvent: ${eventUrl}\nMy tickets: ${ticketsUrl}\n\nRAGE`;

  const base = {
    from: env.from,
    to: [params.to],
    replyTo: env.supportInbox,
    subject: `Your RAGE tickets · ${params.eventTitle}`,
    text,
    tags: [{ name: "type", value: "ticket_purchase" }],
  };

  const htmlCid = buildHtml(qrBlocksCid.join("\n"));
  const htmlInline = buildHtml(qrBlocksInline.join("\n"));
  const qrBlocksTextOnly = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0C0C0C" style="margin:0 0 14px;border-radius:16px;border:1px solid rgba(255,255,255,0.12);background:#0C0C0C;">
      <tr>
        <td style="padding:14px;">
          <p style="margin:0 0 10px;color:rgba(255,255,255,0.62);font-size:11px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;">Ticket codes</p>
          <pre style="margin:0;font-family:ui-monospace,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:12px;line-height:1.55;color:rgba(255,255,255,0.86);white-space:pre-wrap;">${escapeHtml(codesText)}</pre>
          <p style="margin:12px 0 0;color:rgba(255,255,255,0.62);font-size:13px;line-height:1.55;">
            Your QR images are available in <a href="${escapeHtml(ticketsUrl)}" style="color:#4BFA94;font-weight:900;text-decoration:none;">My tickets</a>.
          </p>
        </td>
      </tr>
    </table>`;
  const htmlTextOnly = buildHtml(qrBlocksTextOnly);

  const withAttachments = await resend.emails.send({
    ...base,
    html: htmlCid,
    attachments: attachments.length ? attachments : undefined,
  });
  if (!withAttachments.error) return { ok: true };

  // Fallback A: some providers reject CID attachments; inline the PNG data URL.
  const inlineImages = await resend.emails.send({
    ...base,
    html: htmlInline,
  });
  if (!inlineImages.error) return { ok: true };

  // Fallback B: deliver codes + links without embedded images.
  const plain = await resend.emails.send({
    ...base,
    html: htmlTextOnly,
  });
  if (plain.error) {
    return { ok: false, reason: "send", message: plain.error.message || inlineImages.error.message || withAttachments.error.message };
  }
  return { ok: true };
}
