import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DemoCheckoutFlow } from "@/components/demo-checkout-flow";

export default function DemoPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04] sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Live demo</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Guest checkout experience</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Event details, pricing, checkout, and ticket delivery.
        </p>

        <div className="mt-6">
          <DemoCheckoutFlow />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/events/campus-lights-fest"
            className="pill-dark inline-flex h-12 items-center justify-center gap-2 px-7 text-[11px] font-semibold uppercase tracking-[0.16em]"
          >
            Browse live events <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href="/create-event"
            className="pill-light inline-flex h-12 items-center justify-center px-7 text-[11px] font-semibold uppercase tracking-[0.16em]"
          >
            Create your event
          </Link>
        </div>
      </section>
    </main>
  );
}
