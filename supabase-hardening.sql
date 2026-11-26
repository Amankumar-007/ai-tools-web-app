-- Run once in the Supabase SQL editor (Dashboard → SQL Editor).
--
-- Why: the original policy "Allow full access for authenticated users" lets ANY signed-in user
-- (anyone can register) insert, update and delete rows in public.ai_tools straight from the browser,
-- using the public anon key. Only the admin API should write to this table, and it will do so with the
-- service-role key (SUPABASE_SERVICE_ROLE_KEY), which bypasses RLS and is never sent to browsers.
--
-- Before running: set SUPABASE_SERVICE_ROLE_KEY in your server environment, otherwise admin
-- add/edit/delete will stop working after this change.

drop policy if exists "Allow full access for authenticated users" on public.ai_tools;

-- Public read-only access stays.
-- (policy "Allow public read-only access to ai_tools" is unchanged)

-- Make sure no write privileges remain for the browser-facing roles.
revoke insert, update, delete on public.ai_tools from anon, authenticated;

-- Sanity check: should list only the SELECT policy.
select policyname, cmd, roles from pg_policies where schemaname = 'public' and tablename = 'ai_tools';
