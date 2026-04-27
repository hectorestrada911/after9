import Link from "next/link";
import { ArrowLeft, Calendar, ShieldAlert } from "lucide-react";

export function EventWorkspaceMissing({ reason }: { reason: "not_found" | "not_owner" }) {
  const isOwnership = reason === "not_owner";
  const title = isOwnership ? "You can't manage this event" : "Event not available";
  const subtitle = isOwnership
    ? "This event exists, but it isn't connected to your host account. Sign in with the account that created it, or pick one of your events below."
    : "This event link is no longer available. It may have been deleted or the link is incorrect. Past events still appear in your dashboard for records.";

  return (
    <main className="container-page min-w-0 py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 transition hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/[0.1] bg-zinc-950 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-amber-300">
              {isOwnership ? <ShieldAlert className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:text-base">{subtitle}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-5 text-xs font-bold uppercase tracking-wider text-black transition hover:brightness-110"
                >
                  Open my events
                </Link>
                <Link
                  href="/account"
                  className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-white/45"
                >
                  Account hub
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-white/45"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
