"use client";

import { FormEvent, useState } from "react";

const fieldClass =
  "min-h-12 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      company: String(fd.get("company") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again in a moment.");
        return;
      }
      setDone(true);
      form.reset();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-6 text-center sm:px-8">
        <p className="text-sm font-semibold text-emerald-200">Message sent</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          Thanks! We received your note. You should get a confirmation email shortly. We aim to reply within 24 hours on business days.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-5 text-xs font-semibold uppercase tracking-wider text-emerald-300 underline-offset-4 transition hover:text-white hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
          Name
        </label>
        <input id="contact-name" name="name" type="text" required maxLength={120} className={fieldClass} placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
          className={fieldClass}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={8000}
          rows={6}
          className={`${fieldClass} min-h-[9rem] resize-y`}
          placeholder="How can we help? (at least a few words)"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-white py-3.5 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
      >
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
