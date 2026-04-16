import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "After9 - Turn your event into income",
  description: "Create, sell, and manage tickets in minutes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
          <div className="container-page flex h-14 items-center justify-between">
            <Link href="/" className="text-base font-semibold tracking-tight text-slate-100">
              After9
            </Link>
            <nav className="hidden items-center gap-1 rounded-full border border-slate-800 bg-slate-950/80 p-1 text-sm sm:flex">
              <Link href="/" className="rounded-full px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-slate-100">Overview</Link>
              <Link href="/events/campus-lights-fest" className="rounded-full px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-slate-100">Demo Event</Link>
              <Link href="/login" className="rounded-full px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-slate-100">Host Login</Link>
            </nav>
            <Link href="/signup" className="rounded-full bg-brand px-3.5 py-1.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-dark">
              Create Event
            </Link>
          </div>
        </header>
        {children}
        <footer className="mt-14 border-t border-slate-800 bg-slate-950">
          <div className="container-page flex flex-col gap-2 py-8 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <p>After9 - Student-hosted events, made trusted.</p>
            <p>Secure checkout, mobile tickets, fast check-in.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
