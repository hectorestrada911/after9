"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type TicketRow = {
  id: string;
  ticket_code: string;
  status: string;
  orders: { buyer_name: string; buyer_email: string }[] | null;
};

/* eslint-disable no-unused-vars -- names document the browser BarcodeDetector call shape */
/** Minimal typing for the experimental BarcodeDetector API (no stable TS lib types). */
type NativeBarcodeDetectorInstance = {
  detect(image: HTMLVideoElement): Promise<{ rawValue?: string }[]>;
};
type NativeBarcodeDetectorCtor = new (options: { formats: string[] }) => NativeBarcodeDetectorInstance;
/* eslint-enable no-unused-vars */

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string>("");
  const [eventTitle, setEventTitle] = useState<string>("");
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<TicketRow[]>([]);
  const [scanConfirmed, setScanConfirmed] = useState(false);
  const [scanning, setScanning] = useState(false);
  /** True once the preview stream is attached and playing (or ZXing has taken over the device). */
  const [cameraPreviewReady, setCameraPreviewReady] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerSectionRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const scanLockRef = useRef(false);
  const supabase = getSupabaseBrowserClient();

  const stopScanner = useCallback(() => {
    const controls = zxingControlsRef.current;
    zxingControlsRef.current = null;
    if (controls) {
      try {
        const maybePromise = controls.stop() as unknown;
        if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
          void (maybePromise as Promise<void>).catch(() => undefined);
        }
      } catch {
        // ignore
      }
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraPreviewReady(false);
    setScanning(false);
    scanLockRef.current = false;
  }, []);

  function extractTicketCode(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        const url = new URL(trimmed);
        const fromQuery = url.searchParams.get("ticket") || url.searchParams.get("ticketCode") || url.searchParams.get("code");
        if (fromQuery) return fromQuery;
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] ?? trimmed;
      } catch {
        return trimmed;
      }
    }
    if (trimmed.includes("ticket:")) return trimmed.split("ticket:")[1]?.trim() ?? trimmed;
    return trimmed;
  }

  useEffect(() => {
    params.then((result) => setEventId(result.id));
  }, [params]);

  useEffect(() => {
    async function loadEventTitle() {
      if (!eventId) return;
      const { data } = await supabase.from("events").select("title").eq("id", eventId).maybeSingle();
      setEventTitle(data?.title ?? "");
    }
    loadEventTitle();
  }, [eventId, supabase]);

  useEffect(() => {
    async function loadMatches() {
      if (!eventId) return;
      const query = supabase
        .from("tickets")
        .select("id,ticket_code,status,orders(buyer_name,buyer_email)")
        .eq("event_id", eventId)
        .limit(20);

      const { data } = search.trim()
        ? await query.or(`ticket_code.ilike.%${search}%,orders.buyer_name.ilike.%${search}%,orders.buyer_email.ilike.%${search}%`)
        : await query;
      setMatches(
        (data ?? []).map((row) => ({
          id: row.id,
          ticket_code: row.ticket_code,
          status: row.status,
          orders: row.orders ?? [],
        })) as TicketRow[],
      );
    }
    loadMatches();
  }, [eventId, search, supabase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    queueMicrotask(() => setCameraSupported(Boolean(navigator.mediaDevices?.getUserMedia)));
  }, []);

  /** Warm the ZXing chunk on this screen so the first camera tap is faster on iOS-style paths. */
  useEffect(() => {
    if (typeof window === "undefined" || !cameraSupported) return;
    const hasNativeBarcode =
      "BarcodeDetector" in window && typeof (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector === "function";
    if (hasNativeBarcode) return;

    const run = () => void import("@zxing/browser");
    const t = window.setTimeout(run, 400);
    return () => window.clearTimeout(t);
  }, [cameraSupported]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    const shouldFocus = searchParams.get("focusScanner") === "1" || (typeof window !== "undefined" && window.location.hash === "#scanner");
    if (!shouldFocus) return;
    const t = window.setTimeout(() => {
      scannerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [searchParams]);

  async function checkInTicket(ticketCode: string, source: "manual" | "scan") {
    setMessage(null);
    setError(null);
    const normalizedCode = ticketCode.trim();
    if (!normalizedCode) {
      setError("Missing ticket code.");
      return;
    }

    const { data: ticket } = await supabase.from("tickets").select("id,status,event_id").eq("ticket_code", normalizedCode).single();
    if (!ticket || ticket.event_id !== eventId) return setError("Ticket not found for this event.");

    const { data: existing } = await supabase.from("check_ins").select("id").eq("ticket_id", ticket.id).maybeSingle();
    if (existing) return setError("Ticket already checked in.");

    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("check_ins").insert({ ticket_id: ticket.id, event_id: eventId, checked_in_by: userData.user?.id || null });
    await supabase.from("tickets").update({ status: "checked_in" }).eq("id", ticket.id);
    setMatches((prev) => prev.map((item) => (item.id === ticket.id ? { ...item, status: "checked_in" } : item)));
    setMessage(source === "scan" ? "Guest checked in via scan." : "Guest checked in successfully.");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const ticketCode = String(form.get("ticketCode"));
    await checkInTicket(ticketCode, "manual");
  }

  async function startScanner() {
    if (!scanConfirmed) {
      setCameraError("Confirm this is the correct event before starting camera scan.");
      return;
    }
    if (!cameraSupported) {
      setCameraError("Camera is not available in this browser. Use HTTPS, or try Safari or Chrome on your phone.");
      return;
    }
    if (scanning) return;
    setCameraError(null);
    setMessage(null);
    setError(null);

    const nativeBarcodeDetector =
      typeof window !== "undefined" &&
      "BarcodeDetector" in window &&
      typeof (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector === "function";

    try {
      setScanning(true);
      setCameraPreviewReady(false);
      const zxingModulePromise = !nativeBarcodeDetector ? import("@zxing/browser") : null;

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const video = videoRef.current;
      if (!video) {
        setCameraError("Camera preview not ready. Try again.");
        stopScanner();
        return;
      }

      if (nativeBarcodeDetector) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        setCameraPreviewReady(true);

        const Detector = (window as unknown as { BarcodeDetector: NativeBarcodeDetectorCtor }).BarcodeDetector;
        const detector = new Detector({ formats: ["qr_code"] });

        const tick = async () => {
          if (!videoRef.current || scanLockRef.current) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          try {
            const barcodes = await detector.detect(videoRef.current);
            const raw = barcodes[0]?.rawValue;
            if (raw) {
              scanLockRef.current = true;
              const code = extractTicketCode(raw);
              stopScanner();
              await checkInTicket(code, "scan");
              return;
            }
          } catch {
            // Ignore occasional detect errors from camera frames.
          }
          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // iOS Safari and many browsers: no BarcodeDetector — ZXing reads frames in JS.
      video.srcObject = null;

      if (!zxingModulePromise) {
        setCameraError("QR scanner could not start. Try again or use manual check-in.");
        stopScanner();
        return;
      }
      const { BrowserQRCodeReader } = await zxingModulePromise;
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
        if (scanLockRef.current) return;
        const text = result?.getText()?.trim();
        if (!text) return;
        scanLockRef.current = true;
        const code = extractTicketCode(text);
        queueMicrotask(() => {
          stopScanner();
          void checkInTicket(code, "scan");
        });
      });
      zxingControlsRef.current = controls;
      setCameraPreviewReady(true);
    } catch {
      setCameraError("Could not access camera. Allow camera permission and retry.");
      stopScanner();
    }
  }

  return (
    <div id="scanner" ref={scannerSectionRef} className="mx-auto max-w-lg min-w-0 scroll-mt-24">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Scan QR</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Door scanner</h1>
      <p className="mt-2 text-sm text-zinc-500">Point camera at guest QR. You can also search by attendee name, email, or ticket code.</p>
      <div className="mt-3 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-xs text-zinc-300">
        Event selected: <span className="font-semibold text-white">{eventTitle || "Loading event..."}</span>
      </div>

      <Input
        className="mt-8 min-h-12 w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-green/40 focus:ring-2 focus:ring-brand-green/15"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search attendee or code"
      />

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <Input
          name="ticketCode"
          placeholder="Enter ticket code"
          required
          className="min-h-12 w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-green/40 focus:ring-2 focus:ring-brand-green/15"
        />
        {error && <p className="text-sm font-medium text-red-400">{error}</p>}
        {message && <p className="text-sm font-medium text-brand-green">{message}</p>}
        <Button className="w-full bg-white text-black hover:bg-zinc-200">Check in manually</Button>
      </form>

      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={scanConfirmed}
            onChange={(e) => setScanConfirmed(e.target.checked)}
            className="h-4 w-4 accent-brand-green"
          />
          I confirm this is the correct event to scan at the door.
        </label>
        <div className="flex gap-2">
          <Button className="w-full bg-gradient-to-r from-brand-green to-emerald-300 text-black shadow-[0_0_24px_-12px_rgba(75,250,148,0.75)] hover:brightness-110" type="button" onClick={startScanner} disabled={scanning || !cameraSupported || !scanConfirmed}>
            {scanning ? (cameraPreviewReady ? "Scanning…" : "Starting camera…") : "Scan QR with camera"}
          </Button>
          {scanning ? (
            <Button className="w-full border border-white/25 bg-transparent text-white hover:bg-white/10" type="button" onClick={stopScanner}>
              Stop scanner
            </Button>
          ) : null}
        </div>
        {!cameraSupported ? (
          <p className="text-xs text-zinc-500">Camera scanning needs a secure context (HTTPS) and a browser that supports camera access.</p>
        ) : null}
        <p className="text-xs text-zinc-500">Tip: grant camera access when prompted. Works on iPhone Safari and common mobile browsers.</p>
        {cameraError ? <p className="text-xs font-medium text-red-400">{cameraError}</p> : null}
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/[0.12] bg-zinc-950 ${scanning ? "" : "hidden"}`}
          aria-hidden={!scanning}
        >
          <video
            ref={videoRef}
            className={`aspect-video w-full object-cover bg-black transition-opacity duration-300 ${cameraPreviewReady ? "opacity-100" : "opacity-0"}`}
            playsInline
            muted
            autoPlay
          />
          {scanning && !cameraPreviewReady ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-4 text-center">
              <span
                className="h-9 w-9 shrink-0 rounded-full border-2 border-white/20 border-t-white animate-spin"
                aria-hidden
              />
              <p className="text-xs font-medium text-zinc-300">Starting camera…</p>
              <p className="max-w-[16rem] text-[11px] leading-snug text-zinc-500">Preview appears here as soon as the stream is ready. You can stop anytime.</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {matches.map((ticket) => (
          <div key={ticket.id} className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-white">{ticket.orders?.[0]?.buyer_name ?? "Guest"}</p>
                <p className="mt-0.5 break-all font-mono text-xs text-zinc-500">{ticket.ticket_code}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{ticket.orders?.[0]?.buyer_email ?? "No email"}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  ticket.status === "checked_in" ? "bg-brand-green/40 text-black" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {ticket.status === "checked_in" ? "In" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
