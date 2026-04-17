/** Curated vertical-ish flyer images (Unsplash hotlink). `tags` used for client-side search. */
export type FlyerStockImage = {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  tags: string[];
};

export const FLYER_STOCK: FlyerStockImage[] = [
  {
    id: "club-blue",
    url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbdd0a?w=1080&h=1350&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbdd0a?w=400&h=500&fit=crop&q=80",
    alt: "Crowd under blue stage lights",
    tags: ["club", "night", "blue", "party", "dj", "lights"],
  },
  {
    id: "disco-red",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1080&h=1350&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop&q=80",
    alt: "Disco ball and red lighting",
    tags: ["disco", "red", "ball", "night", "party"],
  },
  {
    id: "concert-hands",
    url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1080&h=1350&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=500&fit=crop&q=80",
    alt: "Hands raised at a concert",
    tags: ["concert", "live", "crowd", "hands", "music"],
  },
  {
    id: "stage-smoke",
    url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa88?w=1080&h=1350&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa88?w=400&h=500&fit=crop&q=80",
    alt: "Stage smoke and spotlights",
    tags: ["stage", "smoke", "show", "lights", "theater"],
  },
  {
    id: "vinyl",
    url: "https://images.unsplash.com/photo-1614613535308-eb6fbd3d2c17?w=1080&h=1350&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1614613535308-eb6fbd3d2c17?w=400&h=500&fit=crop&q=80",
    alt: "Vinyl record close-up",
    tags: ["vinyl", "music", "dj", "retro", "audio"],
  },
  {
    id: "neon-sign",
    url: "https://images.unsplash.com/photo-1499364615650-ec38552f60f7?w=1080&h=1350&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1499364615650-ec38552f60f7?w=400&h=500&fit=crop&q=80",
    alt: "Neon open sign at night",
    tags: ["neon", "night", "city", "bar", "urban"],
  },
  {
    id: "festival",
    url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1080&h=1350&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=500&fit=crop&q=80",
    alt: "Outdoor festival crowd",
    tags: ["festival", "outdoor", "summer", "crowd", "day"],
  },
  {
    id: "piano",
    url: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1080&h=1350&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=500&fit=crop&q=80",
    alt: "Piano keys",
    tags: ["piano", "keys", "acoustic", "jazz", "classical"],
  },
];

export function filterFlyerStock(query: string): FlyerStockImage[] {
  const q = query.trim().toLowerCase();
  if (!q) return FLYER_STOCK;
  return FLYER_STOCK.filter(
    (img) =>
      img.alt.toLowerCase().includes(q) ||
      img.tags.some((t) => t.includes(q)) ||
      img.id.includes(q),
  );
}
