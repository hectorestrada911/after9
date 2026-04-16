import Link from "next/link";
import { BarChart3, CreditCard, ShieldCheck, Sparkles, Ticket, WandSparkles } from "lucide-react";
import { Badge, Card, SectionTitle } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="mesh-grid pb-6">
      <section className="container-page relative py-14 sm:py-20">
        <div className="ambient-orb ambient-orb-purple left-6 top-32 h-44 w-44 animate-float" />
        <div className="ambient-orb ambient-orb-mint right-8 top-44 h-40 w-40 animate-float" />
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="animate-fadeUp">
            <Badge className="mb-4 gap-1.5 bg-slate-900"><Sparkles size={14} /> Built for college hosts</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">Turn your event into income.</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">Create, sell, and manage tickets in minutes. A trustworthy event page, fast checkout, and smooth entry flow all in one place.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-brand-dark">Create an Event</Link>
              <Link href="/events/campus-lights-fest" className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800">See Demo Event</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="gap-1.5"><ShieldCheck size={13} /> Secure checkout</Badge>
              <Badge className="gap-1.5"><Ticket size={13} /> Mobile ticket delivery</Badge>
              <Badge className="gap-1.5"><WandSparkles size={13} /> Fast door check-in</Badge>
            </div>
          </div>
          <Card className="glass grid gap-3 p-5 sm:p-6 animate-fadeUp">
            <p className="text-sm font-semibold text-slate-100">Live host pulse</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <p className="text-xs text-slate-400">Revenue</p>
                <p className="text-xl font-bold text-slate-100">$2,430</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <p className="text-xs text-slate-400">Tickets sold</p>
                <p className="text-xl font-bold text-slate-100">81</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <p className="text-xs text-slate-400">Check-ins</p>
                <p className="text-xl font-bold text-slate-100">67</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <p className="text-xs text-slate-400">Upcoming</p>
                <p className="text-xl font-bold text-slate-100">4</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="container-page py-6 animate-fadeUp">
        <SectionTitle
          eyebrow="How it works"
          title="Launch your event flow in minutes"
          subtitle="Built for non-technical hosts who still want a premium, trusted experience."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["1. Create", "Fill in event details and publish a clean event page instantly."],
            ["2. Sell", "Guests checkout in seconds with secure Stripe payments."],
            ["3. Check in", "Use ticket code search to keep lines moving at the door."],
          ].map(([title, text]) => (
            <Card key={title}>
              <h3 className="text-lg font-semibold tracking-tight text-slate-100">{title}</h3>
              <p className="mt-2 text-sm text-slate-300">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-6 animate-fadeUp">
        <SectionTitle eyebrow="Why hosts use it" title="High-trust, high-conversion design" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-slate-100">Trust-first event pages</h3>
            <p className="mt-2 text-sm text-slate-300">Clear pricing, secure checkout messaging, and mobile-friendly layouts that feel credible.</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-100">Operational clarity</h3>
            <p className="mt-2 text-sm text-slate-300">Revenue, tickets sold, and attendee visibility in one dashboard to reduce stress before doors open.</p>
          </Card>
        </div>
      </section>

      <section className="container-page py-6 animate-fadeUp">
        <SectionTitle eyebrow="FAQ" title="Questions hosts usually ask" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-slate-100">Can I share private events?</h3>
            <p className="mt-2 text-sm text-slate-300">Yes. Set visibility to private and share the direct link with your guest list only.</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-100">Do I need special hardware at the door?</h3>
            <p className="mt-2 text-sm text-slate-300">No. You can search by code or attendee info and check in manually from your phone.</p>
          </Card>
        </div>
      </section>

      <section className="container-page py-8 animate-fadeUp">
        <Card className="overflow-hidden">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Host stack</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-100">Everything you need to run the night</h3>
            </div>
            <Link href="/dashboard" className="rounded-xl bg-brand px-4 py-2 font-semibold text-white shadow-glow transition hover:bg-brand-dark">Go to dashboard</Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <CreditCard className="mb-2 text-brand" size={18} />
              <p className="font-semibold text-slate-100">Stripe checkout</p>
              <p className="mt-1 text-sm text-slate-300">Secure, familiar payment flow for guests.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <Ticket className="mb-2 text-accent-sky" size={18} />
              <p className="font-semibold text-slate-100">Ticket operations</p>
              <p className="mt-1 text-sm text-slate-300">Codes, QR tickets, and smooth entry handling.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <BarChart3 className="mb-2 text-accent-mint" size={18} />
              <p className="font-semibold text-slate-100">Host analytics</p>
              <p className="mt-1 text-sm text-slate-300">Revenue and conversion visibility in real time.</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
