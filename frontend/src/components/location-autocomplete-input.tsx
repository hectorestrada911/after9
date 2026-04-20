"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui";
import { searchLocationSuggestions, type LocationSuggestion } from "@/lib/location-search";

type LocationAutocompleteInputProps = {
  value: string;
  onChange: (_value: string) => void;
  onSelectSuggestion?: (_suggestion: LocationSuggestion) => void;
  required?: boolean;
  placeholder?: string;
  name?: string;
};

export function LocationAutocompleteInput({
  value,
  onChange,
  onSelectSuggestion,
  required,
  placeholder = "Venue or exact address",
  name = "location",
}: LocationAutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [items, setItems] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setQuery(value), [value]);

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
        const next = await searchLocationSuggestions(q);
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
  }, [query]);

  const showMenu = useMemo(() => open && (items.length > 0 || loading || !!error), [error, items.length, loading, open]);

  return (
    <div className="relative">
      <Input
        name={name}
        placeholder={placeholder}
        required={required}
        autoComplete="street-address"
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
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          {loading && <p className="px-3 py-2 text-sm text-muted">Searching places...</p>}
          {!loading && error && <p className="px-3 py-2 text-sm text-red-600">{error}</p>}
          {!loading &&
            !error &&
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="block w-full border-b border-line/70 px-3 py-2 text-left transition last:border-b-0 hover:bg-offwhite"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(item.fullText);
                  setQuery(item.fullText);
                  setOpen(false);
                  onSelectSuggestion?.(item);
                }}
              >
                <p className="text-sm font-semibold text-black">{item.primary}</p>
                {item.secondary ? <p className="text-xs text-muted">{item.secondary}</p> : null}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
