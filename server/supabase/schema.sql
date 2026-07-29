

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  company     text,
  content     text not null,
  rating      smallint not null check (rating between 1 and 5),
  photo_url   text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- P2: lightweight AI-derived sentiment label, filled in async after submission
  sentiment   text check (sentiment in ('positive', 'neutral', 'negative')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_testimonials_status on testimonials (status, created_at desc);
create index if not exists idx_testimonials_email_created on testimonials (email, created_at desc); -- dedup checks

-- keep updated_at fresh on every UPDATE
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_testimonials_updated_at on testimonials;
create trigger trg_testimonials_updated_at
  before update on testimonials
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- settings (singleton row — one business, one owner)
-- ---------------------------------------------------------------------------
create table if not exists settings (
  id             int primary key default 1 check (id = 1),
  business_name  text not null default 'Our Business',
  accent_color   text not null default '#C08A2E',
  layout         text not null default 'grid' check (layout in ('grid', 'list')),
  updated_at     timestamptz not null default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_settings_updated_at on settings;
create trigger trg_settings_updated_at
  before update on settings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The server uses the SERVICE_ROLE key (bypasses RLS entirely) for all writes
-- and moderation reads. RLS below only matters if anon key is ever used
-- client-side (it currently isn't, but this is a safe floor).
-- ---------------------------------------------------------------------------
alter table testimonials enable row level security;
alter table settings enable row level security;

drop policy if exists "public can read approved testimonials" on testimonials;
create policy "public can read approved testimonials"
  on testimonials for select
  using (status = 'approved');

drop policy if exists "public can read settings" on settings;
create policy "public can read settings"
  on settings for select
  using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for optional testimonial photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('testimonial-photos', 'testimonial-photos', true)
on conflict (id) do nothing;

drop policy if exists "anyone can upload a testimonial photo" on storage.objects;
create policy "anyone can upload a testimonial photo"
  on storage.objects for insert
  with check (bucket_id = 'testimonial-photos');

drop policy if exists "anyone can read testimonial photos" on storage.objects;
create policy "anyone can read testimonial photos"
  on storage.objects for select
  using (bucket_id = 'testimonial-photos');
