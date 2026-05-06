"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, Globe2, ImagePlus, Link2, Loader2, Search, Sparkles, Upload, X } from "lucide-react";
import { eventSchema } from "@/lib/validations";
import { MAX_DRAFT_IMAGE_BYTES, placeholderCoverUrl, readEventDraft, writeEventDraft, type EventDraftV1 } from "@/lib/event-draft";
import { FLYER_CATEGORIES, FLYER_STOCK, filterFlyerStock, type FlyerCategory } from "@/lib/flyer-stock";
import { hostNetFromGrossCents, platformFeeFromGrossCents, resolvePlatformFeePercent } from "@/lib/platform-fees";
import { coerceEventVisibility } from "@/lib/event-visibility";
import { flushUi } from "@/lib/flush-ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Visibility } from "@/lib/types";
import { LocationAutocompleteInput } from "@/components/location-autocomplete-input";
import { cn } from "@/lib/utils";

const NEXT_AFTER_AUTH = "/dashboard/events/new";

export type CreateEventFlowMode = "auto" | "guestDraft" | "hostPublish";

export type CreateEventPublishPayload = {
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  ticketPrice: number;
  ticketsAvailable: number;
  salesEnabled: boolean;
  visibility: Visibility;
  ageRestriction: EventDraftV1["ageRestriction"];
  dressCode?: string;
  instructions?: string;
  locationNote?: string;
  showCapacityPublicly: boolean;
  coverMode: "stock" | "upload";
  uploadDataUrl: string | null;
};

const UNLIMITED_TICKETS = 5000;

function localDateISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Encode draft image under byte budget; resizes JPEG/PNG/WebP in-browser. */
async function fileToDraftDataUrl(file: File, maxStrLen: number): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif") {
    throw new Error("HEIC isn’t supported in the browser yet. Export as JPG in Photos, or pick a stock flyer.");
  }
  if (file.type === "image/gif") {
    const s = await readFileAsDataUrl(file);
    if (s.length > maxStrLen) throw new Error("GIF is too large. Try JPG/PNG or a stock image.");
    return s;
  }
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
    throw new Error("Use JPG, PNG, or WebP (or pick a stock flyer).");
  }
  if (file.size < 700_000) {
    const s = await readFileAsDataUrl(file);
    if (s.length <= maxStrLen) return s;
  }
  return compressToJpegDataUrl(file, maxStrLen);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      if (typeof r.result === "string") resolve(r.result);
      else reject(new Error("Could not read file."));
    };
    r.onerror = () => reject(new Error("Could not read file."));
    r.readAsDataURL(file);
  });
}

function compressToJpegDataUrl(file: File, maxStrLen: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 2000;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image."));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      let q = 0.9;
      let out = c.toDataURL("image/jpeg", q);
      let guard = 0;
      while (out.length > maxStrLen && q > 0.45 && guard < 14) {
        q -= 0.05;
        out = c.toDataURL("image/jpeg", q);
        guard += 1;
      }
      let shrink = 0.94;
      guard = 0;
      while (out.length > maxStrLen && shrink > 0.4 && guard < 12) {
        const w2 = Math.max(280, Math.round(w * shrink));
        const h2 = Math.max(280, Math.round(h * shrink));
        c.width = w2;
        c.height = h2;
        ctx.drawImage(img, 0, 0, w2, h2);
        out = c.toDataURL("image/jpeg", Math.max(0.45, q));
        shrink -= 0.07;
        guard += 1;
      }
      if (out.length > maxStrLen) {
        reject(new Error("Still too large after compressing. Try a smaller photo or a stock flyer."));
        return;
      }
      resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid or corrupted image."));
    };
    img.src = url;
  });
}

const field =
  "h-12 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 text-[14px] font-normal text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] placeholder:text-zinc-600 transition-colors duration-200 " +
  "focus:border-brand-green/55 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-brand-green/25";

const labelClass = "mb-1.5 block text-[12.5px] font-medium text-zinc-200";
const subLabelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500";

/** Section card — numbered header + subtitle + body. Visual structure only; no field changes. */
function SectionCard({
  step,
  title,
  subtitle,
  done,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-300",
            done
              ? "bg-brand-green text-black shadow-[0_0_18px_-4px_rgba(75,250,148,0.55)]"
              : "border border-white/15 bg-white/[0.05] text-zinc-300",
          )}
          aria-hidden
        >
          {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold tracking-tight text-zinc-100">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">{subtitle}</p> : null}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Segmented two-state toggle (Unlimited / Set capacity) — same boolean behavior, clearer UI than the action button. */
