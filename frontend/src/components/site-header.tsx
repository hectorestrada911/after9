"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function SiteHeader() {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const hideHeader = pathname === "/create-event";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);

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

  if (hideHeader) return null;

  const navItems = [
    { href: "/dashboard", label: "Hosts" },
    { href: "/#browse-events", label: "Students" },
    { href: "/#how-it-works", label: "Blog" },
    { href: "/contact", label: "Join Us" },
    { href: "/#faq", label: "FAQs" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.04] bg-black/75 backdrop-blur-2xl">
      <div className="container-page flex h-16 items-center justify-between gap-6 sm:h-[68px]">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/rage-logo.png"
            alt="RAGE"
            width={140}
            height={42}
            className="h-7 w-auto sm:h-8"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-zinc-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {authedEmail ? (
            <>
              <Link
                href="/account"
                className="hidden h-10 items-center rounded-full bg-zinc-900 px-5 text-[14px] font-semibold text-white transition hover:bg-zinc-800 lg:inline-flex"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={onSignOut}
                className="hidden h-10 items-center text-[14px] font-medium text-zinc-400 transition hover:text-white lg:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-full bg-zinc-900 px-5 text-[14px] font-semibold text-white transition hover:bg-zinc-800 lg:inline-flex"
            >
              Login
            </Link>
          )}
          <Link
            href="/create-event"
            className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[14px] font-semibold text-black transition hover:bg-zinc-200"
          >
            Create
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition hover:text-white lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.05] py-3 lg:hidden">
          <div className="container-page space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-zinc-200 transition hover:bg-white/[0.04] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-white/[0.05] pt-2">
              {authedEmail ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white transition hover:bg-white/[0.04]"
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white transition hover:bg-white/[0.04]"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
