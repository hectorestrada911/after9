import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ · RAGE",
  description: "Answers to the most common questions about tickets, refunds, hosting, and account access on RAGE.",
};

const faqs = [
  {
    q: "How do I get into RAGE events?",
    a: "Create an account, verify your .edu email, then browse live events and check out. Your ticket appears instantly in My tickets with a QR code for entry.",
  },
  {
    q: "Do I need a school email to use the app?",
    a: "For student-gated events, yes. We use .edu verification so private campus events stay student-only.",
  },
  {
    q: "Where is my ticket after I buy?",
    a: "Go to My tickets. Every purchase is attached to your account and includes a scannable QR code for door entry.",
  },
  {
    q: "Can I get a refund if I can't attend?",
    a: "Refunds are controlled by each event host. Open the event details for policy terms, then contact support with your order info if you need help.",
  },
  {
    q: "What happens if my QR doesn't scan?",
    a: "Door teams can still validate your ticket from the host dashboard. Keep your ticket open and brightness high to speed up scanning.",
  },
  {
    q: "How do hosts get paid?",
    a: "Hosts connect payouts through Stripe and can track sales, attendees, and orders in their dashboard.",
  },
  {
    q: "Can I create private invite-only events?",
    a: 'Yes. Hosts can run student-gated flows and invite-specific access patterns depending on event setup.',
  },
  {
    q: "How fast does support reply?",
    a: "We usually respond within 24 hours on business days. Contact us at ragesupportpage@gmail.com.",
  },
];

export default function FaqPage() {
  return (
    <main className="relative overflow-hidden bg-black text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 18%, rgba(75,250,148,0.10), transparent 40%), radial-gradient(circle at 82% 78%, rgba(40,80,255,0.10), transparent 45%)",
        }}
      />

      <section className="container-page relative z-10 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#4BFA94]">Support</p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-6xl">
            Frequently Asked
            <br />
            Questions
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Everything people usually ask before buying tickets, hosting events, or getting into a student-only party.
          </p>

          <div className="mt-10 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/[0.1] bg-white/[0.02] px-5 py-4 transition hover:border-white/[0.18] hover:bg-white/[0.03]"
              >
                <summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-white marker:hidden sm:text-base">
                  {item.q}
                  <span className="float-right text-zinc-500 transition group-open:rotate-45 group-open:text-[#4BFA94]">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#4BFA94] px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition hover:bg-emerald-300"
            >
              Get the app
            </Link>
            <Link
              href="/create-event"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.18] px-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition hover:border-white/40"
            >
              Host an event
            </Link>
            <Link href="/contact" className="text-center text-xs text-zinc-500 transition hover:text-zinc-300">
              Still need help? Contact us
            </Link>
            <div className="text-center text-xs text-zinc-600">
              <Link href="/terms" className="transition hover:text-zinc-400">Terms</Link>
              {" · "}
              <Link href="/privacy" className="transition hover:text-zinc-400">Privacy</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
