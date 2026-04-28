import crypto from "crypto";
import QRCode from "qrcode";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getResendMailEnv } from "@/lib/resend-config";
import { TICKET_QR_TO_PNG_OPTIONS } from "@/lib/qr-ticket";
import { sendTicketPurchaseConfirmation } from "@/lib/transactional-email";

type ServiceClient = SupabaseClient;

/**
 * Mark a $0 order paid and create missing ticket rows + optional confirmation email.
 * Safe to call multiple times (idempotent on ticket count).
 */
export async function fulfillFreeOrderIfNeeded(supabase: ServiceClient, orderId: string) {
  const { data: order } = await supabase
    .from("orders")
    .select("id, quantity, buyer_email, buyer_name, confirmation_email_sent_at, payment_status, total_amount, event_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false as const, reason: "missing_order" as const };
  if ((order.total_amount ?? 0) !== 0) return { ok: false as const, reason: "not_free" as const };
  if (order.payment_status === "paid") {
    return { ok: true as const, alreadyPaid: true as const };
  }

  await supabase.from("orders").update({ payment_status: "paid" }).eq("id", orderId);

  const expected = Math.max(order.quantity ?? 0, 0);
  const { count: existingCount } = await supabase.from("tickets").select("id", { count: "exact", head: true }).eq("order_id", orderId);
  const missing = Math.max(expected - (existingCount ?? 0), 0);
  if (missing > 0) {
    const tickets = await Promise.all(
      Array.from({ length: missing }).map(async () => {
        const ticketCode = `TK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        const qrCodeUrl = await QRCode.toDataURL(ticketCode, TICKET_QR_TO_PNG_OPTIONS);
        return {
          order_id: orderId,
          event_id: order.event_id,
          ticket_code: ticketCode,
          qr_code_url: qrCodeUrl,
          status: "active" as const,
        };
      }),
    );
    await supabase.from("tickets").insert(tickets);
  }

  if (!order.confirmation_email_sent_at && getResendMailEnv() && order.buyer_email) {
    try {
      const [{ data: ticketsForOrder }, { data: eventRow }] = await Promise.all([
        supabase.from("tickets").select("ticket_code, qr_code_url").eq("order_id", orderId).order("created_at", { ascending: true }),
        supabase.from("events").select("title, slug, date, start_time, location").eq("id", order.event_id).single(),
      ]);
      if (eventRow && ticketsForOrder && ticketsForOrder.length > 0) {
        const emailResult = await sendTicketPurchaseConfirmation({
          to: order.buyer_email,
          buyerName: order.buyer_name,
          eventTitle: eventRow.title,
          eventSlug: eventRow.slug,
          eventDate: String(eventRow.date),
          eventStartTime: String(eventRow.start_time),
          eventLocation: eventRow.location,
          tickets: ticketsForOrder.map((t) => ({ ticketCode: t.ticket_code, qrDataUrl: t.qr_code_url })),
        });
        if (emailResult.ok) {
          await supabase.from("orders").update({ confirmation_email_sent_at: new Date().toISOString() }).eq("id", orderId);
        }
      }
    } catch {
      // Non-fatal: tickets still exist; user can open My tickets.
    }
  }

  return { ok: true as const, alreadyPaid: false as const };
}
