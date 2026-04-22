"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Invite = {
  id: string;
  invited_email: string;
  role: "manager" | "scanner";
  created_at: string;
  accepted_at: string | null;
  expires_at: string;
};

type Member = {
  id: string;
  user_id: string;
  role: "owner" | "manager" | "scanner";
  created_at: string;
};

type TeamPayload = { invites: Invite[]; members: Member[] };

export default function EventTeamManager({ eventId }: { eventId: string }) {
  const [data, setData] = useState<TeamPayload>({ invites: [], members: [] });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"manager" | "scanner">("scanner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function loadTeam() {
    const res = await fetch(`/api/host/team/invites?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" });
    if (!res.ok) return;
    const json = (await res.json()) as TeamPayload;
    setData({ invites: json.invites ?? [], members: json.members ?? [] });
  }

  useEffect(() => {
    void loadTeam();
  }, [eventId]);

  async function onInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const res = await fetch("/api/host/team/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventId, email, role }),
    });
    const json = (await res.json().catch(() => null)) as { inviteUrl?: string; error?: string } | null;
    setLoading(false);
    if (!res.ok) {
      setError(json?.error ?? "Could not create invite.");
      return;
    }
    setInfo("Invite created. Copy link and send it to your teammate.");
    setEmail("");
    await loadTeam();
    if (json?.inviteUrl) {
      void navigator.clipboard?.writeText(json.inviteUrl).catch(() => {});
    }
  }

  const pendingInvites = useMemo(() => data.invites.filter((i) => !i.accepted_at), [data.invites]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Invite teammate</p>
        <h2 className="mt-2 text-xl font-black tracking-tight text-white">Teams</h2>
        <p className="mt-1 text-sm text-zinc-400">Invite scanners or managers so multiple operators can run door and ops on the same event.</p>
        <form onSubmit={onInvite} className="mt-4 grid gap-2 sm:grid-cols-[1fr,140px,auto]">
          <input
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl border border-white/15 bg-black/40 px-3 text-sm text-white outline-none transition focus:border-brand-green/60"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "manager" | "scanner")}
            className="h-11 rounded-xl border border-white/15 bg-black/40 px-3 text-sm text-white outline-none transition focus:border-brand-green/60"
          >
            <option value="scanner">Scanner</option>
            <option value="manager">Manager</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-brand-green to-emerald-300 px-5 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send invite"}
          </button>
        </form>
        {error ? <p className="mt-2 text-sm font-medium text-red-400">{error}</p> : null}
        {info ? <p className="mt-2 text-sm font-medium text-brand-green">{info}</p> : null}
      </section>

      <section className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active members</h3>
        <div className="mt-3 space-y-2">
          {data.members.length === 0 ? <p className="text-sm text-zinc-500">No additional members yet.</p> : null}
          {data.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/35 px-3 py-2">
              <p className="truncate text-sm text-zinc-300">{m.user_id}</p>
              <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{m.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.1] bg-zinc-950/60 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pending invites</h3>
        <div className="mt-3 space-y-2">
          {pendingInvites.length === 0 ? <p className="text-sm text-zinc-500">No pending invites.</p> : null}
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/35 px-3 py-2">
              <p className="truncate text-sm text-zinc-300">{invite.invited_email}</p>
              <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{invite.role}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
