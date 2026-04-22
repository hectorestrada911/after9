"use client";

import dynamic from "next/dynamic";

const HOME_BANNER_LAYOUT =
  "relative aspect-[3/4] min-h-[min(88vw,440px)] w-full sm:aspect-[16/9] sm:min-h-[280px] lg:aspect-[21/9] lg:min-h-[min(40vw,460px)]";

const HomeBannerVideo = dynamic(
  () => import("./home-banner-video").then((m) => ({ default: m.HomeBannerVideo })),
  {
    ssr: false,
    loading: () => <div className={`${HOME_BANNER_LAYOUT} animate-pulse bg-zinc-950`} aria-hidden />,
  },
);

export function HomeBannerVideoLoader() {
  return <HomeBannerVideo className={HOME_BANNER_LAYOUT} />;
}
