import Link from "next/link";
import { ArrowRight, CheckCircle2, QrCode, Ticket, WandSparkles } from "lucide-react";
import { Badge, Card, SectionTitle } from "@/components/ui";

const steps = [
  {
    title: "1) Host creates event",
    text: "Host fills out title, date, location, ticket price, and publishes in one flow.",
    cta: { label: "Try create event", href: "/dashboard/events/new" },
    icon: WandSparkles,
  },
  {
    title: "2) Host gets share assets",
    text: "After publishing, host receives a website link plus a QR code that opens the public event page.",
    cta: { label: "View creation flow", href: "/dashboard/events/new" },
    icon: QrCode,
  },
  {
    title: "3) Guests open event + buy",
    text: "Guests use link or QR, land on event page, and complete checkout in seconds.",
    cta: { label: "Open demo event page", href: "/events/campus-lights-fest" },
    icon: Ticket,
  },
  {
    title: "4) Host checks guests in",
    text: "At the door, host searches ticket/attendee and marks check-in while preventing duplicates.",
    cta: { label: "Go to dashboard", href: "/dashboard" },
    icon: CheckCircle2,
  },
];

export default function DemoFlowPage() {
  return (
    <main className="container-page py-8 sm:py-10">
      <div className="space-y-6">
        <Badge className="gap-1.5 border-brand/40 bg-brand/10">
          <WandSparkles size={13} /> Interactive product flow demo
        </Badge>
        <SectionTitle
          eyebrow="Demo Event Flow"
          title="How After9 works end-to-end"
          subtitle="Click through the exact host-to-guest journey: create event -> get link + QR -> guests enter event page -> host manages entry."
        />
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="rounded-2xl border-slate-800 bg-slate-950/70 p-5">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900">
                <Icon size={16} className="text-brand" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-100">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.text}</p>
              <Link
                href={step.cta.href}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
              >
                {step.cta.label} <ArrowRight size={14} />
              </Link>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 rounded-2xl border-slate-800 bg-slate-950/70">
        <p className="text-sm text-slate-300">
          Quick test path: create a new event, copy the generated link or scan its QR,
          open the event page in another device/tab, buy a ticket, then check it in from host tools.
        </p>
      </Card>
    </main>
  );
}
