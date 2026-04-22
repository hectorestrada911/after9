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

type MapboxSearchParams = {
  types: string;
  limit: string;
};

function mapboxFeaturesToSuggestions(
  json: {
    features?: Array<{
      id: string;
      text?: string;
      place_name?: string;
      center?: [number, number];
      context?: Array<{ text?: string }>;
      place_type?: string[];
    }>;
  },
  preferAddress: boolean,
): LocationSuggestion[] {
  const raw =
    json.features?.map((f) => {
      const primary = f.text?.trim() || f.place_name?.split(",")[0]?.trim() || "Location";
      const fullText = f.place_name?.trim() || primary;
      const context = f.context?.map((c) => c.text).filter(Boolean).join(", ");
      const isAddress = Boolean(f.place_type?.includes("address"));
      return {
        id: f.id,
        primary,
        secondary: context || undefined,
        fullText,
        lat: f.center?.[1],
        lng: f.center?.[0],
        _isAddress: isAddress,
      };
    }) ?? [];

  if (preferAddress) {
    raw.sort((a, b) => Number(b._isAddress) - Number(a._isAddress));
  }

  return raw.map(({ _isAddress, ...rest }): LocationSuggestion => rest);
}

async function searchWithMapbox(query: string, token: string, params: MapboxSearchParams): Promise<LocationSuggestion[]> {
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("types", params.types);
  url.searchParams.set("limit", params.limit);
  url.searchParams.set("access_token", token);
  const country = process.env.NEXT_PUBLIC_MAPBOX_GEOCODING_COUNTRY?.trim();
  if (country) url.searchParams.set("country", country.toLowerCase());

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Location search unavailable right now.");

  const json = (await res.json()) as {
    features?: Array<{
      id: string;
      text?: string;
      place_name?: string;
      center?: [number, number];
      context?: Array<{ text?: string }>;
      place_type?: string[];
    }>;
  };

  return uniqueByFullText(mapboxFeaturesToSuggestions(json, params.types.includes("address")));
}

/**
 * Queries that look like street addresses (contain a digit): merge `address`-typed results first,
 * then broader types, so rooftop-level hits are not buried under same-name roads in other regions.
 */
async function searchWithMapboxSmart(query: string, token: string): Promise<LocationSuggestion[]> {
  const hasDigit = /\d/.test(query);
  if (!hasDigit) {
    return searchWithMapbox(query, token, { types: "place,address,poi,neighborhood,locality", limit: "8" });
  }

  const [addressHits, broad] = await Promise.all([
    searchWithMapbox(query, token, { types: "address", limit: "10" }),
    searchWithMapbox(query, token, { types: "place,address,poi,neighborhood,locality", limit: "8" }),
  ]);
  return uniqueByFullText([...addressHits, ...broad]).slice(0, 8);
}

async function searchWithNominatim(query: string, userAgent: string): Promise<LocationSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { "User-Agent": userAgent, Accept: "application/json" },
  });
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

function nominatimUserAgent() {
  const app = process.env.NEXT_PUBLIC_APP_URL || "https://rage.events";
  return `RAGE-After9/1.0 (+${app})`;
}

/** Server-side search (Mapbox token from env, then Nominatim with a proper User-Agent). */
export async function runLocationSearch(query: string): Promise<LocationSuggestion[]> {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (mapboxToken) {
    try {
      return await searchWithMapboxSmart(cleaned, mapboxToken);
    } catch {
      // Fall through to Nominatim.
    }
  }

  return searchWithNominatim(cleaned, nominatimUserAgent());
}

/** Browser: calls the API route so the token is read on the server at request time (reliable on Vercel). */
export async function searchLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];

  if (typeof window === "undefined") {
    return runLocationSearch(cleaned);
  }

  const res = await fetch(`/api/location/suggest?q=${encodeURIComponent(cleaned)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Location search unavailable right now.");
  return (await res.json()) as LocationSuggestion[];
}
