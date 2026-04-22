import type { Visibility } from "@/lib/types";

export function isEventVisibility(value: string): value is Visibility {
  return value === "public" || value === "unlisted" || value === "private";
}

export function eventVisibilityLabel(visibility: string): "Public" | "Unlisted" | "Private" {
  if (visibility === "private") return "Private";
  if (visibility === "unlisted") return "Unlisted";
  return "Public";
}

export function coerceEventVisibility(value: string | undefined | null): Visibility {
  if (value && isEventVisibility(value)) return value;
  return "unlisted";
}
