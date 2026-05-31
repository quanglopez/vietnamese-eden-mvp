-- ALE-83: Fix workspace bootstrap on Supabase Cloud
-- PostgREST INSERT ... RETURNING needs SELECT visibility for the new row.
-- Without owner SELECT, clients see: "new row violates row-level security policy for table workspaces"

create policy "workspaces_select_owner"
  on public.workspaces for select to authenticated
  using (owner_id = auth.uid());

-- Fallback when auth.users trigger did not create a profile row yet
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());
