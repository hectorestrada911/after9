import { escapeHtml } from "@/lib/escape-html";

export function rageEmailDocument(params: {
  preheader: string;
  title: string;
  eyebrow?: string;
  deck?: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const pre = escapeHtml(params.preheader);
  const title = escapeHtml(params.title);
  const footer = escapeHtml(params.footerNote ?? "RAGE · Mobile tickets, fast check-in, built for college nights.");
  const eyebrowBlock = params.eyebrow
    ? `<p style="margin:0 0 12px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:rgba(75,250,148,0.9);font-weight:900;">${escapeHtml(params.eyebrow)}</p>`
    : "";
  const deckBlock = params.deck
    ? `<p style="margin:14px 0 0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:15px;line-height:1.5;font-weight:500;color:rgba(255,255,255,0.58);">${escapeHtml(params.deck)}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${title}</title>
    <style>
      :root { color-scheme: dark; supported-color-schemes: dark; }
      @media (max-width: 620px) {
        .container { width: 100% !important; }
        .px { padding-left: 18px !important; padding-right: 18px !important; }
        .benefit-stack td { display: block !important; width: 100% !important; padding-bottom: 10px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#000000 !important;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${pre}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#000000" style="background:#000000 !important;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" class="container" bgcolor="#070707" style="width:600px;max-width:600px;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.14);background:linear-gradient(180deg,#0a0a0a 0%,#070707 48%,#050505 100%) !important;box-shadow:0 0 0 1px rgba(75,250,148,0.1),0 32px 100px -48px rgba(0,0,0,0.95),0 0 80px -60px rgba(75,250,148,0.15);">
            <tr>
              <td class="px" bgcolor="#0A0A0A" style="padding:24px 26px 22px;background:linear-gradient(180deg,rgba(75,250,148,0.07) 0%,rgba(10,10,10,0.98) 42%) !important;border-bottom:1px solid rgba(255,255,255,0.10);">
                ${eyebrowBlock}
                <div style="height:3px;width:88px;border-radius:999px;background:linear-gradient(90deg,#4BFA94,#86EFAC,#4BFA94);margin:0 0 14px;box-shadow:0 0 18px rgba(75,250,148,0.35);"></div>
                <p style="margin:0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.68);font-weight:800;">RAGE</p>
                <p style="margin:12px 0 0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:24px;line-height:1.12;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${title}</p>
                ${deckBlock}
              </td>
            </tr>
            <tr>
              <td class="px" bgcolor="#070707" style="padding:24px 26px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;color:rgba(255,255,255,0.90);font-size:15px;line-height:1.65;background:#070707 !important;">
                ${params.bodyHtml}
              </td>
            </tr>
            <tr>
              <td class="px" style="padding:0 26px 22px;">
                <div style="height:1px;background:rgba(255,255,255,0.10);"></div>
                <p style="margin:14px 0 0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.55);">${footer}</p>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:11px;line-height:1.6;color:rgba(255,255,255,0.35);max-width:600px;">
            If this email looks odd, open it in your phone’s mail app. For help, reply to this message.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function ragePrimaryButton(label: string, href: string): string {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeHtml(href);
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0 8px;">
    <tr>
      <td style="border-radius:999px;background:linear-gradient(92deg,#4BFA94 0%,#86EFAC 50%,#4BFA94 100%);box-shadow:0 10px 32px -12px rgba(75,250,148,0.65),inset 0 1px 0 rgba(255,255,255,0.35);">
        <a href="${safeHref}" style="display:inline-block;padding:14px 24px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:12px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:#030303;text-decoration:none;">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Highlight row of three value props (transactional marketing). */
export function rageBenefitStrip(items: { kicker: string; body: string }[]): string {
  const gap = `<td class="benefit-gap" style="width:12px;font-size:0;line-height:0;">&nbsp;</td>`;
  const cells = items
    .map(
      (item) => `<td class="benefit-stack" style="width:32%;vertical-align:top;">
        <div style="border-radius:16px;padding:15px 14px 17px;background:linear-gradient(155deg,rgba(75,250,148,0.14) 0%,rgba(255,255,255,0.04) 100%);border:1px solid rgba(75,250,148,0.28);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),0 12px 40px -28px rgba(0,0,0,0.9);">
          <p style="margin:0;font-size:10px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:#a7f3c8;">${escapeHtml(item.kicker)}</p>
          <p style="margin:10px 0 0;font-size:13px;line-height:1.45;color:rgba(255,255,255,0.82);">${escapeHtml(item.body)}</p>
        </div>
      </td>`,
    )
    .join(gap);
  return `<table role="presentation" class="benefit-row" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 6px;border-collapse:separate;"><tr>${cells}</tr></table>`;
}

export function rageSecondaryLink(label: string, href: string): string {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeHtml(href);
  return `<p style="margin:10px 0 0;">
    <a href="${safeHref}" style="color:#4BFA94;font-weight:800;text-decoration:none;border-bottom:1px solid rgba(75,250,148,0.35);">${safeLabel}</a>
  </p>`;
}
