/** Curated 4:5 flyer images (Unsplash). IDs verified HTTP 200; Unsplash periodically retires assets. */
export type FlyerCategory = "all" | "party" | "drinks" | "club" | "concert" | "chill";

export type FlyerStockImage = {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  tags: string[];
  category: Exclude<FlyerCategory, "all">;
};

const q = "auto=format&w=1080&h=1350&fit=crop&q=82";
const t = "auto=format&w=480&h=600&fit=crop&q=80";

function u(id: string) {
  return `https://images.unsplash.com/${id}?${q}`;
}

function th(id: string) {
  return `https://images.unsplash.com/${id}?${t}`;
}

export const FLYER_CATEGORIES: { id: FlyerCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "party", label: "Parties" },
  { id: "drinks", label: "Drinks" },
  { id: "club", label: "Club" },
  { id: "concert", label: "Live" },
  { id: "chill", label: "Chill" },
];

export const FLYER_STOCK: FlyerStockImage[] = [
  {
    id: "disco-red",
    url: u("photo-1514525253161-7a46d19cd819"),
    thumb: th("photo-1514525253161-7a46d19cd819"),
    alt: "Disco ball and red lighting",
    tags: ["disco", "red", "ball", "night", "party", "dance"],
    category: "club",
  },
  {
    id: "dance-floor-purple",
    url: u("photo-1492684223066-81342ee5ff30"),
    thumb: th("photo-1492684223066-81342ee5ff30"),
    alt: "Purple lights over a packed dance floor",
    tags: ["dance", "club", "night", "purple", "edm", "lights"],
    category: "club",
  },
  {
    id: "dj-hands-deck",
    url: u("photo-1493225457124-a3eb161ffa5f"),
    thumb: th("photo-1493225457124-a3eb161ffa5f"),
    alt: "DJ hands at the decks",
    tags: ["dj", "deck", "mix", "night", "music", "techno"],
    category: "club",
  },
  {
    id: "club-lasers",
    url: u("photo-1598387993441-a364f854c3e1"),
    thumb: th("photo-1598387993441-a364f854c3e1"),
    alt: "Laser lights over the crowd",
    tags: ["club", "night", "lasers", "party", "rave", "lights"],
    category: "club",
  },
  {
    id: "crowd-hands-up",
    url: u("photo-1514933651103-005eec06c04b"),
    thumb: th("photo-1514933651103-005eec06c04b"),
    alt: "Crowd with hands in the air",
    tags: ["crowd", "club", "party", "hands", "energy", "night"],
    category: "club",
  },
  {
    id: "stage-live",
    url: u("photo-1506157786151-b8491531f063"),
    thumb: th("photo-1506157786151-b8491531f063"),
    alt: "Band on stage under lights",
    tags: ["stage", "live", "band", "show", "lights", "performance"],
    category: "concert",
  },
  {
    id: "festival-crowd",
    url: u("photo-1519671482749-fd09be7ccebf"),
    thumb: th("photo-1519671482749-fd09be7ccebf"),
    alt: "Festival crowd at golden hour",
    tags: ["festival", "crowd", "outdoor", "summer", "live", "music"],
    category: "concert",
  },
  {
    id: "festival-outdoor",
    url: u("photo-1459749411175-04bf5292ceea"),
    thumb: th("photo-1459749411175-04bf5292ceea"),
    alt: "Outdoor festival in a field",
    tags: ["festival", "outdoor", "summer", "crowd", "day", "field"],
    category: "concert",
  },
  {
    id: "phone-at-show",
    url: u("photo-1501281668745-f7f57925c3b4"),
    thumb: th("photo-1501281668745-f7f57925c3b4"),
    alt: "Fan filming the stage on a phone",
    tags: ["concert", "phone", "crowd", "lights", "live", "moment"],
    category: "concert",
  },
  {
    id: "silhouette-crowd",
    url: u("photo-1470225620780-dba8ba36b745"),
    thumb: th("photo-1470225620780-dba8ba36b745"),
    alt: "Silhouettes at a live show",
    tags: ["concert", "silhouette", "lights", "crowd", "night", "live"],
    category: "concert",
  },
  {
    id: "cocktails-sunset",
    url: u("photo-1470337458703-46ad1756a187"),
    thumb: th("photo-1470337458703-46ad1756a187"),
    alt: "Cocktails at golden hour",
    tags: ["drinks", "cocktail", "bar", "sunset", "happy hour", "summer"],
    category: "drinks",
  },
  {
    id: "dinner-table-wine",
    url: u("photo-1560518883-ce09059eeffa"),
    thumb: th("photo-1560518883-ce09059eeffa"),
    alt: "Wine and dinner table setting",
    tags: ["wine", "dinner", "party", "table", "host", "friends"],
    category: "drinks",
  },
  {
    id: "house-party-friends",
    url: u("photo-1529156069898-49953e39b3ac"),
    thumb: th("photo-1529156069898-49953e39b3ac"),
    alt: "Friends celebrating indoors",
    tags: ["house party", "friends", "home", "birthday", "group", "smile"],
    category: "party",
  },
  {
    id: "balloons-celebrate",
    url: u("photo-1530103862676-de8c9debad1d"),
    thumb: th("photo-1530103862676-de8c9debad1d"),
    alt: "Colorful balloons",
    tags: ["birthday", "balloons", "kids", "celebration", "color", "fun"],
    category: "party",
  },
  {
    id: "confetti-celebration",
    url: u("photo-1516450360452-9312f5e86fc7"),
    thumb: th("photo-1516450360452-9312f5e86fc7"),
    alt: "Confetti and celebration",
    tags: ["party", "confetti", "celebration", "night", "joy", "event"],
    category: "party",
  },
  {
    id: "wedding-dancefloor",
    url: u("photo-1511578314322-379afb476865"),
    thumb: th("photo-1511578314322-379afb476865"),
    alt: "Guests dancing at an event",
    tags: ["wedding", "dance", "party", "elegant", "night", "celebration"],
    category: "party",
  },
  {
    id: "comedy-stage",
    url: u("photo-1527224857830-43a7acc85260"),
    thumb: th("photo-1527224857830-43a7acc85260"),
    alt: "Comedy mic on stage",
    tags: ["comedy", "mic", "show", "theater", "night", "intimate"],
    category: "chill",
  },
  {
    id: "coffee-laptop-calm",
    url: u("photo-1509042239860-f550ce710b93"),
    thumb: th("photo-1509042239860-f550ce710b93"),
    alt: "Coffee cup steam",
    tags: ["coffee", "morning", "chill", "cafe", "study", "lowkey"],
    category: "chill",
  },
  {
    id: "piano-keys",
    url: u("photo-1520523839897-bd0b52f945a0"),
    thumb: th("photo-1520523839897-bd0b52f945a0"),
    alt: "Piano keys",
    tags: ["piano", "keys", "acoustic", "jazz", "classical", "intimate"],
    category: "chill",
  },
  {
    id: "morning-stretch",
    url: u("photo-1571019613454-1cb2f99b2d8b"),
    thumb: th("photo-1571019613454-1cb2f99b2d8b"),
    alt: "Bright studio floor and mats",
    tags: ["morning", "calm", "studio", "wellness", "soft", "daytime"],
    category: "chill",
  },
  {
    id: "headphones-yellow",
    url: u("photo-1558618666-fcd25c85cd64"),
    thumb: th("photo-1558618666-fcd25c85cd64"),
    alt: "Headphones on yellow background",
    tags: ["music", "headphones", "listen", "chill", "solo", "vibe"],
    category: "chill",
  },
];

export function filterFlyerStock(query: string, category: FlyerCategory): FlyerStockImage[] {
  const qRaw = query.trim().toLowerCase();
  let list = FLYER_STOCK;
  if (category !== "all") {
    list = list.filter((img) => img.category === category);
  }
  if (!qRaw) return list;
  return list.filter(
    (img) =>
      img.alt.toLowerCase().includes(qRaw) ||
      img.tags.some((tag) => tag.toLowerCase().includes(qRaw)) ||
      img.id.includes(qRaw),
  );
}
