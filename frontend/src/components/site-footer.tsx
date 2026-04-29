"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/create-event") return null;

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-black text-zinc-300">
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[300px]"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(75,250,148,0.05), transparent 70%)" }}
      />
      <div className="container-page relative z-10 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr,1fr,1fr,1fr]">
          <div>
            <Image src="/rage-logo.png" alt="RAGE" width={140} height={42} className="h-7 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Student events, upfront pricing, mobile tickets. Built for college nights.
            </p>
            <div className="mt-6 flex gap-2">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200"
              >
                Get the app
              </Link>
              <Link
                href="/create-event"
                className="inline-flex h-10 items-center rounded-full border border-white/[0.14] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-white/40"
              >
                Create event
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4BFA94]">Host tools</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/create-event" className="transition hover:text-white">Create event</Link></li>
              <li><Link href="/dashboard" className="transition hover:text-white">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4BFA94]">User</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/demo" className="transition hover:text-white">Sample event</Link></li>
              <li><Link href="/my-tickets" className="transition hover:text-white">My tickets</Link></li>
              <li><Link href="/login" className="transition hover:text-white">Login</Link></li>
              <li><Link href="/signup" className="transition hover:text-white">Sign up</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4BFA94]">Company</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><a href="mailto:partnerships@rage.events?subject=Business%20Inquiry%20-%20RAGE" className="transition hover:text-white">Work with us</a></li>
              <li><Link href="/terms" className="transition hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-[11px] text-zinc-600 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} RAGE. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="uppercase tracking-[0.18em]">Secure checkout · Mobile tickets · Fast door entry</p>
            <span className="hidden text-zinc-700 sm:inline">•</span>
            <Link href="/terms" className="transition hover:text-zinc-300">Terms</Link>
            <span className="text-zinc-700">•</span>
            <Link href="/privacy" className="transition hover:text-zinc-300">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
