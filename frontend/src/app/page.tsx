import { HomeAppShowcase } from "@/components/home-app-showcase";
import { HomeFaqSection } from "@/components/home-faq-section";
import { HomeSchoolsCta } from "@/components/home-schools-cta";
import { HomeTopSection } from "@/components/home-top-section";

export default function HomePage() {
  return (
    <main className="min-w-0 text-zinc-100">
      <HomeTopSection />
      <HomeSchoolsCta />
      <HomeAppShowcase />
      <HomeFaqSection />
    </main>
  );
}
