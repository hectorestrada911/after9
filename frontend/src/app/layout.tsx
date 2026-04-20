import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
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
  title: "RAGE · Nights out, sorted",
  description: "Host with clear pricing and mobile tickets. Guests skip the guesswork; your crew keeps the line moving.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={display.variable}>
      <body className="min-h-dvh bg-[#030303] text-zinc-100 antialiased">
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#030303]/90 backdrop-blur-xl">
          <div className="container-page flex h-14 min-w-0 items-center gap-3 sm:h-16 sm:gap-5">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src="/rage-logo.png"
                alt="RAGE"
                width={160}
                height={48}
                className="h-8 w-auto object-contain sm:h-10"
                priority
              />
            </Link>

            <div className="hidden min-w-0 flex-1 items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 md:flex">
              <Search size={16} className="shrink-0 text-zinc-500" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search by event, venue or city"
                className="ml-3 w-full min-w-0 border-0 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
            </div>

            <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-zinc-400 lg:flex">
              <Link href="/dashboard" className="transition hover:text-white">
                My tickets
              </Link>
              <Link href="/" className="transition hover:text-white">
                Browse events
              </Link>
              <Link href="/demo" className="transition hover:text-white">
                Sample event
              </Link>
              <Link href="/login" className="transition hover:text-white">
                Host login
              </Link>
            </nav>

            <Link
              href="/create-event"
              className="inline-flex h-9 shrink-0 items-center rounded-full bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-200 sm:h-10 sm:px-5 sm:text-[11px]"
            >
              Create event
            </Link>
          </div>
        </header>

        {children}

        <footer className="mt-24 border-t border-white/[0.08] bg-[#030303]">
          <div className="container-page py-12">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Image src="/rage-logo.png" alt="RAGE" width={140} height={42} className="h-7 w-auto object-contain opacity-90" />
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">Live events, upfront pricing, mobile tickets.</p>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Discover</p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>
                    <Link href="/" className="transition hover:text-white">
                      Browse events
                    </Link>
                  </li>
                  <li>
                    <Link href="/demo" className="transition hover:text-white">
                      Sample event
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Hosts</p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>
                    <Link href="/create-event" className="transition hover:text-white">
                      Create event
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="transition hover:text-white">
                      Host login
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="transition hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Company</p>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li>Get help</li>
                  <li>Work with us</li>
                </ul>
              </div>
            </div>
            <div className="mt-10 flex flex-col justify-between gap-2 border-t border-white/[0.08] pt-6 text-xs text-zinc-500 sm:flex-row">
              <p>© {new Date().getFullYear()} RAGE. All rights reserved.</p>
              <p>Secure checkout · Mobile tickets · Fast door entry</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
