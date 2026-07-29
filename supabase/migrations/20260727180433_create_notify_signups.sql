-- Stores email signups from the /notify page. Nothing else lives in this
-- project's Supabase instance for this site.
create table if not exists public.notify_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  product text,
  created_at timestamptz not null default now()
);

alter table public.notify_signups enable row level security;

-- The app writes through a server-side route using the project's secret
-- key, which bypasses RLS. This policy is defense-in-depth only, in case a
-- client-side path is added later: anon may insert, never read/update/delete.
create policy "Anon can insert notify signups"
  on public.notify_signups
  for insert
  to anon
  with check (true);
