/**
 * Lightweight client-side events. Wire GA4 / PostHog later by extending this module.
 * Safe to call from the browser only.
 */
export function trackProductEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("event", name, params ?? {});
  }
}
