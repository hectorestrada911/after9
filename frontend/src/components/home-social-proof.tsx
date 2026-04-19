import { HostTestimonialCarousel } from "@/components/host-testimonial-carousel";

/**
 * Host testimonials: dark strip + carousel + static image (see HostTestimonialCarousel).
 */
export function HomeSocialProof() {
  return (
    <section className="border-t border-white/[0.08] bg-zinc-950 py-16 sm:py-24 lg:py-28">
      <div className="container-page flex justify-center">
        <HostTestimonialCarousel />
      </div>
    </section>
  );
}
