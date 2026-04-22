"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, CreditCard, QrCode, Sparkles, Ticket } from "lucide-react";

const steps = [
  "Choose ticket",
  "Fill payment",
  "Ticket issued",
  "Scan at entrance",
] as const;

const FLYER =
  "https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1600";
const EVENT_NAME = "Sunset Pier Nights";
const EVENT_META = "May 16 · doors 9pm · Santa Monica";

const CARD_NUMBER = "4242 1234 5678 9010";
const CARD_NAME = "SIENNA DEL REY";
const BUYER_EMAIL = "sienna@coastmail.com";
const CARD_EXP = "12/28";
const CARD_CVC = "123";
const ORDER_CODE = "ord_9x8ca21";
const TICKET_CODE = "rage_8f2c_k19m";

const QR_SIZE = 29;
const qrModules = new Set<string>();

function hasFinder(x: number, y: number, ox: number, oy: number) {
  if (x < ox || x > ox + 6 || y < oy || y > oy + 6) return false;
  const dx = x - ox;
  const dy = y - oy;
  if (dx === 0 || dx === 6 || dy === 0 || dy === 6) return true;
  if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) return true;
  return false;
}

function isReserved(x: number, y: number) {
  const inTopLeft = x <= 8 && y <= 8;
  const inTopRight = x >= QR_SIZE - 9 && y <= 8;
  const inBottomLeft = x <= 8 && y >= QR_SIZE - 9;
  const timing = x === 6 || y === 6;
  return inTopLeft || inTopRight || inBottomLeft || timing;
}

for (let y = 0; y < QR_SIZE; y += 1) {
  for (let x = 0; x < QR_SIZE; x += 1) {
    const finder =
      hasFinder(x, y, 0, 0) || hasFinder(x, y, QR_SIZE - 7, 0) || hasFinder(x, y, 0, QR_SIZE - 7);
    if (finder) {
      qrModules.add(`${x}-${y}`);
      continue;
    }
    if (isReserved(x, y)) continue;
    const seeded = (x * 13 + y * 17 + (x * y) % 7 + 11) % 19;
    if (seeded % 2 === 0 || (x + y) % 5 === 0) {
      qrModules.add(`${x}-${y}`);
    }
  }
}

