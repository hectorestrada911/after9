"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button, Input } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type TicketRow = {
  id: string;
  ticket_code: string;
  status: string;
  orders: { buyer_name: string; buyer_email: string }[] | null;
};

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<TicketRow[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanSupported, setScanSupported] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scanLockRef = useRef(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    params.then((result) => setEventId(result.id));
  }, [params]);

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
    setScanSupported("BarcodeDetector" in window);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  function stopScanner() {
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
    setScanning(false);
    scanLockRef.current = false;
  }

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
    if (!scanSupported) {
      setCameraError("Camera scan is not supported in this browser.");
      return;
    }
    if (scanning) return;
    setCameraError(null);
    setMessage(null);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      const Detector = (window as Window & { BarcodeDetector?: new (opts?: { formats?: string[] }) => { detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
      if (!Detector) {
        setCameraError("QR scan unavailable in this browser.");
        stopScanner();
        return;
      }
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
    } catch {
      setCameraError("Could not access camera. Allow camera permission and retry.");
      stopScanner();
    }
  }

  return (
    <main className="container-page min-w-0 py-10 sm:py-14">
      <div className="mx-auto max-w-md min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Door tools</p>
        <h1 className="mt-3 display-section-fluid">Check-in</h1>
        <p className="mt-4 text-base text-muted">
          Search by attendee name, email, or ticket code.
        </p>

        <Input
          className="mt-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search attendee or code"
        />

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <Input name="ticketCode" placeholder="Enter ticket code" required />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {message && <p className="text-sm font-medium text-green-700">{message}</p>}
          <Button className="w-full">Check in guest</Button>
        </form>

        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Button className="w-full" type="button" onClick={startScanner} disabled={scanning || !scanSupported}>
              {scanning ? "Scanning..." : "Scan QR with camera"}
            </Button>
            {scanning ? (
              <Button className="w-full" type="button" onClick={stopScanner}>
                Stop scanner
              </Button>
            ) : null}
          </div>
          {!scanSupported ? <p className="text-xs text-muted">QR scanning requires a modern browser with BarcodeDetector support.</p> : null}
          {cameraError ? <p className="text-xs font-medium text-red-600">{cameraError}</p> : null}
          {scanning ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-black">
              <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted autoPlay />
            </div>
          ) : null}
        </div>

        <div className="mt-8 space-y-3">
          {matches.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-line p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{ticket.orders?.[0]?.buyer_name ?? "Guest"}</p>
                  <p className="mt-0.5 text-xs font-mono break-all text-muted">{ticket.ticket_code}</p>
                  <p className="mt-0.5 text-xs text-muted">{ticket.orders?.[0]?.buyer_email ?? "No email"}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${ticket.status === "checked_in" ? "bg-brand-green/40 text-black" : "bg-offwhite text-muted"}`}>
                  {ticket.status === "checked_in" ? "In" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
