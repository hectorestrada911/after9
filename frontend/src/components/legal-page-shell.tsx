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
    <main className="container-page py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/[0.12] bg-gradient-to-b from-zinc-900/90 to-black p-6 sm:p-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4BFA94]">Legal</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">{subtitle}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Effective date: <span className="text-[#4BFA94]">{effectiveDate}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link href="/terms" className="rounded-full border border-white/20 px-3 py-1 text-zinc-300 transition hover:border-white/40 hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="rounded-full border border-white/20 px-3 py-1 text-zinc-300 transition hover:border-white/40 hover:text-white">
              Privacy
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/20 px-3 py-1 text-zinc-300 transition hover:border-white/40 hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>
        <article
          className="
            mt-8 rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-6 text-zinc-300 sm:p-10
            [&>h2]:mt-10 [&>h2:first-child]:mt-0 [&>h2]:border-t [&>h2]:border-white/[0.08] [&>h2]:pt-6 [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0
            [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-white
            [&>p]:mt-4 [&>p]:text-[15px] [&>p]:leading-7 [&>p]:text-zinc-300
            [&>ul]:mt-4 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6
            [&>ol]:mt-4 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-6
            [&>ul>li]:text-[15px] [&>ul>li]:leading-7 [&>ul>li]:text-zinc-300
            [&>ol>li]:text-[15px] [&>ol>li]:leading-7 [&>ol>li]:text-zinc-300
            [&>ul>li::marker]:text-[#4BFA94] [&>ol>li::marker]:text-[#4BFA94]
            [&_strong]:font-semibold [&_strong]:text-white
            [&_a]:font-medium [&_a]:text-zinc-200 [&_a]:underline [&_a]:decoration-zinc-500/70 [&_a]:underline-offset-2 [&_a:hover]:text-white
          "
        >
          {children}
        </article>
      </div>
    </main>
  );
}
