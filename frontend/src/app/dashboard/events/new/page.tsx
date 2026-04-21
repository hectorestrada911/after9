import type { Metadata } from "next";
import NewEventClient from "./new-event-client";

export const metadata: Metadata = {
  title: "Create event · Host tools · RAGE",
  description: "Publish a new event with the same guided builder flow used on the marketing site.",
};

export default function NewEventPage() {
  return <NewEventClient />;
}
