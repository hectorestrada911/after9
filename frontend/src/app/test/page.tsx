import { TestLabPanel } from "@/components/test-lab-panel";
import { TestDesignLab } from "@/components/test-design-lab";

export default function TestPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04] sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Test flow</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Product test lab</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Validate the full host and guest experience in one place: demo flow, dashboard access, camera scanning, and QR test codes.
        </p>

        <div className="mt-6">
          <TestLabPanel />
        </div>

        <div className="mt-6">
          <TestDesignLab />
        </div>
      </section>
    </main>
  );
}
