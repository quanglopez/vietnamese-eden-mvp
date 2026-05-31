-- ALE-77: Beta waitlist for public landing page

create table public.beta_waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  use_case text,
  source text not null default 'landing',
  created_at timestamptz not null default now(),
  constraint beta_waitlist_full_name_len check (char_length(trim(full_name)) >= 2),
  constraint beta_waitlist_email_len check (char_length(trim(email)) >= 5)
);

create unique index beta_waitlist_email_lower_idx on public.beta_waitlist (lower(trim(email)));

comment on table public.beta_waitlist is 'Public beta waitlist signups from marketing landing';

alter table public.beta_waitlist enable row level security;

-- Public can submit only; no public reads
create policy "beta_waitlist_insert_public"
on public.beta_waitlist
for insert
to anon, authenticated
with check (
  char_length(trim(full_name)) >= 2
  and trim(email) ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

create policy "beta_waitlist_no_select"
on public.beta_waitlist
for select
using (false);

create policy "beta_waitlist_no_update"
on public.beta_waitlist
for update
using (false);

create policy "beta_waitlist_no_delete"
on public.beta_waitlist
for delete
using (false);

grant insert on table public.beta_waitlist to anon, authenticated;
