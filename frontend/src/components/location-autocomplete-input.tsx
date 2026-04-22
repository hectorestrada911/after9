"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui";
import { searchLocationSuggestions, type LocationSuggestion } from "@/lib/location-search";
import { cn } from "@/lib/utils";

type LocationAutocompleteInputProps = {
  value: string;
  // eslint-disable-next-line no-unused-vars -- callback signature (not a runtime binding)
  onChange: (next: string) => void;
  // eslint-disable-next-line no-unused-vars
  onSelectSuggestion?: (item: LocationSuggestion) => void;
  required?: boolean;
  placeholder?: string;
  name?: string;
  /** Dark fields for create-event; light is default (checkout, etc.). */
  theme?: "light" | "dark";
};

const darkInputClass =
  "h-11 rounded-xl border border-white/[0.14] bg-white/[0.07] px-3.5 text-[13px] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-zinc-500 focus:border-brand-green/55 focus:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-brand-green/25";

export function LocationAutocompleteInput({
  value,
  onChange,
  onSelectSuggestion,
  required,
  placeholder = "Venue or exact address",
  name = "location",
  theme = "light",
}: LocationAutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [items, setItems] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Mapbox `proximity=lng,lat` when the browser shares coarse location (biases toward e.g. San Diego). */
  const [proximity, setProximity] = useState<string | undefined>();

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setProximity(`${longitude},${latitude}`);
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    let ignore = false;
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const next = await searchLocationSuggestions(q, { proximity });
        if (!ignore) {
          setItems(next);
          setOpen(true);
        }
      } catch {
        if (!ignore) setError("Could not load location suggestions.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [query, proximity]);

  const showMenu = useMemo(() => open && (items.length > 0 || loading || !!error), [error, items.length, loading, open]);

  const menuClass =
    theme === "dark"
      ? "absolute z-[100] mt-1 w-full overflow-hidden rounded-xl border border-white/[0.14] bg-[#0a0a0a] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.85)]"
      : "absolute z-[100] mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lg";

  return (
    <div className="relative">
      <Input
        name={name}
        placeholder={placeholder}
        required={required}
        autoComplete="street-address"
        className={theme === "dark" ? darkInputClass : undefined}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next);
          setQuery(next);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      />
      {showMenu && (
        <div className={menuClass}>
          {loading && (
            <p className={cn("px-3 py-2 text-sm", theme === "dark" ? "text-zinc-400" : "text-muted")}>Searching places...</p>
          )}
          {!loading && error && (
            <p className={cn("px-3 py-2 text-sm", theme === "dark" ? "text-red-400" : "text-red-600")}>{error}</p>
          )}
          {!loading &&
            !error &&
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "block w-full border-b px-3 py-2 text-left transition last:border-b-0",
                  theme === "dark"
                    ? "border-white/[0.08] hover:bg-white/[0.06]"
                    : "border-line/70 hover:bg-offwhite",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(item.fullText);
                  setQuery(item.fullText);
                  setOpen(false);
                  onSelectSuggestion?.(item);
                }}
              >
                <p className={cn("text-sm font-semibold", theme === "dark" ? "text-white" : "text-black")}>{item.primary}</p>
                {item.secondary ? (
                  <p className={cn("text-xs", theme === "dark" ? "text-zinc-500" : "text-muted")}>{item.secondary}</p>
                ) : null}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