function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  // eslint-disable-next-line no-unused-vars -- onChange callback parameter name is part of the API
  onChange: (next: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex w-full items-center gap-1 rounded-xl border border-white/[0.1] bg-white/[0.03] p-1">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors duration-200",
              active
                ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Switch — for binary toggles (Free event / Show capacity publicly). Same checkbox semantics with platform-correct styling. */
function Switch({
  checked,
  onCheckedChange,
  label,
  hint,
}: {
  checked: boolean;
  // eslint-disable-next-line no-unused-vars -- onCheckedChange callback parameter name is part of the API
  onCheckedChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-3 text-left transition-colors duration-200 hover:border-white/20"
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-zinc-100">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] text-zinc-500">{hint}</span> : null}
      </span>
      <span
        className={cn(
          "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-brand-green shadow-[0_0_16px_-4px_rgba(75,250,148,0.55)]" : "bg-white/15",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-transform duration-200",
            checked ? "translate-x-[16px]" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

type CreateEventFlowProps = {
  flowMode?: CreateEventFlowMode;
  // eslint-disable-next-line no-unused-vars -- type-only callback payload name
  onPublish?(payload: CreateEventPublishPayload): void | Promise<void>;
};

type PublishConfirmDraft = {
  payload: CreateEventPublishPayload;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  ticketPrice: number;
  ticketsAvailable: number;
};

export function CreateEventFlow({ flowMode = "auto", onPublish }: CreateEventFlowProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [microWin, setMicroWin] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [flyCategory, setFlyCategory] = useState<FlyerCategory>("all");
  const [coverMode, setCoverMode] = useState<"stock" | "upload">("stock");
  const [selectedStockId, setSelectedStockId] = useState(FLYER_STOCK[0]!.id);
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [flyerPickerOpen, setFlyerPickerOpen] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDraft, setConfirmDraft] = useState<PublishConfirmDraft | null>(null);
  const [hostDisplayName, setHostDisplayName] = useState("Host");
  const [organizationName, setOrganizationName] = useState("");
  const [hasSelectedFlyer, setHasSelectedFlyer] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [ticketPrice, setTicketPrice] = useState("15");
  const [ticketsAvailable, setTicketsAvailable] = useState("120");
  const [limitTicketQuantity, setLimitTicketQuantity] = useState(false);
  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("unlisted");
  const [ageRestriction, setAgeRestriction] = useState<EventDraftV1["ageRestriction"]>("all_ages");
  const [dressCode, setDressCode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [showCapacityPublicly, setShowCapacityPublicly] = useState(false);
  const [hasAuthedSession, setHasAuthedSession] = useState(false);
  const [restoredDraftStep, setRestoredDraftStep] = useState<number | null>(null);
  const hydratedDraftRef = useRef(false);
  const platformFeePercent = resolvePlatformFeePercent(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT);

  const resolvedMode: "guestDraft" | "hostPublish" =
    flowMode === "hostPublish" ? "hostPublish" : flowMode === "guestDraft" ? "guestDraft" : hasAuthedSession ? "hostPublish" : "guestDraft";

  const filteredStock = useMemo(() => filterFlyerStock(search, flyCategory), [search, flyCategory]);
  const selectedStock = FLYER_STOCK.find((i) => i.id === selectedStockId) ?? FLYER_STOCK[0]!;
  const coverThumbSrc = useMemo(
    () => (coverMode === "upload" && uploadDataUrl ? uploadDataUrl : selectedStock.thumb),
    [coverMode, uploadDataUrl, selectedStock.thumb],
  );

  useEffect(() => {
    setDate((d) => d || localDateISO());
    setStartTime((t) => t || "20:00");
    setEndTime((t) => t || "23:30");
  }, []);

  useEffect(() => {
    let ignore = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (ignore) return;
        setHasAuthedSession(Boolean(data.session?.user));
      })
      .catch(() => {
        if (!ignore) setHasAuthedSession(false);
      });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasAuthedSession(Boolean(session?.user));
    });
    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (hydratedDraftRef.current) return;
    const draft = readEventDraft();
    if (!draft || draft.v !== 1) return;
    hydratedDraftRef.current = true;
    setRestoredDraftStep(0);
    setTitle(draft.title);
    setDescription(draft.description);
    setDate(draft.date);
    setStartTime(draft.startTime);
    setEndTime(draft.endTime);
    setLocation(draft.location);
    const nextFree = draft.ticketPrice <= 0;
    setIsFreeEvent(nextFree);
    setTicketPrice(nextFree ? "0" : String(draft.ticketPrice));
    const draftLooksUnlimited = draft.ticketsAvailable >= UNLIMITED_TICKETS;
    setLimitTicketQuantity(!draftLooksUnlimited);
    setTicketsAvailable(draftLooksUnlimited ? "120" : String(draft.ticketsAvailable));
    setVisibility(coerceEventVisibility(draft.visibility));
    setAgeRestriction(draft.ageRestriction);
    setShowCapacityPublicly(draft.showCapacityPublicly ?? false);
    setDressCode(draft.dressCode ?? "");
    setInstructions(draft.instructions ?? "");
    setLocationNote(draft.locationNote ?? "");
    if (draft.coverMode === "upload" && draft.imageDataUrl) {
      setCoverMode("upload");
      setUploadDataUrl(draft.imageDataUrl);
      setHasSelectedFlyer(true);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setCoverMode("stock");
      const match = FLYER_STOCK.find((i) => i.url === draft.imageUrl);
      if (match) setSelectedStockId(match.id);
      setHasSelectedFlyer(true);
      setUploadDataUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!hasAuthedSession) {
      setHostDisplayName("Host");
      return;
    }
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        const userId = data.user?.id;
        if (!userId || ignore) return;
        const { data: profile } = await supabase.from("profiles").select("organizer_name").eq("id", userId).maybeSingle();
        if (!ignore && profile?.organizer_name?.trim()) {
          const organizer = profile.organizer_name.trim();
          setHostDisplayName(organizer);
          setOrganizationName((prev) => (prev.trim() ? prev : organizer));
        }
      })
      .catch(() => {
        if (!ignore) setHostDisplayName("Host");
      });
    return () => {
      ignore = true;
    };
  }, [hasAuthedSession, supabase]);

  useEffect(() => {
    if (filteredStock.some((i) => i.id === selectedStockId)) return;
    const first = filteredStock[0];
    if (first) {
      setCoverMode("stock");
      setSelectedStockId(first.id);
      setUploadDataUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [filteredStock, selectedStockId]);

  useEffect(() => {
    if (!microWin) return;
    const t = window.setTimeout(() => setMicroWin(null), 2200);
    return () => window.clearTimeout(t);
  }, [microWin]);

  useEffect(() => {
    if (!flyerPickerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [flyerPickerOpen]);

  function flash(msg: string) {
    setMicroWin(msg);
  }

  function pickStock(id: string) {
    setCoverMode("stock");
    setSelectedStockId(id);
    setHasSelectedFlyer(true);
    setUploadDataUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onFileChange(f: File | null) {
    if (!f) return;
    setError(null);
    const maxRawBytes = 18 * 1024 * 1024;
    if (f.size > maxRawBytes) {
      setError("That file is too large to open in the browser. Try under ~18MB or a stock flyer.");
      return;
    }
    setUploadBusy(true);
    try {
      const data = await fileToDraftDataUrl(f, MAX_DRAFT_IMAGE_BYTES);
      setCoverMode("upload");
      setUploadDataUrl(data);
      setHasSelectedFlyer(true);
      flash("Upload locked in");
      setFlyerPickerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process that image.");
    } finally {
      setUploadBusy(false);
    }
  }

  function validateStep0(): boolean {
    if (!hasSelectedFlyer) {
      setError("Select a flyer to continue.");
      return false;
    }
    if (coverMode === "upload" && !uploadDataUrl) {
      setError("Upload a flyer image or select a stock flyer.");
      return false;
    }
    return true;
  }

  function validateStep1(): boolean {
    if (title.trim().length < 3) {
      setError("Give the night a title (at least 3 characters).");
      return false;
    }
    if (!date || !startTime || !endTime) {
      setError("Set date and both times.");
      return false;
    }
    if (location.trim().length < 3) {
      setError("Add where it happens.");
      return false;
    }
    if (organizationName.trim().length < 2) {
      setError("Add your organizer or brand name.");
      return false;
    }
    return true;
  }

  async function finalizeWizard(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateStep0()) return;
    if (!validateStep1()) return;

    const imageUrl = coverMode === "upload" ? placeholderCoverUrl() : selectedStock.url;

    const ticketLimitCount = Number(ticketsAvailable) || 0;
    const effectiveTicketsAvailable = limitTicketQuantity ? ticketLimitCount : UNLIMITED_TICKETS;
    const capacity = effectiveTicketsAvailable;
    const parsed = eventSchema.safeParse({
      title,
      description: description.trim(),
      imageUrl,
      date,
      startTime,
      endTime,
      location,
      capacity,
      ticketPrice: isFreeEvent ? 0 : ticketPrice,
      ticketsAvailable: effectiveTicketsAvailable,
      visibility,
      ageRestriction,
      dressCode: dressCode || undefined,
      instructions: instructions || undefined,
      locationNote: locationNote || undefined,
      showCapacityPublicly,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Double-check the numbers and try again.");
      return;
    }

    const draft: EventDraftV1 = {
      v: 1,
      coverMode,
      imageUrl: coverMode === "stock" ? selectedStock.url : placeholderCoverUrl(),
      imageDataUrl: coverMode === "upload" ? uploadDataUrl : null,
      title: parsed.data.title,
      description: parsed.data.description,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      location: parsed.data.location,
      capacity: parsed.data.capacity,
      ticketPrice: parsed.data.ticketPrice,
      ticketsAvailable: parsed.data.ticketsAvailable,
      salesEnabled: true,
      visibility: parsed.data.visibility,
      ageRestriction: parsed.data.ageRestriction,
      showCapacityPublicly,
      dressCode: parsed.data.dressCode,
      instructions: parsed.data.instructions,
      locationNote: parsed.data.locationNote,
    };

    if (coverMode === "upload" && !uploadDataUrl) {
      setError("Upload a flyer or choose from the gallery.");
      return;
    }

    if (resolvedMode === "hostPublish") {
      try {
        writeEventDraft(draft);
      } catch {
        setError("Couldn't save the draft. Try a smaller image.");
        return;
      }
      if (onPublish) {
        setConfirmDraft({
          title: parsed.data.title,
          date: parsed.data.date,
          startTime: parsed.data.startTime,
          endTime: parsed.data.endTime,
          location: parsed.data.location,
          ticketPrice: parsed.data.ticketPrice,
          ticketsAvailable: parsed.data.ticketsAvailable,
          payload: {
            title: parsed.data.title,
            description: parsed.data.description,
            imageUrl: parsed.data.imageUrl,
            date: parsed.data.date,
            startTime: parsed.data.startTime,
            endTime: parsed.data.endTime,
            location: parsed.data.location,
            capacity: parsed.data.capacity,
            ticketPrice: parsed.data.ticketPrice,
            ticketsAvailable: parsed.data.ticketsAvailable,
            salesEnabled: true,
            visibility: parsed.data.visibility,
            ageRestriction: parsed.data.ageRestriction,
            dressCode: parsed.data.dressCode,
            instructions: parsed.data.instructions,
            locationNote: parsed.data.locationNote,
            showCapacityPublicly,
            coverMode,
            uploadDataUrl: coverMode === "upload" ? uploadDataUrl : null,
          },
        });
        return;
      }

      router.replace(NEXT_AFTER_AUTH);
      return;
    }

    try {
      writeEventDraft(draft);
    } catch {
      setError("Couldn't save the draft. Try a smaller image.");
      return;
    }

    const next = encodeURIComponent(NEXT_AFTER_AUTH);
    try {
      sessionStorage.setItem("after9:org-name-draft", organizationName.trim());
    } catch {
      // Best-effort only; onboarding can still proceed without a prefill.
    }
    router.push(`/signup?next=${next}`);
  }

  /** Real per-section completion — drives the progress bar and the section card check marks. */
  const sectionDone = useMemo(() => {
    const flyer = hasSelectedFlyer && (coverMode === "stock" || Boolean(uploadDataUrl));
    const story =
      title.trim().length >= 3 &&
      Boolean(date && startTime && endTime) &&
      location.trim().length >= 3 &&
      organizationName.trim().length >= 2;
    /* Tickets section has working defaults out of the box. */
    const tickets = true;
    return { flyer, story, tickets };
  }, [hasSelectedFlyer, coverMode, uploadDataUrl, title, date, startTime, endTime, location, organizationName]);
  const completedSections = (sectionDone.flyer ? 1 : 0) + (sectionDone.story ? 1 : 0) + (sectionDone.tickets ? 1 : 0);
  const pct = Math.round((completedSections / 3) * 100);

  const ticketPriceFloat = isFreeEvent ? 0 : Number(ticketPrice) || 0;
  const ticketPriceCents = Math.max(0, Math.round(ticketPriceFloat * 100));
  const platformFeeCents = platformFeeFromGrossCents(ticketPriceCents, platformFeePercent);
  const hostNetCents = hostNetFromGrossCents(ticketPriceCents, platformFeePercent);

  async function publishConfirmedEvent() {
    if (!confirmDraft || !onPublish) return;
    flushUi(() => setPublishBusy(true));
    try {
      await onPublish(confirmDraft.payload);
      setConfirmDraft(null);
    } finally {
      flushUi(() => setPublishBusy(false));
    }
  }

  return (
    <main className="relative min-h-dvh bg-[#030303] text-zinc-300 antialiased">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 65% 50% at 50% -10%, rgba(75,250,148,0.12), transparent 50%), radial-gradient(circle at 100% 0%, rgba(255,255,255,0.04), transparent 42%)",
        }}
      />

      <div className="fixed left-0 right-0 top-0 z-20 h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-brand-green via-emerald-300 to-brand-green transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="relative flex min-h-dvh flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#030303]/80 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-6">
          <Link href="/" className="group inline-flex items-center gap-2 transition">
            <span className="text-[13px] font-black tracking-tight text-white transition-colors group-hover:text-zinc-300">RAGE</span>
            <span className="hidden h-3 w-px bg-white/15 sm:inline-block" aria-hidden />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Create event</span>
          </Link>
          {hasAuthedSession ? (
            <Link
              href={NEXT_AFTER_AUTH}
              className="inline-flex h-8 items-center rounded-full border border-white/15 bg-white/[0.04] px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-white/35 hover:text-white"
            >
              Host tools
            </Link>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(NEXT_AFTER_AUTH)}`}
              className="inline-flex h-8 items-center rounded-full border border-white/15 bg-white/[0.04] px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-white/35 hover:text-white"
            >
              Log in
            </Link>
          )}
        </header>

        <div className="mx-auto w-full max-w-md flex-1 px-4 pb-36 pt-3 sm:max-w-xl sm:px-6 sm:pb-28 sm:pt-5">
          <div className="mb-7 text-center">
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-green/80">Create your event</p>
            <h1 className="mt-2 text-[1.62rem] font-semibold leading-[1.12] tracking-[-0.02em] text-zinc-50 sm:text-[2rem]">
              Flyer, story, and tickets, all in one place
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[12.5px] leading-relaxed text-zinc-500">
              Three quick sections, then publish. We&apos;ll save your draft locally as you go.
            </p>
            {/* Section progress chips — discrete, glanceable */}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1.5">
              {(
                [
                  { id: "flyer", label: "Flyer", done: sectionDone.flyer },
                  { id: "story", label: "Story", done: sectionDone.story },
                  { id: "tickets", label: "Tickets", done: sectionDone.tickets },
                ] as const
              ).map((s) => (
                <span
                  key={s.id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors",
                    s.done ? "bg-brand-green/15 text-brand-green" : "text-zinc-500",
                  )}
                >
                  <span className={cn("inline-block h-1.5 w-1.5 rounded-full", s.done ? "bg-brand-green" : "bg-zinc-600")} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {restoredDraftStep !== null ? (
            <div className="mb-5 rounded-2xl border border-brand-green/30 bg-brand-green/12 px-4 py-3 text-sm text-zinc-100">
              <p className="font-semibold">We loaded a saved draft from this browser.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRestoredDraftStep(null)}
                  className="inline-flex h-8 items-center rounded-full border border-white/20 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-white/40"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {microWin && (
            <div
              className="animate-createPop mb-6 flex items-center justify-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/15 px-4 py-2.5 text-center text-[13px] font-medium text-brand-green"
              role="status"
            >
              <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} />
              {microWin}
            </div>
          )}

          <form onSubmit={finalizeWizard} className="space-y-5 sm:space-y-6">
            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-center text-[12px] text-red-200">{error}</p>
            )}

            {/* ── 1. Flyer ── */}
            <SectionCard
              step={1}
              title="The flyer"
              subtitle="Vertical 4:5 — this is the first thing guests see."
              done={sectionDone.flyer}
            >
              {hasSelectedFlyer ? (
                <div className="mx-auto w-full max-w-[360px]">
                  <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-900">
                    <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/35 via-transparent to-black/10 opacity-90" />
                    <div className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:ring-brand-green/40" />
                    {/* eslint-disable-next-line @next/next/no-img-element -- supports stock + data URL preview reliably */}
                    <img src={coverThumbSrc} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]" />
                    <span className="absolute bottom-2.5 left-2.5 z-[2] inline-flex rounded-full border border-white/20 bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      Hosted by {organizationName.trim() || hostDisplayName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-[360px]">
                  <button
                    type="button"
                    onClick={() => setFlyerPickerOpen(true)}
                    className="group relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-zinc-900/70 transition-colors hover:border-brand-green/45"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 50% 22%, rgba(75,250,148,0.16), transparent 45%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05), transparent 45%)",
                      }}
                    />
                    <span className="relative z-[2] grid h-14 w-14 place-items-center rounded-2xl border border-brand-green/30 bg-brand-green/15 text-brand-green shadow-[0_0_28px_-12px_rgba(75,250,148,0.6)]">
                      <ImagePlus className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <span className="relative z-[2] mt-4 text-[15px] font-semibold text-white">Select a flyer</span>
                    <span className="relative z-[2] mt-1.5 text-[12px] text-zinc-400">Pick from gallery or upload your own</span>
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-zinc-500">
                  {hasSelectedFlyer ? "Want a different look? Tap Change." : "Vertical 4:5 (1080×1350) reads best."}
                </p>
                {hasSelectedFlyer ? (
                  <button
                    type="button"
                    onClick={() => setFlyerPickerOpen(true)}
                    className="inline-flex h-9 shrink-0 items-center rounded-full border border-white/20 bg-white/[0.05] px-3.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:border-white/40"
                  >
                    Change
                  </button>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,.heic,.heif"
                className="hidden"
                onChange={(ev) => {
                  const input = ev.target;
                  const f = input.files?.[0] ?? null;
                  void onFileChange(f).finally(() => {
                    input.value = "";
                  });
                }}
              />
            </SectionCard>

            {/* ── 2. Story ── */}
            <SectionCard
              step={2}
              title="The story"
              subtitle="Title, when, where, and who's hosting."
              done={sectionDone.story}
            >
              <div>
                <label htmlFor="ce-title" className={labelClass}>Event title</label>
                <input id="ce-title" className={field} placeholder="e.g. Rooftop sunset social" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label htmlFor="ce-desc" className={labelClass}>What happens?</label>
                <textarea
                  id="ce-desc"
                  className={`${field} min-h-[120px] resize-y py-2.5 leading-relaxed`}
                  placeholder="Optional: energy, dress code hints, special guests…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <span className={labelClass}>When</span>
                <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">We prefilled tonight. Tweak anything.</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <span className={subLabelClass}>Date</span>
                    <input className={field} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div>
                    <span className={subLabelClass}>Starts</span>
                    <input className={field} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <span className={subLabelClass}>Ends</span>
                    <input className={field} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="ce-location" className={labelClass}>Venue or address</label>
                <LocationAutocompleteInput
                  value={location}
                  onChange={setLocation}
                  placeholder="Guests need to find it"
                  theme="dark"
                />
              </div>
              <div>
                <label htmlFor="ce-org" className={labelClass}>Organizer or brand name</label>
                <input
                  id="ce-org"
                  className={field}
                  placeholder="e.g. After Hours Collective"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
                  Guests see this as <span className="font-semibold text-zinc-300">Hosted by …</span> on your event page.
                </p>
              </div>
              <div>
                <label htmlFor="ce-locnote" className={labelClass}>Location note <span className="font-normal text-zinc-500">(optional)</span></label>
                <input id="ce-locnote" className={field} placeholder="Door code, floor, landmark…" value={locationNote} onChange={(e) => setLocationNote(e.target.value)} />
              </div>
            </SectionCard>

            {/* ── 3. Tickets ── */}
            <SectionCard
              step={3}
              title="Tickets & access"
              subtitle="Price, capacity, and who can find it."
              done={sectionDone.tickets}
            >
              <Switch
                checked={isFreeEvent}
                onCheckedChange={(next) => {
                  setIsFreeEvent(next);
                  if (next) setTicketPrice("0");
                  else if ((Number(ticketPrice) || 0) < 0.5) setTicketPrice("15");
                }}
                label="Free event (RSVP / testing)"
                hint="Skip card checkout. Guests still get a ticket QR."
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="ce-price" className={labelClass}>Ticket price <span className="font-normal text-zinc-500">(USD)</span></label>
                  <div className={cn("relative", isFreeEvent && "opacity-50")}>
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-zinc-500">$</span>
                    <input
                      id="ce-price"
                      className={cn(field, "pl-7 tabular-nums")}
                      type="number"
                      step="0.01"
                      min={isFreeEvent ? 0 : 0.5}
                      value={ticketPrice}
                      disabled={isFreeEvent}
                      onChange={(e) => setTicketPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <span className={labelClass}>Ticket quantity</span>
                  <SegmentedToggle
                    ariaLabel="Ticket quantity"
                    value={limitTicketQuantity ? "limited" : "unlimited"}
                    options={[
                      { id: "unlimited", label: "Unlimited" },
                      { id: "limited", label: "Set capacity" },
                    ] as const}
                    onChange={(next) => setLimitTicketQuantity(next === "limited")}
                  />
                  {limitTicketQuantity ? (
                    <input
                      className={`${field} mt-2 tabular-nums`}
                      type="number"
                      min={1}
                      value={ticketsAvailable}
                      onChange={(e) => setTicketsAvailable(e.target.value)}
                      placeholder="120"
                    />
                  ) : (
                    <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">Sales stay open until you turn them off.</p>
                  )}
                </div>
              </div>

              {/* Price preview — promoted: gradient surface, big "you receive" */}
              <div className="overflow-hidden rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-green/[0.08] via-white/[0.03] to-transparent p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-green/80">Price preview</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Guest pays</p>
                    <p className="mt-1 text-base font-black tabular-nums text-white sm:text-lg">${ticketPriceFloat.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Platform fee</p>
                    <p className="mt-1 text-base font-black tabular-nums text-zinc-300 sm:text-lg">-${(platformFeeCents / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-green/80">You receive</p>
                    <p className="mt-1 text-base font-black tabular-nums text-brand-green sm:text-lg">${(hostNetCents / 100).toFixed(2)}</p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                  {isFreeEvent
                    ? "Free events skip card checkout. Guests still get ticket QR codes."
                    : "Stripe processing fees are separate and can vary by card/payment method."}
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-brand-green/20 bg-brand-green/[0.06] px-3.5 py-3 text-[12px] leading-relaxed text-zinc-300">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                <span>
                  Sales turn <span className="font-semibold text-brand-green">ON automatically</span> after publish — guests can buy right away. Pause anytime from the host event page.
                </span>
              </div>

              {/* Listing — 3-card radio replaces the native select. Same 3 options, much clearer hierarchy. */}
              <div>
                <span className={labelClass}>Who can find it</span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(
                    [
                      {
                        id: "public" as Visibility,
                        label: "Public",
                        hint: "Shown on the home page",
                        Icon: Globe2,
                      },
                      {
                        id: "unlisted" as Visibility,
                        label: "Unlisted",
                        hint: "Anyone with the link",
                        Icon: Link2,
                      },
                      {
                        id: "private" as Visibility,
                        label: "Private",
                        hint: "You only (signed in)",
                        Icon: EyeOff,
                      },
                    ] as const
                  ).map(({ id, label, hint, Icon }) => {
                    const active = visibility === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setVisibility(id)}
                        aria-pressed={active}
                        className={cn(
                          "group relative flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-colors duration-200",
                          active
                            ? "border-brand-green/55 bg-brand-green/[0.08] shadow-[0_0_22px_-12px_rgba(75,250,148,0.6)]"
                            : "border-white/[0.1] bg-white/[0.02] hover:border-white/25",
                        )}
                      >
                        <span className="flex w-full items-center justify-between">
                          <Icon className={cn("h-4 w-4", active ? "text-brand-green" : "text-zinc-400")} strokeWidth={1.75} />
                          {active ? (
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-green text-black">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          ) : null}
                        </span>
                        <span className={cn("text-[13px] font-semibold", active ? "text-white" : "text-zinc-200")}>{label}</span>
                        <span className="text-[11px] leading-snug text-zinc-500">{hint}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Eye affordance — surfaces the selected behavior in plain English */}
                <p className="mt-2 inline-flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-500">
                  <Eye className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" strokeWidth={1.75} aria-hidden />
                  <span>
                    {visibility === "public"
                      ? "Anyone browsing RAGE can discover this event."
                      : visibility === "unlisted"
                        ? "Off the marketing home strip; anyone with the guest link can still buy tickets."
                        : "Hidden from everyone except you while signed in."}
                  </span>
                </p>
              </div>

              <div>
                <label htmlFor="ce-dress" className={labelClass}>Dress code <span className="font-normal text-zinc-500">(optional)</span></label>
                <input id="ce-dress" className={field} placeholder="Creative black tie, streetwear, etc." value={dressCode} onChange={(e) => setDressCode(e.target.value)} />
              </div>
              <div>
                <label htmlFor="ce-instr" className={labelClass}>Door / entry notes <span className="font-normal text-zinc-500">(optional)</span></label>
                <input id="ce-instr" className={field} placeholder="ID check, re-entry, accessibility…" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
              </div>
            </SectionCard>

            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06] bg-[#030303]/90 px-4 py-3.5 shadow-[0_-24px_50px_-36px_rgba(0,0,0,0.9)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#030303]/72 sm:static sm:mt-10 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-none">
              <div className="mx-auto flex max-w-md items-center gap-2 sm:max-w-lg">
                <button
                  type="submit"
                  disabled={Boolean(onPublish && publishBusy)}
                  className="group flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-green to-emerald-300 text-[12px] font-bold uppercase tracking-[0.12em] text-black shadow-[0_0_36px_-8px_rgba(75,250,148,0.65)] transition duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishBusy && onPublish ? (
                    <>
                      Publishing…
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
                    </>
                  ) : (
                    <>
                      {resolvedMode === "hostPublish" ? (onPublish ? "Publish event" : "Continue in dashboard") : "Continue"}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2} />
                    </>
                  )}
                </button>
              </div>
              {error ? <p className="mx-auto mt-2 max-w-sm text-center text-xs font-medium text-red-300">{error}</p> : null}
              <p className="mx-auto mt-2 max-w-sm text-center text-[10px] leading-relaxed text-zinc-700">
                {resolvedMode === "hostPublish"
                  ? onPublish
                    ? "Review everything above, then publish when you are ready."
                    : "We will open the host publisher next so you can finish there."
                  : "Continue to create your account. Your draft stays saved in this browser."}
              </p>
            </div>
          </form>

          {flyerPickerOpen ? (
            <div className="fixed inset-0 z-40 bg-black/70 p-4 backdrop-blur-sm sm:p-6">
              <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/[0.12] bg-[#070707]">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Upload event flyer</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">Tap upload or choose from looks</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFlyerPickerOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition hover:border-white/35 hover:text-white"
                    aria-label="Close flyer picker"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                  <button
                    type="button"
                    disabled={uploadBusy}
                    onClick={() => fileRef.current?.click()}
                    className="group flex w-full items-center gap-3.5 rounded-xl border border-dashed border-white/22 bg-white/[0.05] px-4 py-4 text-left transition hover:border-brand-green/45 hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-zinc-400 transition group-hover:border-brand-green/30 group-hover:text-brand-green">
                      {uploadBusy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : <Upload className="h-4 w-4" strokeWidth={1.75} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-white">{uploadBusy ? "Optimizing for draft..." : "Tap here to upload flyer"}</p>
                      <p className="mt-0.5 text-[12px] text-zinc-500">4:5 works best (1080 x 1350). Other sizes auto-crop.</p>
                    </div>
                  </button>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" strokeWidth={1.75} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search for images..."
                      className={`${field} pl-9`}
                    />
                  </div>

                  <div className="-mx-1 flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] sm:mx-0 [&::-webkit-scrollbar]:hidden">
                    {FLYER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFlyCategory(cat.id);
                          flash(cat.id === "all" ? "Full gallery" : `${cat.label} vibes`);
                        }}
                        className={cn(
                          "snap-start shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition",
                          flyCategory === cat.id
                            ? "border-brand-green/55 bg-brand-green/22 text-brand-green shadow-[0_0_20px_-8px_rgba(75,250,148,0.5)]"
                            : "border-white/14 bg-white/[0.05] text-zinc-400 hover:border-white/25 hover:text-zinc-200",
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-2">
                    {filteredStock.map((img) => {
                      const active = coverMode === "stock" && selectedStockId === img.id;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => {
                            pickStock(img.id);
                            flash("Great eye");
                            setFlyerPickerOpen(false);
                          }}
                          className={cn(
                            "relative aspect-[4/5] w-full min-h-0 overflow-hidden rounded-xl bg-zinc-800/90 transition duration-300",
                            active
                              ? "z-[1] scale-[1.02] ring-2 ring-brand-green ring-offset-2 ring-offset-[#030303] shadow-[0_0_24px_-4px_rgba(75,250,148,0.45)]"
                              : "opacity-95 hover:opacity-100 hover:ring-1 hover:ring-white/25",
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- external Unsplash; reliable on Vercel */}
                          <img
                            src={img.thumb}
                            alt={img.alt}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          {active && (
                            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-black shadow-lg">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {confirmDraft ? (
            <div className="fixed inset-0 z-50 bg-black/75 p-4 backdrop-blur-sm sm:p-6">
              <div className="mx-auto mt-10 w-full max-w-md rounded-3xl border border-white/[0.14] bg-[#070707] p-5 shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Confirm details</p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-100">{confirmDraft.title}</h3>
                <div className="mt-4 space-y-2 rounded-2xl border border-white/[0.1] bg-white/[0.03] p-3 text-sm text-zinc-300">
                  <p>
                    <span className="text-zinc-500">When:</span> {confirmDraft.date} {confirmDraft.startTime}–{confirmDraft.endTime}
                  </p>
                  <p>
                    <span className="text-zinc-500">Where:</span> {confirmDraft.location}
                  </p>
                  <p>
                    <span className="text-zinc-500">Price:</span> ${confirmDraft.ticketPrice.toFixed(2)}
                  </p>
                  <p>
                    <span className="text-zinc-500">Tickets:</span> {confirmDraft.ticketsAvailable >= UNLIMITED_TICKETS ? "Unlimited" : confirmDraft.ticketsAvailable}
                  </p>
                </div>
                <p className="mt-3 text-xs text-zinc-500">You can still edit after publishing from the event hub.</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={publishBusy}
                    onClick={() => setConfirmDraft(null)}
                    className="h-11 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-white/40 disabled:opacity-60"
                  >
                    Keep editing
                  </button>
                  <button
                    type="button"
                    disabled={publishBusy}
                    onClick={() => void publishConfirmedEvent()}
                    className="h-11 rounded-full bg-gradient-to-r from-brand-green to-emerald-300 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-105 disabled:opacity-60"
                  >
                    {publishBusy ? "Publishing…" : "Confirm publish"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
