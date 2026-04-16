insert into profiles (id, full_name, school, organizer_name)
values
  ('11111111-1111-1111-1111-111111111111', 'Maya Lopez', 'State University', 'Maya Events'),
  ('22222222-2222-2222-2222-222222222222', 'Chris Young', 'City College', 'CY Promotions')
on conflict (id) do nothing;

insert into events (id, host_id, slug, title, description, image_url, date, start_time, end_time, location, capacity, ticket_price, tickets_available, visibility, age_restriction, dress_code, instructions, location_note)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'campus-lights-fest', 'Campus Lights Fest', 'A high-energy spring night with DJs and live visuals.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', '2026-05-10', '20:00', '01:00', 'Student Union Hall', 350, 2500, 300, 'public', 'all_ages', 'Neon casual', 'Bring student ID at entry.', 'Exact room sent 2 hours before doors open'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'rooftop-sunset-social', 'Rooftop Sunset Social', 'Golden-hour networking and music with skyline views.', 'https://images.unsplash.com/photo-1511578314322-379afb476865', '2026-05-18', '18:30', '23:00', 'Riverside Rooftop', 180, 3500, 150, 'public', 'age_18_plus', 'Smart casual', 'Arrive before 8 PM for priority line.', 'Main entrance near the riverwalk elevator')
on conflict (id) do nothing;
