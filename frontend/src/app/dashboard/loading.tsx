export default function DashboardLoading() {
  return (
    <main className="container-page min-w-0 animate-pulse py-10 sm:py-14">
      <div className="h-3 w-28 rounded-full bg-white/10" />
      <div className="mt-4 h-12 w-64 max-w-full rounded-lg bg-white/10" />
      <div className="mt-8 h-24 rounded-2xl bg-white/[0.06]" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/[0.06]" />
        ))}
      </div>
      <div className="mt-10 h-48 rounded-2xl bg-white/[0.06]" />
      <div className="mt-10 space-y-3">
        <div className="h-4 w-32 rounded-full bg-white/10" />
        <div className="h-32 rounded-2xl bg-white/[0.06]" />
      </div>
    </main>
  );
}
