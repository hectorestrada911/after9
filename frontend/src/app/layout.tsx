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
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">
          <div className="container-page flex h-16 items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">After9</Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/events/campus-lights-fest" className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Demo Event</Link>
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Host Login</Link>
              <Link href="/signup" className="rounded-lg bg-brand px-3 py-1.5 font-semibold text-white transition hover:bg-brand-dark">Create Event</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-14 border-t border-slate-200 bg-white">
          <div className="container-page flex flex-col gap-2 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>After9 - Student-hosted events, made trusted.</p>
            <p>Secure checkout, mobile tickets, fast check-in.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
