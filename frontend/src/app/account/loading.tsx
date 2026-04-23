export default function AccountLoading() {
  return (
    <main className="container-page animate-pulse py-10 sm:py-14">
      <div className="h-3 w-24 rounded-full bg-white/10" />
      <div className="mt-3 h-12 w-56 max-w-full rounded-lg bg-white/10" />
      <div className="mt-6 h-4 max-w-2xl rounded bg-white/[0.06]" />
      <div className="mt-2 h-4 max-w-xl rounded bg-white/[0.05]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-2xl bg-white/[0.06]" />
        <div className="h-40 rounded-2xl bg-white/[0.06]" />
      </div>
    </main>
  );
}
