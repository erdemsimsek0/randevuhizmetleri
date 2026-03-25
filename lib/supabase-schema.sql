-- Enable RLS
-- profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'isletme' check (role in ('isletme', 'superadmin')),
  business_id uuid,
  created_at timestamptz default now()
);

-- businesses
create table businesses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references profiles(id) on delete cascade,
  logo_url text,
  phone text,
  address text,
  about text,
  plan text not null default 'temel' check (plan in ('temel', 'pro', 'kurumsal')),
  status text not null default 'aktif' check (status in ('aktif', 'pasif', 'askida')),
  created_at timestamptz default now()
);

-- staff
create table staff (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  role text not null default 'Uzman',
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- services
create table services (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  duration integer not null default 30,
  price numeric(10,2) not null default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- working_hours
create table working_hours (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  day integer not null check (day >= 0 and day <= 6),
  is_open boolean default true,
  open_time text not null default '09:00',
  close_time text not null default '18:00',
  unique(business_id, day)
);

-- appointments
create table appointments (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  staff_id uuid references staff(id) on delete set null,
  service_id uuid references services(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  date date not null,
  time time not null,
  status text not null default 'bekliyor' check (status in ('bekliyor', 'onaylandi', 'iptal', 'tamamlandi')),
  notes text,
  created_at timestamptz default now()
);

-- products
create table products (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0,
  image_url text,
  stock integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- RLS policies
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table staff enable row level security;
alter table services enable row level security;
alter table working_hours enable row level security;
alter table appointments enable row level security;
alter table products enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Businesses: owner can do everything, public can read
create policy "Business owner full access" on businesses for all using (owner_id = auth.uid());
create policy "Public can read businesses" on businesses for select using (status = 'aktif');

-- Staff: business owner can manage, public can read
create policy "Owner manages staff" on staff for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "Public can read staff" on staff for select using (is_active = true);

-- Services: same pattern
create policy "Owner manages services" on services for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "Public can read services" on services for select using (is_active = true);

-- Working hours: owner manages, public reads
create policy "Owner manages hours" on working_hours for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "Public can read hours" on working_hours for select using (true);

-- Appointments: owner can manage theirs, customers can insert
create policy "Owner manages appointments" on appointments for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "Anyone can create appointment" on appointments for insert with check (true);

-- Products
create policy "Owner manages products" on products for all using (
  business_id in (select id from businesses where owner_id = auth.uid())
);
create policy "Public can read products" on products for select using (is_active = true);

-- Function to auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'isletme'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
