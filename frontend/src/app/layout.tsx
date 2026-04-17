import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { Inter } from "next/font/google";
import { Search } from "lucide-react";
import "./globals.css";

const display = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RAGE — Welcome to the alternative",
  description: "Live student events. Upfront pricing. Mobile tickets. RAGE makes going out easy.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={display.variable}>
      <body>
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line">
          <div className="container-page flex h-16 items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center shrink-0">
              <Image src="/rage-logo.png" alt="RAGE" width={115} height={61} className="object-contain" priority />
            </Link>

            <div className="flex-1 hidden md:flex items-center bg-offwhite rounded-full h-11 px-4">
              <Search size={16} className="text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search by event, venue or city"
                className="bg-transparent border-0 outline-none w-full ml-3 text-sm placeholder:text-muted"
              />
            </div>

            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
              <Link href="/dashboard" className="hover:opacity-60 transition">My tickets</Link>
              <Link href="/" className="hover:opacity-60 transition">Browse events</Link>
              <Link href="/demo-flow" className="hover:opacity-60 transition">Demo flow</Link>
              <Link href="/login" className="hover:opacity-60 transition">Host login</Link>
            </nav>

            <Link href="/signup" className="pill-dark h-11 px-5 text-sm shrink-0">
              CREATE EVENT
            </Link>
          </div>
        </header>

        {children}

        <footer className="mt-24 border-t border-line bg-white">
          <div className="container-page py-12">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <img src="/rage-logo.svg" alt="RAGE" height={40} className="object-contain" />
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  Student events, upfront pricing, mobile tickets.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3">Discover</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="hover:opacity-60">Browse events</Link></li>
                  <li><Link href="/demo-flow" className="hover:opacity-60">Demo event</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3">Hosts</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/signup" className="hover:opacity-60">Create event</Link></li>
                  <li><Link href="/login" className="hover:opacity-60">Host login</Link></li>
                  <li><Link href="/dashboard" className="hover:opacity-60">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3">Company</p>
                <ul className="space-y-2 text-sm">
                  <li><span className="text-muted">Get help</span></li>
                  <li><span className="text-muted">Work with us</span></li>
                </ul>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted">
              <p>© {new Date().getFullYear()} RAGE. All rights reserved.</p>
              <p>Secure checkout · Mobile tickets · Fast door entry</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
