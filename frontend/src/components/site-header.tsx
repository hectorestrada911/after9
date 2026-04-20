"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function SiteHeader() {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  if (pathname === "/create-event") return null;

  useEffect(() => {
    let ignore = false;
    async function hydrateSession() {
      const { data } = await supabase.auth.getSession();
      if (!ignore) setAuthedEmail(data.session?.user?.email ?? null);
    }
    hydrateSession().catch(() => {
      if (!ignore) setAuthedEmail(null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthedEmail(session?.user?.email ?? null);
    });
    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  async function onSignOut() {
    await supabase.auth.signOut();
    setAuthedEmail(null);
    setMobileOpen(false);
  }

  const navItems = [
    { href: "/", label: "Browse events" },
    { href: "/demo", label: "Sample event" },
    { href: "/test", label: "Test flow" },
  ];

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
            Dashboard
          </Link>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
          {authedEmail ? (
            <button type="button" onClick={onSignOut} className="inline-flex items-center gap-1.5 text-zinc-300 transition hover:text-white">
              <LogOut className="h-4 w-4" aria-hidden />
              Logout
            </button>
          ) : (
            <Link href="/login" className="transition hover:text-white">
              Host login
            </Link>
          )}
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] text-zinc-200 transition hover:border-white/35 hover:text-white lg:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <Link
          href="/create-event"
          className="hidden h-9 shrink-0 items-center rounded-full bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-200 sm:h-10 sm:px-5 sm:text-[11px] lg:inline-flex"
        >
          Create event
        </Link>
      </div>
      {mobileOpen && (
        <div className="border-t border-white/[0.08] px-4 py-4 lg:hidden">
          <div className="container-page space-y-2 px-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/create-event"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-white px-2.5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Create event
            </Link>
            {authedEmail ? (
              <>
                <p className="inline-flex items-center gap-1.5 px-2.5 pt-2 text-xs text-zinc-500">
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                  {authedEmail}
                </p>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="block w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
              >
                Host login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
