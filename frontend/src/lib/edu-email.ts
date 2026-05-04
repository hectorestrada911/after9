export type EduParseResult = { ok: true; email: string } | { ok: false; message: string };

/** Domains we never treat as real campus inboxes (dev / placeholder). */
const BLOCKED_DOMAINS = new Set(["example.edu", "test.edu", "sample.edu", "invalid.edu"]);

/**
 * Normalizes and validates a US-style campus email (must end in `.edu`).
 * International campuses (e.g. `.ac.uk`) are out of scope until you add explicit allowlists.
 */
export function parseEduEmail(raw: string): EduParseResult {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, message: "Enter your school email." };
  }
  if (trimmed.length > 254) {
    return { ok: false, message: "That email is too long." };
  }
  const at = trimmed.lastIndexOf("@");
  if (at < 1 || at === trimmed.length - 1) {
    return { ok: false, message: "Enter a valid email address." };
  }
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!local || !domain.includes(".")) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (!domain.endsWith(".edu")) {
    return { ok: false, message: "Use an official address that ends with .edu." };
  }
  if (BLOCKED_DOMAINS.has(domain)) {
    return { ok: false, message: "Use your real school email address." };
  }
  if (local.length > 64) {
    return { ok: false, message: "That local part is too long." };
  }
  return { ok: true, email: trimmed };
}
