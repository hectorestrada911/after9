export default function AccountLoading() {
  return (
    <main className="relative min-h-[100dvh] bg-discover-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-pulse"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(75,250,148,0.08), transparent 55%), radial-gradient(circle at 80% 90%, rgba(59,130,246,0.04), transparent 45%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-lg animate-pulse px-5 pb-16 pt-8 sm:px-6 sm:pt-10 lg:max-w-5xl">
        <div className="h-2 w-20 rounded-full bg-white/10" />
        <div className="mt-3 h-10 w-48 max-w-full rounded-lg bg-white/10" />
        <div className="mt-4 h-4 max-w-md rounded bg-white/[0.06]" />
        <div className="mt-2 h-4 max-w-lg rounded bg-white/[0.05]" />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="h-56 rounded-2xl bg-white/[0.06]" />
          <div className="h-56 rounded-2xl bg-white/[0.06]" />
        </div>
      </div>
    </main>
  );
}
