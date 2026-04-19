import { HostTestimonialCarousel } from "@/components/host-testimonial-carousel";

/**
 * Host testimonials: carousel + hero still (see HostTestimonialCarousel).
 */
export function HomeSocialProof() {
  return (
    <section className="border-t border-white/[0.08] bg-zinc-950 py-16 sm:py-24 lg:py-28">
      <div className="container-page mx-auto max-w-5xl">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">From organizers</p>
        <h2 className="mx-auto mt-3 max-w-xl text-balance text-center text-xl font-black tracking-tighter text-white sm:text-2xl">
          Real nights, real workflows.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-balance text-center text-sm leading-relaxed text-zinc-500">
          Short notes from people who list shows and run doors, not agency filler.
        </p>
        <div className="mt-10 sm:mt-12">
          <HostTestimonialCarousel />
        </div>
      </div>
    </section>
  );
}
