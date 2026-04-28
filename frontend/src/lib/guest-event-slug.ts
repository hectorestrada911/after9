/**
 * Normalize slug from the URL or checkout payload so DB lookups match shared links
 * (trim, decode once, strip accidental slashes).
 */
export function normalizeGuestEventSlug(raw: unknown): string {
  let s = String(raw ?? "").trim();
  if (!s) return "";
  try {
    s = decodeURIComponent(s);
  } catch {
    // keep trimmed raw
  }
  return s.replace(/^\/+|\/+$/g, "").trim();
}

export function isUuidString(value: unknown): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value));
}
