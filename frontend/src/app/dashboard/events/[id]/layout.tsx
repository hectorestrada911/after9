import type { ReactNode } from "react";
import { EventHostNav } from "@/components/event-host-nav";
import { EventWorkspaceHero } from "@/components/event-workspace-hero";
import { resolveEventWorkspace } from "./_workspace";

export default async function EventWorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = await resolveEventWorkspace(id);
  const publicBase = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <div className="min-w-0">
      <EventWorkspaceHero
        event={{
          title: bundle.event.title,
          slug: bundle.event.slug,
          date: bundle.event.date,
          location: bundle.event.location,
          image_url: bundle.event.image_url,
          visibility: bundle.event.visibility,
          archived_at: bundle.event.archived_at,
          sales_enabled: bundle.event.sales_enabled,
        }}
        eventId={id}
        publicBaseUrl={publicBase}
      />
      <EventHostNav eventId={id} />
      <div className="container-page pb-20 pt-8">{children}</div>
    </div>
  );
}
