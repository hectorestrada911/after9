import Link from "next/link";
import Image from "next/image";

const COVER =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=960&q=78";

/**
 * Static “guest page” mock so hosts see structure (not a real screenshot dependency).
 */
export function HostProductSnapshot() {
  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-white/12 bg-[#0a0a0a] shadow-[0_28px_90px_-36px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-black/50 px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-red-500/70" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-amber-400/70" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-emerald-500/70" aria-hidden />
        <p className="ml-2 min-w-0 truncate font-mono text-[10px] text-zinc-500">rage.host / e / velvet-room</p>
      </div>

      <div className="relative aspect-[16/10] w-full bg-zinc-900">
        <Image src={COVER} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 28rem" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <h4 className="text-xl font-black tracking-tighter text-white sm:text-2xl">Velvet Room · Friday</h4>
          <p className="mt-1.5 text-sm text-zinc-500">May 16 · doors 9pm · Downtown</p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">From</p>
            <p className="text-2xl font-black tabular-nums text-white sm:text-3xl">$25</p>
          </div>
          <Link
            href="/events/campus-lights-fest"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-white px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-200"
          >
            Get tickets
          </Link>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-600">
          Illustrative layout. Your cover, copy, and tiers ship on the live page you share.
        </p>
      </div>
    </div>
  );
}
