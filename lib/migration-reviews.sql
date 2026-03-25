create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete cascade unique,
  customer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_visible boolean default true,
  created_at timestamptz default now()
);

alter table reviews enable row level security;

-- Anyone can insert a review (linked to appointment)
create policy "Anyone can submit review" on reviews
  for insert with check (true);

-- Public can read visible reviews
create policy "Public can read reviews" on reviews
  for select using (is_visible = true);

-- Business owner can manage reviews
create policy "Owner manages reviews" on reviews
  for all using (
    business_id in (select id from businesses where owner_id = auth.uid())
  );
