import { HostTestimonialCarousel } from "@/components/host-testimonial-carousel";

export function HomeSocialProof() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-zinc-950 py-20 sm:py-28 lg:py-32">
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[380px]"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(75,250,148,0.05), transparent 70%)" }}
      />
      <div className="container-page relative z-10 mx-auto max-w-5xl">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.24em] text-[#4BFA94]">From organizers</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-balance text-center text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
          Real nights,<br />
          <span className="bg-gradient-to-r from-[#4BFA94] to-emerald-300 bg-clip-text text-transparent">real workflows.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-balance text-center text-sm leading-relaxed text-zinc-500 sm:text-base">
          Short notes from people who list shows and run doors, not agency filler.
        </p>
        <div className="mt-12 sm:mt-14">
          <HostTestimonialCarousel />
        </div>
      </div>
    </section>
  );
}
