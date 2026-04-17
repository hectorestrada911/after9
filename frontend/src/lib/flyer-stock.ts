/** Curated 4:5-ish flyer images (Unsplash). `tags` + `category` power search & chips. */
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
const t = "auto=format&w=400&h=500&fit=crop&q=82";

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
    id: "club-blue",
    url: u("photo-1470229722913-7c0e2dbbdd0a"),
    thumb: th("photo-1470229722913-7c0e2dbbdd0a"),
    alt: "Crowd under blue stage lights",
    tags: ["club", "night", "blue", "party", "dj", "lights", "rave"],
    category: "club",
  },
  {
    id: "disco-red",
    url: u("photo-1514525253161-7a46d19cd819"),
    thumb: th("photo-1514525253161-7a46d19cd819"),
    alt: "Disco ball and red lighting",
    tags: ["disco", "red", "ball", "night", "party", "dance"],
    category: "club",
  },
  {
    id: "concert-hands",
    url: u("photo-1501281668745-f7f57925c3b4"),
    thumb: th("photo-1501281668745-f7f57925c3b4"),
    alt: "Hands raised at a concert",
    tags: ["concert", "live", "crowd", "hands", "music", "festival"],
    category: "concert",
  },
  {
    id: "stage-smoke",
    url: u("photo-1540039155733-5bb30b53aa88"),
    thumb: th("photo-1540039155733-5bb30b53aa88"),
    alt: "Stage smoke and spotlights",
    tags: ["stage", "smoke", "show", "lights", "theater", "performance"],
    category: "concert",
  },
  {
    id: "cocktails-color",
    url: u("photo-1544145945-f90425340c97"),
    thumb: th("photo-1544145945-f90425340c97"),
    alt: "Bright cocktails in a row",
    tags: ["drinks", "cocktail", "bar", "color", "summer", "happy hour"],
    category: "drinks",
  },
  {
    id: "bar-bottles",
    url: u("photo-1514362549384-aa0021d7d924"),
    thumb: th("photo-1514362549384-aa0021d7d924"),
    alt: "Backlit bottles behind a bar",
    tags: ["bar", "bottles", "night", "drinks", "lounge", "whiskey"],
    category: "drinks",
  },
  {
    id: "drinks-ice",
    url: u("photo-1551024506-0bffd28ae77a"),
    thumb: th("photo-1551024506-0bffd28ae77a"),
    alt: "Cold drinks with ice and citrus",
    tags: ["drinks", "ice", "summer", "refresh", "party", "cocktail"],
    category: "drinks",
  },
  {
    id: "wine-glasses",
    url: u("photo-1510812431404-41cc2cbd704c"),
    thumb: th("photo-1510812431404-41cc2cbd704c"),
    alt: "Wine glasses at a dinner party",
    tags: ["wine", "dinner", "party", "friends", "table", "host"],
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
    id: "rooftop-golden",
    url: u("photo-1527529482837-4698179dc724"),
    thumb: th("photo-1527529482837-4698179dc724"),
    alt: "Rooftop gathering at sunset",
    tags: ["rooftop", "sunset", "skyline", "party", "summer", "view"],
    category: "party",
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
    id: "dj-deck",
    url: u("photo-1571266020803-7d42b9170b82"),
    thumb: th("photo-1571266020803-7d42b9170b82"),
    alt: "DJ hands on mixer",
    tags: ["dj", "deck", "mix", "night", "music", "techno"],
    category: "club",
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
    id: "vinyl",
    url: u("photo-1614613535308-eb6fbd3d2c17"),
    thumb: th("photo-1614613535308-eb6fbd3d2c17"),
    alt: "Vinyl record close-up",
    tags: ["vinyl", "music", "dj", "retro", "listening", "audio"],
    category: "chill",
  },
  {
    id: "festival-outdoor",
    url: u("photo-1459749411175-04bf5292ceea"),
    thumb: th("photo-1459749411175-04bf5292ceea"),
    alt: "Outdoor festival crowd",
    tags: ["festival", "outdoor", "summer", "crowd", "day", "field"],
    category: "concert",
  },
  {
    id: "piano",
    url: u("photo-1520523839897-bd0b52f945a0"),
    thumb: th("photo-1520523839897-bd0b52f945a0"),
    alt: "Piano keys",
    tags: ["piano", "keys", "acoustic", "jazz", "classical", "intimate"],
    category: "chill",
  },
  {
    id: "neon-sign",
    url: u("photo-1499364615650-ec38552f60f7"),
    thumb: th("photo-1499364615650-ec38552f60f7"),
    alt: "Neon sign at night",
    tags: ["neon", "night", "city", "bar", "urban", "late"],
    category: "club",
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
      img.tags.some((t) => t.toLowerCase().includes(qRaw)) ||
      img.id.includes(qRaw),
  );
}
