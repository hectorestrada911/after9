import Link from "next/link";
import { Card } from "@/components/ui";

export default function HomePage() {
  return (
    <main>
      <section className="container-page py-16 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">After9</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Turn your event into income.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">Create, sell, and manage tickets in minutes.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">Create an Event</Link>
          <Link href="/events/campus-lights-fest" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold">See Demo Event</Link>
        </div>
      </section>
      <section className="container-page grid gap-4 pb-14 md:grid-cols-3">
        {[
          ["How it works", "Set up an event, share your page, and get paid."],
          ["Why hosts use it", "Fast checkout, clean branding, and easy door check-in."],
          ["Simple features", "Revenue cards, attendee list, and scan-ready tickets."],
          ["FAQ", "Built for student hosts who need trust and speed."],
        ].map(([title, text]) => (
          <Card key={title} className="md:col-span-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
