"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function EventHostNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/events/${eventId}`;
  const isOrders = pathname.includes(`${base}/orders`);
  const isCheckIn = pathname.includes(`${base}/check-in`);
  const isEdit = pathname.includes(`${base}/edit`);
  const isOverview = pathname.startsWith(base) && !isOrders && !isCheckIn && !isEdit;

  const items = [
    { href: base, label: "Overview", active: isOverview },
    { href: `${base}/orders`, label: "Orders", active: isOrders },
    { href: `${base}/check-in`, label: "Check-in", active: isCheckIn },
    { href: `${base}/edit`, label: "Details", active: isEdit },
  ];

  return (
    <div className="border-b border-white/[0.08] bg-[#030303]/80 backdrop-blur-md">
      <div className="container-page flex gap-1 overflow-x-auto py-2 sm:gap-2">
        {items.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition",
              tab.active ? "bg-white text-black" : "text-zinc-500 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
