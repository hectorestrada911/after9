-- Unlisted: guest page + checkout work for anyone with the link, but the event is not shown on the public home browse strip.

alter type event_visibility add value if not exists 'unlisted';

drop policy if exists "public_event_read" on events;

create policy "public_event_read" on events for select using (
  visibility in ('public', 'unlisted') or auth.uid() = host_id
);
