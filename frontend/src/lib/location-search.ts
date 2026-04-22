export type LocationSuggestion = {
  id: string;
  primary: string;
  secondary?: string;
  fullText: string;
  lat?: number;
  lng?: number;
};

export type LocationSearchOptions = {
  /** Mapbox bias: `longitude,latitude` (e.g. from the browser). */
  proximity?: string;
};

/** ISO 3166-1 alpha-2 for Mapbox `country` and Nominatim `countrycodes`. */
function resolveGeocodingCountry(): string | null {
  const raw = process.env.NEXT_PUBLIC_MAPBOX_GEOCODING_COUNTRY?.trim().toLowerCase();
  if (raw === "world" || raw === "off" || raw === "global") return null;
  if (raw && raw.length === 2) return raw;
  return "us";
}

function sanitizeProximity(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  const parts = t.split(",");
  if (parts.length !== 2) return undefined;
  const lng = Number(parts[0]);
  const lat = Number(parts[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return undefined;
  return `${lng},${lat}`;
}

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
  proximity?: string;
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
  const features = [...(json.features ?? [])];
  if (preferAddress) {
    features.sort((a, b) => Number(b.place_type?.includes("address")) - Number(a.place_type?.includes("address")));
  }

  return (
    features.map((f) => {
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
    }) ?? []
  );
}

async function searchWithMapbox(query: string, token: string, params: MapboxSearchParams): Promise<LocationSuggestion[]> {
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("types", params.types);
  url.searchParams.set("limit", params.limit);
  url.searchParams.set("access_token", token);
  const country = resolveGeocodingCountry();
  if (country) url.searchParams.set("country", country);
  const prox = sanitizeProximity(params.proximity);
  if (prox) url.searchParams.set("proximity", prox);

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
function withProximity(params: MapboxSearchParams, proximity?: string): MapboxSearchParams {
  const p = sanitizeProximity(proximity);
  return p ? { ...params, proximity: p } : params;
}

async function searchWithMapboxSmart(query: string, token: string, opts?: LocationSearchOptions): Promise<LocationSuggestion[]> {
  const proximity = opts?.proximity;
  const hasDigit = /\d/.test(query);
  if (!hasDigit) {
    return searchWithMapbox(query, token, withProximity({ types: "place,address,poi,neighborhood,locality", limit: "8" }, proximity));
  }

  const [addressHits, broad] = await Promise.all([
    searchWithMapbox(query, token, withProximity({ types: "address", limit: "10" }, proximity)),
    searchWithMapbox(query, token, withProximity({ types: "place,address,poi,neighborhood,locality", limit: "8" }, proximity)),
  ]);
  return uniqueByFullText([...addressHits, ...broad]).slice(0, 8);
}

async function searchWithNominatim(query: string, userAgent: string): Promise<LocationSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  const cc = resolveGeocodingCountry();
  if (cc) url.searchParams.set("countrycodes", cc);

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
export async function runLocationSearch(query: string, options?: LocationSearchOptions): Promise<LocationSuggestion[]> {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];

  const prox = sanitizeProximity(options?.proximity);
  const safeOptions: LocationSearchOptions | undefined = prox ? { proximity: prox } : undefined;

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (mapboxToken) {
    try {
      return await searchWithMapboxSmart(cleaned, mapboxToken, safeOptions);
    } catch {
      // Fall through to Nominatim.
    }
  }

  return searchWithNominatim(cleaned, nominatimUserAgent());
}

/** Browser: calls the API route so the token is read on the server at request time (reliable on Vercel). */
export async function searchLocationSuggestions(query: string, options?: LocationSearchOptions): Promise<LocationSuggestion[]> {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];

  if (typeof window === "undefined") {
    return runLocationSearch(cleaned, options);
  }

  const prox = sanitizeProximity(options?.proximity);
  const proxParam = prox ? `&proximity=${encodeURIComponent(prox)}` : "";
  const res = await fetch(`/api/location/suggest?q=${encodeURIComponent(cleaned)}${proxParam}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Location search unavailable right now.");
  return (await res.json()) as LocationSuggestion[];
}
