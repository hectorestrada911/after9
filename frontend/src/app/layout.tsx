import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
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
        <SiteHeader />

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
                  <li>
                    <Link href="/test" className="transition hover:text-white">
                      Test flow
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Hosts</p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>
                    <Link href="/account" className="transition hover:text-white">
                      Account hub
                    </Link>
                  </li>
                  <li>
                    <Link href="/my-tickets" className="transition hover:text-white">
                      My tickets
                    </Link>
                  </li>
                  <li>
                    <Link href="/create-event" className="transition hover:text-white">
                      Create event
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="transition hover:text-white">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="transition hover:text-white">
                      {"Events & analytics"}
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
