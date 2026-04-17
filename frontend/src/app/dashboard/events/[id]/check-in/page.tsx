"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type TicketRow = {
  id: string;
  ticket_code: string;
  status: string;
  orders: { buyer_name: string; buyer_email: string }[] | null;
};

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<TicketRow[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    params.then((result) => setEventId(result.id));
  }, [params]);

  useEffect(() => {
    async function loadMatches() {
      if (!eventId) return;
      const query = supabase
        .from("tickets")
        .select("id,ticket_code,status,orders(buyer_name,buyer_email)")
        .eq("event_id", eventId)
        .limit(20);

      const { data } = search.trim()
        ? await query.or(`ticket_code.ilike.%${search}%,orders.buyer_name.ilike.%${search}%,orders.buyer_email.ilike.%${search}%`)
        : await query;
      setMatches(
        (data ?? []).map((row) => ({
          id: row.id,
          ticket_code: row.ticket_code,
          status: row.status,
          orders: row.orders ?? [],
        })) as TicketRow[],
      );
    }
    loadMatches();
  }, [eventId, search, supabase]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const form = new FormData(e.currentTarget);
    const ticketCode = String(form.get("ticketCode"));

    const { data: ticket } = await supabase.from("tickets").select("id,status,event_id").eq("ticket_code", ticketCode).single();
    if (!ticket || ticket.event_id !== eventId) return setError("Ticket not found for this event.");

    const { data: existing } = await supabase.from("check_ins").select("id").eq("ticket_id", ticket.id).maybeSingle();
    if (existing) return setError("Ticket already checked in.");

    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("check_ins").insert({ ticket_id: ticket.id, event_id: eventId, checked_in_by: userData.user?.id || null });
    await supabase.from("tickets").update({ status: "checked_in" }).eq("id", ticket.id);
    setMatches((prev) => prev.map((item) => (item.id === ticket.id ? { ...item, status: "checked_in" } : item)));
    setMessage("Guest checked in successfully.");
  }

  return (
    <main className="container-page min-w-0 py-10 sm:py-14">
      <div className="mx-auto max-w-md min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Door tools</p>
        <h1 className="mt-3 display-section-fluid">Check-in</h1>
        <p className="mt-4 text-base text-muted">
          Search by attendee name, email, or ticket code.
        </p>

        <Input
          className="mt-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search attendee or code"
        />

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <Input name="ticketCode" placeholder="Enter ticket code" required />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {message && <p className="text-sm font-medium text-green-700">{message}</p>}
          <Button className="w-full">Check in guest</Button>
        </form>

        <div className="mt-8 space-y-3">
          {matches.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-line p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{ticket.orders?.[0]?.buyer_name ?? "Guest"}</p>
                  <p className="mt-0.5 text-xs font-mono break-all text-muted">{ticket.ticket_code}</p>
                  <p className="mt-0.5 text-xs text-muted">{ticket.orders?.[0]?.buyer_email ?? "No email"}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${ticket.status === "checked_in" ? "bg-brand-green/40 text-black" : "bg-offwhite text-muted"}`}>
                  {ticket.status === "checked_in" ? "In" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
