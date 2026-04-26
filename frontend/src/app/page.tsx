import { HomeHostSection } from "@/components/home-host-section";
import { HomeHowSection } from "@/components/home-how-section";
import { HomeSchoolsCta } from "@/components/home-schools-cta";
import { HomeSocialProof } from "@/components/home-social-proof";
import { HomeTopSection } from "@/components/home-top-section";
import { HomeTrendingRail, type HomeTrendingEvent } from "@/components/home-trending-rail";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const fallbackEvents: HomeTrendingEvent[] = [
  { slug: "campus-lights-fest", title: "Campus Lights Fest", date: "2026-05-10", location: "Student Union Hall", ticket_price: 2500, image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80" },
  { slug: "rooftop-sunset-social", title: "Rooftop Sunset Social", date: "2026-05-18", location: "Riverside Rooftop", ticket_price: 3500, image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80" },
  { slug: "campus-lights-fest", title: "Late Night DJ Set", date: "2026-06-02", location: "The Warehouse", ticket_price: 1800, image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80" },
  { slug: "rooftop-sunset-social", title: "Indie Showcase", date: "2026-06-14", location: "Soda Bar", ticket_price: 2000, image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80" },
  { slug: "campus-lights-fest", title: "Sunrise Beach Rave", date: "2026-06-22", location: "Mission Beach", ticket_price: 2800, image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80" },
  { slug: "rooftop-sunset-social", title: "Comedy Night Live", date: "2026-07-01", location: "The Comedy Loft", ticket_price: 1500, image_url: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=900&q=80" },
];

export default async function HomePage() {
  let events: HomeTrendingEvent[] = fallbackEvents;
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from("events")
      .select("slug,title,date,location,ticket_price,image_url")
      .eq("visibility", "public")
      .order("date", { ascending: true })
      .limit(12);
    if (data && data.length > 0) {
      events = data as HomeTrendingEvent[];
    }
  } catch {
    // fall through to fallback
  }

  return (
    <main className="min-w-0 text-zinc-100">
      <HomeTopSection />
      <HomeSchoolsCta />
      <HomeSocialProof />
      <HomeTrendingRail events={events} />
      <HomeHowSection />
      <HomeHostSection />
    </main>
  );
}