export function DemoCheckoutFlow() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState(0);
  const [buyPressed, setBuyPressed] = useState(false);
  const [rippleOn, setRippleOn] = useState(false);

  useEffect(() => {
    setBuyPressed(false);
    setRippleOn(false);
    if (step === 0) {
      const press = window.setTimeout(() => {
        setBuyPressed(true);
        setRippleOn(true);
      }, 950);
      const rippleOff = window.setTimeout(() => setRippleOn(false), 1240);
      const next = window.setTimeout(() => setStep(1), 1450);
      return () => {
        window.clearTimeout(press);
        window.clearTimeout(rippleOff);
        window.clearTimeout(next);
      };
    }
    const next = window.setTimeout(() => setStep((s) => (s + 1) % steps.length), 1900);
    return () => window.clearTimeout(next);
  }, [step]);

  useEffect(() => {
    setPhase(0);
    const timer = window.setInterval(() => {
      setPhase((p) => Math.min(p + 1, 12));
    }, 120);
    return () => window.clearInterval(timer);
  }, [step]);

  const typed = (value: string) => value.slice(0, Math.floor((phase / 12) * value.length));

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-white/12 bg-[#0a0a0a] shadow-[0_28px_90px_-36px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/50 px-3 py-2.5">
        {steps.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] transition ${
              i === step ? "bg-brand-green/20 text-brand-green" : "bg-white/[0.04] text-zinc-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        {step === 0 ? (
          <div className="animate-[demoIn_320ms_ease-out] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="relative aspect-[16/9] w-full">
              <Image src={FLYER} alt="Sunset Pier Nights flyer" fill className="object-cover" sizes="(max-width:768px) 100vw, 48rem" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Featured flyer</p>
                <p className="mt-1 text-lg font-black text-white">{EVENT_NAME}</p>
              </div>
              <div className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/90">
                Saturday 9PM
              </div>
              <div className="absolute right-3 top-3 rounded-full border border-brand-green/50 bg-brand-green/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-green">
                Santa Monica
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">General admission</p>
                <Ticket className="h-4 w-4 text-brand-green" aria-hidden />
              </div>
              <p className="mt-1 text-xs text-zinc-500">{EVENT_META}</p>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/35 px-3 py-2">
                <p className="text-xs text-zinc-400">1 ticket selected</p>
                <p className="text-lg font-black text-white">$25</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBuyPressed(true);
                  setRippleOn(true);
                  window.setTimeout(() => setRippleOn(false), 250);
                  window.setTimeout(() => setStep(1), 320);
                }}
                className={`relative mt-3 inline-flex h-10 w-full items-center justify-center overflow-hidden rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
                  buyPressed ? "scale-[0.98] bg-zinc-200 text-black" : "bg-white text-black"
                }`}
              >
                <span
                  className={`pointer-events-none absolute inset-0 rounded-full bg-black/10 ${rippleOn ? "animate-[buyRipple_250ms_ease-out]" : "opacity-0"}`}
                  aria-hidden
                />
                {buyPressed ? "Buying..." : "Buy ticket"}
              </button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="animate-[demoIn_320ms_ease-out] rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Checkout details</p>
              <CreditCard className="h-4 w-4 text-cyan-300" aria-hidden />
            </div>
            <div className="mt-3 space-y-2.5">
              <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Full name</p>
                <p className="mt-1.5 font-mono text-sm text-white">{typed(CARD_NAME)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Email</p>
                <p className="mt-1.5 font-mono text-sm text-white">{typed(BUYER_EMAIL)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Card number</p>
                <p className="mt-1.5 font-mono text-sm text-white">
                  {typed(CARD_NUMBER)}
                  <span className="animate-pulse text-white/70">|</span>
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Name</p>
                <p className="mt-1.5 font-mono text-sm text-white">
                  {typed(CARD_NAME)}
                  <span className="animate-pulse text-white/70">|</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">MM/YY</p>
                  <p className="mt-1.5 font-mono text-sm text-white">{typed(CARD_EXP)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">CVC</p>
                  <p className="mt-1.5 font-mono text-sm text-white">{typed(CARD_CVC)}</p>
                </div>
              </div>
              <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">Secure checkout</p>
                <p className="mt-1 text-xs text-zinc-200">Card details tokenize and redirect to payment confirmation.</p>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="animate-[demoIn_320ms_ease-out] rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Payment successful</p>
              <QrCode className="h-4 w-4 text-brand-green" aria-hidden />
            </div>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">Order: {ORDER_CODE}</p>
            <div className="mt-3 rounded-xl border border-white/12 bg-gradient-to-br from-black/50 to-zinc-900/50 p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-white">Admit 1 · {EVENT_NAME}</p>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500">Ticket: {TICKET_CODE}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">Show this code at the entrance</p>
                </div>
                <svg
                  viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
                  className="h-20 w-20 shrink-0 rounded-md border border-white/10 bg-white p-1"
                  role="img"
                  aria-label="QR code"
                >
                  {Array.from({ length: QR_SIZE * QR_SIZE }).map((_, i) => {
                    const x = i % QR_SIZE;
                    const y = Math.floor(i / QR_SIZE);
                    if (!qrModules.has(`${x}-${y}`)) return null;
                    return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" />;
                  })}
                </svg>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-black/35 p-2.5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">Buyer</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-white">Sienna</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">Gate</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-white">Main</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">Status</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-brand-green">Valid</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="animate-[demoIn_320ms_ease-out] relative overflow-hidden rounded-2xl border border-brand-green/30 bg-gradient-to-br from-brand-green/[0.16] via-emerald-400/[0.08] to-cyan-300/[0.12] p-4">
            <div className="absolute inset-x-0 top-0 h-1.5 animate-[scanLine_1.1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            <div className="pointer-events-none absolute -right-4 -top-6 h-20 w-20 rounded-full bg-brand-green/30 blur-2xl" />
            <div className="pointer-events-none absolute -left-6 bottom-0 h-16 w-16 rounded-full bg-cyan-300/30 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 animate-[successPulse_1.6s_ease-out_infinite] rounded-2xl border border-brand-green/40" />
            <div className="flex items-center gap-2 text-brand-green">
              <CheckCircle2 className="h-5 w-5 animate-pulse" aria-hidden />
              <p className="text-sm font-black uppercase tracking-[0.14em]">Door check-in</p>
            </div>
            <p className="mt-2 text-sm text-zinc-100">Scan successful. Guest checked in successfully.</p>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-white/80">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              <span>Door check complete in 0.8s</span>
            </div>
            <div className="mt-3 rounded-xl border border-white/20 bg-black/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">Sienna Del Rey</p>
                  <p className="mt-0.5 font-mono text-[11px] text-zinc-300">{TICKET_CODE}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-300">sienna@coastmail.com</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-green/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                  In
                </span>
              </div>
              <div className="relative mt-3 overflow-hidden rounded-md border border-white/20 bg-black/35 p-2">
                <div className="absolute inset-x-2 top-0 h-0.5 animate-[qrSweep_1.1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-brand-green to-transparent" />
                <svg
                  viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
                  className="mx-auto h-24 w-24 rounded-sm bg-white p-1.5"
                  role="img"
                  aria-label="QR code scan preview"
                >
                  {Array.from({ length: QR_SIZE * QR_SIZE }).map((_, i) => {
                    const x = i % QR_SIZE;
                    const y = Math.floor(i / QR_SIZE);
                    if (!qrModules.has(`${x}-${y}`)) return null;
                    return <rect key={`scan-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#000" />;
                  })}
                </svg>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0% {
            transform: translateY(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(78px);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0.2;
          }
        }
        @keyframes demoIn {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes buyRipple {
          0% {
            opacity: 0.35;
            transform: scale(0.42);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
        @keyframes successPulse {
          0% {
            opacity: 0;
            transform: scale(0.985);
          }
          35% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
            transform: scale(1.018);
          }
        }
        @keyframes qrSweep {
          0% {
            transform: translateY(0);
            opacity: 0.35;
          }
          50% {
            transform: translateY(92px);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
        }
      `}</style>
    </div>
  );
}
