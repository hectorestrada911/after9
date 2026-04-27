import EventTeamManager from "@/components/event-team-manager";
import { resolveEventWorkspace } from "../_workspace";

export default async function EventTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await resolveEventWorkspace(id);
  if (bundle.kind !== "ok") return null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Team access</p>
      <h2 className="text-2xl font-black tracking-tight text-white">Event operators</h2>
      <p className="text-sm text-zinc-500">Manage who can scan tickets and assist with host operations.</p>
      <EventTeamManager eventId={id} />
    </div>
  );
}
