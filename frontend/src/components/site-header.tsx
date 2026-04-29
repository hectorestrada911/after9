"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type NavDropdownProps = {
  label: string;
  menuId: string;
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void; // eslint-disable-line no-unused-vars -- callback parameter names document the API
  children: ReactNode;
};

function NavDropdown({ label, menuId, open, onOpenChange, children }: NavDropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
        className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-sm font-medium text-zinc-300 transition hover:text-white"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[220px] rounded-xl border border-white/[0.1] bg-[#0a0a0a] py-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04]"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function menuLinkClass(highlight?: boolean) {
  return `block w-full px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${
    highlight ? "font-semibold text-brand-green hover:text-emerald-300" : "font-medium text-zinc-200 hover:text-white"
  }`;
}

export function SiteHeader() {
  const supabase = getSupabaseBrowserClient();
  const pathname = usePathname();
  const hideHeader = pathname === "/create-event";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<"host" | "user" | null>(null);
  const hostMenuId = useId();
  const userMenuId = useId();

  const closeMenus = useCallback(() => setOpenMenu(null), []);

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
    closeMenus();
  }

  if (hideHeader) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#030303]/90 backdrop-blur-xl">
      <div className="container-page flex h-[3.25rem] min-w-0 items-center gap-3 sm:h-16 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center" onClick={closeMenus}>
          <Image src="/rage-logo.png" alt="RAGE" width={160} height={48} className="h-8 w-auto object-contain sm:h-10" priority loading="eager" />
        </Link>

        <div className="hidden h-10 min-w-0 flex-1 items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-4 md:flex">
          <Search size={15} className="shrink-0 text-zinc-500" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search events, venues, cities"
            className="ml-3 w-full min-w-0 border-0 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-1 text-sm lg:ml-0 lg:flex">
          <NavDropdown
            label="Host tools"
            menuId={hostMenuId}
            open={openMenu === "host"}
            onOpenChange={(next) => setOpenMenu(next ? "host" : null)}
          >
            {authedEmail ? (
              <>
                <Link href="/account#my-events" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  My events
                </Link>
                <Link href="/dashboard#scan-qr" role="menuitem" className={menuLinkClass(true)} onClick={closeMenus}>
                  Scan QR
                </Link>
                <Link href="/dashboard" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  Events &amp; analytics
                </Link>
              </>
            ) : (
              <Link href="/dashboard" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                Host dashboard
              </Link>
            )}
          </NavDropdown>

          <NavDropdown
            label="User"
            menuId={userMenuId}
            open={openMenu === "user"}
            onOpenChange={(next) => setOpenMenu(next ? "user" : null)}
          >
            {authedEmail ? (
              <>
                <Link href="/account" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  Account
                </Link>
                <Link href="/my-tickets" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  My tickets
                </Link>
                <Link href="/contact" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  Contact
                </Link>
                <div className="my-1 border-t border-white/[0.08]" role="separator" />
                <button type="button" role="menuitem" onClick={onSignOut} className={`${menuLinkClass()} inline-flex items-center gap-2`}>
                  <LogOut className="h-4 w-4 opacity-70" aria-hidden />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/my-tickets" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  My tickets
                </Link>
                <Link href="/demo" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  Sample event
                </Link>
                <Link href="/contact" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  Contact
                </Link>
                <div className="my-1 border-t border-white/[0.08]" role="separator" />
                <Link href="/signup" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  Register
                </Link>
                <Link href="/login" role="menuitem" className={menuLinkClass()} onClick={closeMenus}>
                  Login
                </Link>
              </>
            )}
          </NavDropdown>
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
          onClick={closeMenus}
        >
          Create event
        </Link>
      </div>
      {mobileOpen && (
        <div className="border-t border-white/[0.08] px-4 py-4 lg:hidden">
          <div className="container-page space-y-1 px-0">
            <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#4BFA94]">Host tools</p>
            {authedEmail ? (
              <>
                <Link
                  href="/account#my-events"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  My events
                </Link>
                <Link
                  href="/dashboard#scan-qr"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-semibold text-brand-green transition hover:bg-white/[0.05] hover:text-emerald-300"
                >
                  Scan QR
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Events &amp; analytics
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
              >
                Host dashboard
              </Link>
            )}

            <p className="px-2.5 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-[#4BFA94]">User</p>
            {authedEmail ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.05]"
                >
                  Account
                </Link>
                <Link
                  href="/my-tickets"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  My tickets
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Contact
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/my-tickets"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  My tickets
                </Link>
                <Link
                  href="/demo"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Sample event
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Contact
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Login
                </Link>
              </>
            )}

            <Link
              href="/create-event"
              onClick={() => setMobileOpen(false)}
              className="mt-3 block rounded-lg bg-white px-2.5 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Create event
            </Link>

            {authedEmail ? (
              <>
                <p className="inline-flex items-center gap-1.5 px-2.5 pt-3 text-xs text-zinc-500">
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                  {authedEmail}
                </p>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="mt-1 block w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
