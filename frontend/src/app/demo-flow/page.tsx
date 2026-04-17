import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CircleDollarSign, QrCode, ScanLine, WandSparkles } from "lucide-react";

const flowSteps = [
  { id: "01", title: "Create event", hint: "Flyer + details, then sign in", icon: WandSparkles, href: "/create-event", cta: "Start creating" },
  { id: "02", title: "Get link + QR", hint: "Share instantly", icon: QrCode, href: "/dashboard/events/new", cta: "See share output" },
  { id: "03", title: "Guest buys", hint: "Fast checkout", icon: CircleDollarSign, href: "/events/campus-lights-fest", cta: "Open demo event" },
  { id: "04", title: "Check in", hint: "Scan or search", icon: ScanLine, href: "/dashboard", cta: "Open host tools" },
];

export default function DemoFlowPage() {
  return (
    <main className="min-w-0 bg-white">
      <section className="container-page py-12 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Demo flow</p>
        <h1 className="mt-4 display-section-fluid">
          From host setup<br />to guest entry.
        </h1>
        <p className="mt-5 max-w-xl text-base sm:text-lg text-muted">
          Tap any card below to jump into that part of the real product.
        </p>
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {flowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className="group rounded-2xl border border-line bg-white p-6 transition hover:border-black"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{step.id}</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                    <Icon size={16} />
                  </span>
                </div>
                <h2 className="mt-6 text-2xl font-black tracking-tighter">{step.title}</h2>
                <p className="mt-1 text-sm text-muted">{step.hint}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wide group-hover:underline underline-offset-4">
                  {step.cta} <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-line bg-offwhite">
        <div className="container-page py-16 sm:py-24">
          <div className="grid min-w-0 gap-10 items-center lg:grid-cols-[1.1fr,0.9fr]">
            <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80"
                alt="Event venue"
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Real event feel</p>
              <h3 className="mt-3 display-section-fluid-sm">
                One clean flow,<br />from promo to entry.
              </h3>
              <p className="mt-5 text-base text-muted">
                Same modern journey every time: publish, share, sell, and check in.
                Fewer steps, better trust, faster execution on event night.
              </p>
              <Link href="/create-event" className="mt-7 inline-flex items-center gap-2 pill-dark h-12 px-7 text-sm">
                LAUNCH YOUR EVENT <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
