"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/create-event") return null;

  return (
    <footer className="mt-24 border-t border-black/[0.06] bg-white">
      <div className="container-page py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src="/rage-logo.svg" alt="RAGE" className="h-9 w-auto object-contain" />
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">Student events, upfront pricing, mobile tickets.</p>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Discover</p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/" className="transition hover:text-neutral-950">
                  Browse events
                </Link>
              </li>
              <li>
                <Link href="/demo-flow" className="transition hover:text-neutral-950">
                  Demo event
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Hosts</p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/create-event" className="transition hover:text-neutral-950">
                  Create event
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-neutral-950">
                  Host login
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-neutral-950">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Company</p>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li>Get help</li>
              <li>Work with us</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-black/[0.06] pt-6 text-xs text-neutral-400 sm:flex-row">
          <p>© {new Date().getFullYear()} After9. All rights reserved.</p>
          <p>Secure checkout · Mobile tickets · Fast door entry</p>
        </div>
      </div>
    </footer>
  );
}
