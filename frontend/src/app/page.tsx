import Link from "next/link";
import { Badge, Card, SectionTitle } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="pb-6">
      <section className="container-page py-14 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <Badge className="mb-4 bg-white">Built for college hosts</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">Turn your event into income.</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">Create, sell, and manage tickets in minutes. A trustworthy event page, fast checkout, and smooth entry flow all in one place.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-dark">Create an Event</Link>
              <Link href="/events/campus-lights-fest" className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">See Demo Event</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge>Secure checkout</Badge>
              <Badge>Mobile ticket delivery</Badge>
              <Badge>Fast door check-in</Badge>
            </div>
          </div>
          <Card className="glass grid gap-3 p-5 sm:p-6">
            <p className="text-sm font-semibold text-slate-900">Live host pulse</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Revenue</p>
                <p className="text-xl font-bold">$2,430</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Tickets sold</p>
                <p className="text-xl font-bold">81</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Check-ins</p>
                <p className="text-xl font-bold">67</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-slate-500">Upcoming</p>
                <p className="text-xl font-bold">4</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="container-page py-6">
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
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-6">
        <SectionTitle eyebrow="Why hosts use it" title="High-trust, high-conversion design" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-semibold">Trust-first event pages</h3>
            <p className="mt-2 text-sm text-slate-600">Clear pricing, secure checkout messaging, and mobile-friendly layouts that feel credible.</p>
          </Card>
          <Card>
            <h3 className="font-semibold">Operational clarity</h3>
            <p className="mt-2 text-sm text-slate-600">Revenue, tickets sold, and attendee visibility in one dashboard to reduce stress before doors open.</p>
          </Card>
        </div>
      </section>

      <section className="container-page py-6">
        <SectionTitle eyebrow="FAQ" title="Questions hosts usually ask" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-semibold">Can I share private events?</h3>
            <p className="mt-2 text-sm text-slate-600">Yes. Set visibility to private and share the direct link with your guest list only.</p>
          </Card>
          <Card>
            <h3 className="font-semibold">Do I need special hardware at the door?</h3>
            <p className="mt-2 text-sm text-slate-600">No. You can search by code or attendee info and check in manually from your phone.</p>
          </Card>
        </div>
      </section>
    </main>
  );
}
