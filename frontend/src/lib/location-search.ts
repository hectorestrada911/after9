export type LocationSuggestion = {
  id: string;
  primary: string;
  secondary?: string;
  fullText: string;
  lat?: number;
  lng?: number;
};

function uniqueByFullText(items: LocationSuggestion[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.fullText.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function searchWithMapbox(query: string, token: string): Promise<LocationSuggestion[]> {
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("types", "place,address,poi,neighborhood,locality");
  url.searchParams.set("limit", "6");
  url.searchParams.set("access_token", token);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Location search unavailable right now.");

  const json = (await res.json()) as {
    features?: Array<{
      id: string;
      text?: string;
      place_name?: string;
      center?: [number, number];
      context?: Array<{ text?: string }>;
    }>;
  };

  const suggestions =
    json.features?.map((f) => {
      const primary = f.text?.trim() || f.place_name?.split(",")[0]?.trim() || "Location";
      const fullText = f.place_name?.trim() || primary;
      const context = f.context?.map((c) => c.text).filter(Boolean).join(", ");
      return {
        id: f.id,
        primary,
        secondary: context || undefined,
        fullText,
        lat: f.center?.[1],
        lng: f.center?.[0],
      } satisfies LocationSuggestion;
    }) ?? [];

  return uniqueByFullText(suggestions);
}

async function searchWithNominatim(query: string): Promise<LocationSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Location search unavailable right now.");

  const json = (await res.json()) as Array<{
    place_id: number;
    name?: string;
    display_name: string;
    lat?: string;
    lon?: string;
  }>;

  const suggestions = json.map((r) => {
    const first = r.display_name.split(",")[0]?.trim();
    const primary = r.name?.trim() || first || "Location";
    const secondary = r.display_name.replace(primary, "").replace(/^,\s*/, "").trim();
    return {
      id: String(r.place_id),
      primary,
      secondary: secondary || undefined,
      fullText: r.display_name,
      lat: r.lat ? Number(r.lat) : undefined,
      lng: r.lon ? Number(r.lon) : undefined,
    } satisfies LocationSuggestion;
  });

  return uniqueByFullText(suggestions);
}

export async function searchLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (mapboxToken) {
    try {
      return await searchWithMapbox(cleaned, mapboxToken);
    } catch {
      // Fall back so local development still has real location search.
    }
  }

  return searchWithNominatim(cleaned);
}
