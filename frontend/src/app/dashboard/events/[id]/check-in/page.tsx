"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input } from "@/components/ui";
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
    <main className="container-page py-6 sm:py-8">
      <Card className="mx-auto max-w-md p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-100">Event check-in</h1>
        <p className="text-sm text-slate-300">Search by attendee name, email, or ticket code.</p>
        <Input
          className="mt-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search attendee or ticket code"
        />
        <form className="mt-4 space-y-2" onSubmit={onSubmit}>
          <Input name="ticketCode" placeholder="Enter ticket code" required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-300">{message}</p>}
          <Button className="w-full text-base">Check in guest</Button>
        </form>
        <div className="mt-4 space-y-2.5">
          {matches.map((ticket) => (
            <div key={ticket.id} className="rounded-xl border border-slate-700 p-3.5 text-sm">
              <p className="font-semibold text-slate-100">{ticket.orders?.[0]?.buyer_name ?? "Guest"} - <span className="break-all">{ticket.ticket_code}</span></p>
              <p className="text-slate-400">{ticket.orders?.[0]?.buyer_email ?? "No email"}</p>
              <p className={ticket.status === "checked_in" ? "text-emerald-300" : "text-amber-300"}>
                {ticket.status === "checked_in" ? "Checked in" : "Not checked in"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
