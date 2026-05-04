import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEduClient } from "./verify-edu-client";

export const metadata: Metadata = {
  title: "Verify your .edu · RAGE",
  description: "Confirm your school email to unlock student-only events and campus access on RAGE.",
};

function VerifyEduFallback() {
  return (
    <main className="min-h-[100dvh] bg-black text-zinc-100">
      <div className="mx-auto max-w-md px-5 py-16 animate-pulse">
        <div className="h-4 w-20 rounded bg-zinc-800" />
        <div className="mx-auto mt-10 h-20 w-20 rounded-3xl bg-zinc-800" />
        <div className="mx-auto mt-8 h-8 w-3/4 max-w-xs rounded bg-zinc-800" />
        <div className="mx-auto mt-3 h-4 w-full max-w-sm rounded bg-zinc-800" />
      </div>
    </main>
  );
}

export default function VerifyEduPage() {
  return (
    <Suspense fallback={<VerifyEduFallback />}>
      <VerifyEduClient />
    </Suspense>
  );
}
