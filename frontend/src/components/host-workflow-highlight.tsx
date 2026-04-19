import Link from "next/link";
import { ArrowRight, Link2, QrCode, Timer } from "lucide-react";

const steps = [
  {
    icon: Timer,
    title: "Publish in a few minutes",
    body: "Event details, cover image, and ticket price, then a public page you can drop in bios, stories, or chats.",
  },
  {
    icon: Link2,
    title: "One link sells tickets",
    body: "Guests check out on their phones. Confirmation + QR hits their inbox so nobody’s screenshot-hunting at the door.",
  },
  {
    icon: QrCode,
    title: "Door tools that stay simple",
    body: "Search names, scan codes, catch duplicate check-ins. Built for loud rooms and long lines, not finance cosplay.",
  },
] as const;

/** Lightweight host value prop; replaces the old metrics-heavy dashboard mock. */
export function HostWorkflowHighlight() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 lg:p-10">
      <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
        {steps.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-brand-green">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h4 className="mt-4 text-lg font-black leading-tight tracking-tighter text-white">{title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-stretch justify-center gap-3 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center sm:justify-center">
        <Link
          href="/create-event"
          className="pill-dark inline-flex h-12 items-center justify-center gap-2 px-8 text-[11px] font-semibold uppercase tracking-[0.16em]"
        >
          Start selling <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href="/login"
          className="pill-light inline-flex h-12 items-center justify-center px-8 text-[11px] font-semibold uppercase tracking-[0.16em]"
        >
          Host login
        </Link>
      </div>
    </div>
  );
}
