import type { ReactNode } from "react";
import Link from "next/link";

type LegalPageShellProps = {
  title: string;
  subtitle: string;
  effectiveDate: string;
  children: ReactNode;
};

export function LegalPageShell({ title, subtitle, effectiveDate, children }: LegalPageShellProps) {
  return (
    <main className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-900/90 to-black p-5 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Legal</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-zinc-300 sm:text-base">{subtitle}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Effective date: {effectiveDate}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href="/terms" className="rounded-full border border-white/20 px-3 py-1 text-zinc-300 transition hover:border-white/40 hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="rounded-full border border-white/20 px-3 py-1 text-zinc-300 transition hover:border-white/40 hover:text-white">
              Privacy
            </Link>
            <a
              href="mailto:ragesupportpage@gmail.com"
              className="rounded-full border border-white/20 px-3 py-1 text-zinc-300 transition hover:border-white/40 hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
        <article className="prose prose-invert mt-6 max-w-none rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-5 prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white sm:p-8">
          {children}
        </article>
      </div>
    </main>
  );
}
