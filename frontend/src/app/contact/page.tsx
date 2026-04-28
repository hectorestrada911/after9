import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact · RAGE",
  description: "Reach the RAGE team. We reply within 24 hours on business days.",
};

export default function ContactPage() {
  return (
    <main className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-lg">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Support</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Contact us</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Questions about hosting, tickets, or your account? Send a note and we will confirm by email. We aim to respond within{" "}
          <span className="font-semibold text-zinc-200">24 hours</span> on business days.
        </p>
        <div className="mt-8 rounded-3xl border border-white/[0.1] bg-zinc-950/80 p-5 sm:p-8">
          <ContactForm />
        </div>
        <p className="mt-6 text-center text-xs text-zinc-500">
          Prefer email directly?{" "}
          <a href="mailto:ragesupportpage@gmail.com" className="font-medium text-zinc-300 underline-offset-2 hover:text-white hover:underline">
            ragesupportpage@gmail.com
          </a>
        </p>
        <p className="mt-4 text-center text-xs text-zinc-600">
          <Link href="/" className="transition hover:text-zinc-400">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
