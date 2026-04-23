export default function MyTicketsLoading() {
  return (
    <main className="container-page animate-pulse py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded-full bg-white/10" />
          <div className="h-10 w-48 max-w-full rounded-lg bg-white/10" />
        </div>
        <div className="h-10 w-32 rounded-full bg-white/10" />
      </div>
      <div className="space-y-5">
        <div className="h-64 rounded-2xl bg-white/[0.06]" />
        <div className="h-64 rounded-2xl bg-white/[0.06]" />
      </div>
    </main>
  );
}
