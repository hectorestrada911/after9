import type { Metadata } from "next";
import { CreateEventFlow } from "./create-event-flow";

export const metadata: Metadata = {
  title: "Create event — After9",
  description: "Design your event flyer and details, then sign in to publish and manage tickets.",
};

export default function CreateEventPage() {
  return <CreateEventFlow />;
}
