export const EVENT_DRAFT_STORAGE_KEY = "after9:event-draft";

export type EventDraftV1 = {
  v: 1;
  coverMode: "stock" | "upload";
  /** Public image URL (stock Unsplash) or placeholder when upload is pending */
  imageUrl: string;
  /** Base64 data URL when coverMode is upload */
  imageDataUrl?: string | null;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  ticketPrice: number;
  ticketsAvailable: number;
  visibility: "public" | "private";
  ageRestriction: "all_ages" | "age_18_plus" | "age_21_plus";
  dressCode?: string;
  instructions?: string;
  locationNote?: string;
};

const PLACEHOLDER_COVER = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80";

export function placeholderCoverUrl() {
  return PLACEHOLDER_COVER;
}

export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "/dashboard";
  const path = raw.split("?")[0] ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  if (!path.startsWith("/dashboard")) return "/dashboard";
  return path;
}

export function readEventDraft(): EventDraftV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EVENT_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EventDraftV1;
    if (parsed?.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeEventDraft(draft: EventDraftV1) {
  sessionStorage.setItem(EVENT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearEventDraft() {
  sessionStorage.removeItem(EVENT_DRAFT_STORAGE_KEY);
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

export const MAX_DRAFT_IMAGE_BYTES = 1_400_000;
