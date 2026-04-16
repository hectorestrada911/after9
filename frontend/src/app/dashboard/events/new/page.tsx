"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Select } from "@/components/ui";
import { eventSchema } from "@/lib/validations";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function NewEventPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCreatedLink(null);
    const formData = new FormData(e.currentTarget);
    const coverImage = formData.get("coverImage");
    const file = coverImage instanceof File && coverImage.size > 0 ? coverImage : null;
    const parsed = eventSchema.safeParse({
      ...Object.fromEntries(formData),
      imageUrl: "https://placeholder.local/cover.jpg",
    });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid event data.");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return setError("Please login first.");

    const title = parsed.data.title;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    let imageUrl = parsed.data.imageUrl;
    if (file) {
      const extension = file.name.split(".").pop() || "jpg";
      const path = `${userData.user.id}/${slug}-${Date.now()}.${extension}`;
      const upload = await supabase.storage.from("event-images").upload(path, file, { upsert: true });
      if (upload.error) return setError(upload.error.message);
      const publicUrl = supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
      imageUrl = publicUrl;
    }

    const payload = {
      host_id: userData.user.id,
      title,
      description: parsed.data.description,
      image_url: imageUrl,
      date: parsed.data.date,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      location: parsed.data.location,
      capacity: parsed.data.capacity,
      ticket_price: Math.round(parsed.data.ticketPrice * 100),
      tickets_available: parsed.data.ticketsAvailable,
      visibility: parsed.data.visibility,
      age_restriction: parsed.data.ageRestriction,
      dress_code: parsed.data.dressCode || null,
      instructions: parsed.data.instructions || null,
      location_note: parsed.data.locationNote || null,
      slug,
    };

    const { error } = await supabase.from("events").insert(payload);
    if (error) return setError(error.message);
    const link = `${window.location.origin}/events/${slug}`;
    setCreatedLink(link);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  }

  return (
    <main className="container-page py-8">
      <Card className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">Create event</h1>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <Input name="title" placeholder="Event title" required />
          <Input name="description" placeholder="Event description" required />
          <Input name="coverImage" type="file" accept="image/*" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="date" type="date" required />
            <Input name="startTime" type="time" required />
            <Input name="endTime" type="time" required />
          </div>
          <Input name="location" placeholder="Location" required />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="capacity" type="number" placeholder="Capacity" required />
            <Input name="ticketPrice" type="number" step="0.01" placeholder="Ticket price" required />
            <Input name="ticketsAvailable" type="number" placeholder="Ticket quantity" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select name="visibility" defaultValue="public"><option value="public">Public</option><option value="private">Private link only</option></Select>
            <Select name="ageRestriction" defaultValue="all_ages"><option value="all_ages">All ages</option><option value="age_18_plus">18+</option><option value="age_21_plus">21+</option></Select>
          </div>
          <Input name="dressCode" placeholder="Dress code (optional)" />
          <Input name="instructions" placeholder="Instructions (optional)" />
          <Input name="locationNote" placeholder="Approximate location note (optional)" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {createdLink && (
            <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">
              Event created. Share this link: {createdLink}
            </p>
          )}
          <Button>Create event</Button>
        </form>
      </Card>
    </main>
  );
}
