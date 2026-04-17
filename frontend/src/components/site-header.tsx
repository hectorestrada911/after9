"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/create-event") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-[3.25rem] min-w-0 items-center gap-3 sm:h-16 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center">
          <img src="/rage-logo.svg" alt="RAGE" className="h-8 w-auto object-contain sm:h-10" />
        </Link>

        <div className="hidden h-10 flex-1 items-center rounded-full border border-neutral-200/80 bg-neutral-50/80 px-4 md:flex">
          <Search size={15} className="shrink-0 text-neutral-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search events, venues, cities"
            className="ml-3 w-full border-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-neutral-600 lg:ml-0 lg:flex">
          <Link href="/dashboard" className="transition hover:text-neutral-950">
            My tickets
          </Link>
          <Link href="/" className="transition hover:text-neutral-950">
            Browse
          </Link>
          <Link href="/demo-flow" className="transition hover:text-neutral-950">
            Demo
          </Link>
          <Link href="/login" className="transition hover:text-neutral-950">
            Host login
          </Link>
        </nav>

        <Link
          href="/create-event"
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-neutral-950 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800 sm:ml-auto sm:h-10 sm:px-5 sm:text-[11px]"
        >
          Create event
        </Link>
      </div>
    </header>
  );
}
