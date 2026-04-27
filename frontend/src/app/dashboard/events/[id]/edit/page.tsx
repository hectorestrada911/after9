import { EventEditClient } from "./event-edit-client";
import { resolveEventWorkspace } from "../_workspace";

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await resolveEventWorkspace(id);
  if (bundle.kind !== "ok") return null;
  return <EventEditClient event={bundle.event} />;
}
