import { escapeHtml } from "@/lib/escape-html";

export function rageEmailDocument(params: {
  preheader: string;
  title: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const pre = escapeHtml(params.preheader);
  const title = escapeHtml(params.title);
  const footer = escapeHtml(params.footerNote ?? "RAGE · Mobile tickets, fast check-in, built for college nights.");

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
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#000000 !important;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${pre}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#000000" style="background:#000000 !important;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" class="container" bgcolor="#070707" style="width:600px;max-width:600px;border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:#070707 !important;box-shadow:0 0 0 1px rgba(75,250,148,0.08),0 30px 90px -45px rgba(0,0,0,0.95);">
            <tr>
              <td class="px" bgcolor="#0A0A0A" style="padding:22px 26px;background:#0A0A0A !important;border-bottom:1px solid rgba(255,255,255,0.10);">
                <div style="height:3px;width:74px;border-radius:999px;background:linear-gradient(90deg,#4BFA94,#86EFAC);margin:0 0 12px;"></div>
                <p style="margin:0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.72);font-weight:800;">RAGE</p>
                <p style="margin:10px 0 0;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:22px;line-height:1.15;font-weight:900;color:#ffffff;">${title}</p>
              </td>
            </tr>
            <tr>
              <td class="px" bgcolor="#070707" style="padding:22px 26px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;color:rgba(255,255,255,0.90);font-size:15px;line-height:1.65;background:#070707 !important;">
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
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:18px 0 6px;">
    <tr>
      <td style="border-radius:999px;background:linear-gradient(90deg,#4BFA94,#86EFAC);">
        <a href="${safeHref}" style="display:inline-block;padding:12px 18px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial;font-size:12px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#030303;text-decoration:none;">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </table>`;
}

export function rageSecondaryLink(label: string, href: string): string {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeHtml(href);
  return `<p style="margin:10px 0 0;">
    <a href="${safeHref}" style="color:#4BFA94;font-weight:800;text-decoration:none;border-bottom:1px solid rgba(75,250,148,0.35);">${safeLabel}</a>
  </p>`;
}
