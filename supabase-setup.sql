-- Run this in the Supabase SQL Editor for a fresh project.
-- This schema stores anonymous visit metadata only; it has no IP field.

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  created_at timestamptz not null default now(),
  page_path text not null check (char_length(page_path) between 1 and 500),
  device_type text not null check (device_type in ('mobile', 'tablet', 'desktop')),
  browser text not null check (browser in ('Chrome', 'Edge', 'Firefox', 'Safari', 'Opera', 'Samsung Internet', 'Other')),
  operating_system text not null check (operating_system in ('Windows', 'macOS', 'Linux', 'ChromeOS', 'Android', 'iOS', 'Other')),
  referrer_host text check (referrer_host is null or char_length(referrer_host) <= 253)
);

alter table public.visitor_events enable row level security;

revoke all on table public.visitor_events from anon, authenticated;
grant insert (session_id, page_path, device_type, browser, operating_system, referrer_host)
  on table public.visitor_events to anon;
grant select on table public.visitor_events to authenticated;

drop policy if exists "Public can record anonymous visits" on public.visitor_events;
create policy "Public can record anonymous visits"
  on public.visitor_events for insert to anon
  with check (
    char_length(page_path) between 1 and 500
    and left(page_path, 1) = '/'
    and device_type in ('mobile', 'tablet', 'desktop')
    and browser in ('Chrome', 'Edge', 'Firefox', 'Safari', 'Opera', 'Samsung Internet', 'Other')
    and operating_system in ('Windows', 'macOS', 'Linux', 'ChromeOS', 'Android', 'iOS', 'Other')
    and (referrer_host is null or char_length(referrer_host) <= 253)
  );

drop policy if exists "Only Parth can read visitor analytics" on public.visitor_events;
create policy "Only Parth can read visitor analytics"
  on public.visitor_events for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'parthpusadkar1312@gmail.com');

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'visitor_events'
  ) then
    execute 'alter publication supabase_realtime add table public.visitor_events';
  end if;
end
$$;
