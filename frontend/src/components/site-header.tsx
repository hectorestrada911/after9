"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/create-event") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#030303]/90 backdrop-blur-xl">
      <div className="container-page flex h-[3.25rem] min-w-0 items-center gap-3 sm:h-16 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/rage-logo.png" alt="RAGE" width={160} height={48} className="h-8 w-auto object-contain sm:h-10" priority />
        </Link>

        <div className="hidden h-10 min-w-0 flex-1 items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-4 md:flex">
          <Search size={15} className="shrink-0 text-zinc-500" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search events, venues, cities"
            className="ml-3 w-full min-w-0 border-0 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-zinc-400 lg:ml-0 lg:flex">
          <Link href="/dashboard" className="transition hover:text-white">
            My tickets
          </Link>
          <Link href="/" className="transition hover:text-white">
            Browse
          </Link>
          <Link href="/demo-flow" className="transition hover:text-white">
            Demo
          </Link>
          <Link href="/login" className="transition hover:text-white">
            Host login
          </Link>
        </nav>

        <Link
          href="/create-event"
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-200 sm:ml-auto sm:h-10 sm:px-5 sm:text-[11px]"
        >
          Create event
        </Link>
      </div>
    </header>
  );
}
