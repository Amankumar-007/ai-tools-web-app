-- =====================================================================
-- TomatoAI growth schema: usage meters, bonus credits, streaks, referrals, newsletter.
--
-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor), after setting
-- SUPABASE_SERVICE_ROLE_KEY on your server. Safe to re-run.
--
-- Security model: every table has row-level security ON with NO policies, and every function is
-- revoked from public/anon/authenticated. Only your server (service role) can read or write, so a
-- visitor holding the public anon key cannot grant themselves credits or read subscriber emails.
-- =====================================================================

-- ── Tables ───────────────────────────────────────────────────────────

create table if not exists public.growth_profiles (
  uid                   uuid primary key,            -- = auth.users.id (no FK, so it also works in tests)
  referral_code         text not null unique,
  credits               integer not null default 0 check (credits >= 0),
  streak                integer not null default 0,
  longest_streak        integer not null default 0,
  last_active           date,
  referred_by           uuid references public.growth_profiles(uid) on delete set null,
  referral_status       text check (referral_status in ('pending', 'completed')),
  referral_completed_at timestamptz,
  created_at            timestamptz not null default now()
);
create index if not exists growth_profiles_referred_by_idx on public.growth_profiles (referred_by);

create table if not exists public.growth_usage (
  uid   uuid not null,
  kind  text not null check (kind in ('chat', 'tool')),
  day   date not null,
  count integer not null default 0,
  primary key (uid, kind, day)
);

create table if not exists public.growth_subscribers (
  id              bigserial primary key,
  email           text not null,
  source          text,
  token           text not null default md5(random()::text || clock_timestamp()::text),
  created_at      timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create unique index if not exists growth_subscribers_email_idx on public.growth_subscribers (lower(email));

-- Every paid plan purchase (Razorpay). This ledger is the source of truth for who is entitled to what;
-- the plan stored on the user's account is a cache of it. payment_id is the primary key, so the same
-- payment arriving twice (browser callback AND webhook) can only ever be recorded once.
create table if not exists public.growth_payments (
  payment_id   text primary key,                 -- Razorpay pay_xxx
  order_id     text not null unique,             -- Razorpay order_xxx: one order can only ever produce one grant
  uid          uuid not null,
  plan         text not null check (plan in ('pro', 'premium')),
  period       text not null check (period in ('month', 'year')),
  amount       integer not null check (amount > 0),   -- paise
  currency     text not null,
  period_start bigint not null,                  -- unix seconds
  period_end   bigint not null,
  status       text not null default 'paid' check (status in ('paid', 'refunded', 'superseded')),
  applied      boolean not null default false,   -- plan has been written to the user's account
  created_at   timestamptz not null default now()
);
create index if not exists growth_payments_uid_idx on public.growth_payments (uid, period_end desc);

alter table public.growth_profiles    enable row level security;
alter table public.growth_payments    enable row level security;
alter table public.growth_usage       enable row level security;
alter table public.growth_subscribers enable row level security;

-- ── Helpers ──────────────────────────────────────────────────────────

create or replace function public.growth_new_code() returns text
language plpgsql as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I: easy to read aloud
  code text;
  i integer;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
    end loop;
    exit when not exists (select 1 from public.growth_profiles where referral_code = code);
  end loop;
  return code;
end $$;

create or replace function public.growth_ensure(p_uid uuid) returns void
language plpgsql as $$
begin
  insert into public.growth_profiles (uid, referral_code) values (p_uid, public.growth_new_code())
  on conflict (uid) do nothing;
end $$;

-- ── Profile ──────────────────────────────────────────────────────────

create or replace function public.growth_profile(p_uid uuid) returns jsonb
language plpgsql as $$
declare v jsonb;
begin
  perform public.growth_ensure(p_uid);
  select jsonb_build_object(
    'uid', p.uid,
    'referralCode', p.referral_code,
    'credits', p.credits,
    'streak', p.streak,
    'longestStreak', p.longest_streak,
    'lastActive', p.last_active,
    'referredBy', p.referred_by,
    'referralStatus', p.referral_status,
    'referralsCompleted', (select count(*) from public.growth_profiles r where r.referred_by = p.uid and r.referral_status = 'completed'),
    'referralsPending',   (select count(*) from public.growth_profiles r where r.referred_by = p.uid and r.referral_status = 'pending')
  ) into v from public.growth_profiles p where p.uid = p_uid;
  return v;
end $$;

-- ── Metering ─────────────────────────────────────────────────────────
-- Spend one unit of today's allowance; when that is used up, spend one bonus credit.
-- The first successful use by a referred user also completes the referral and pays both sides.

create or replace function public.growth_consume(
  p_uid uuid, p_kind text, p_limit integer, p_day date,
  p_referee_bonus integer default 20,
  p_referrer_bonus integer default 20,
  p_referrer_monthly_cap integer default 20
) returns jsonb
language plpgsql as $$
declare
  v_count integer; v_credits integer; v_source text; v_used integer;
  v_ref uuid; v_done boolean := false; v_cap_ok boolean;
begin
  perform public.growth_ensure(p_uid);

  if p_limit > 0 then
    -- The WHERE makes this atomic: two parallel requests cannot both take the last slot.
    insert into public.growth_usage as u (uid, kind, day, count) values (p_uid, p_kind, p_day, 1)
    on conflict (uid, kind, day) do update set count = u.count + 1 where u.count < p_limit
    returning u.count into v_count;
  end if;

  if v_count is not null then
    v_source := 'daily';
  else
    update public.growth_profiles set credits = credits - 1 where uid = p_uid and credits > 0 returning credits into v_credits;
    if found then v_source := 'credit'; end if;
  end if;

  select count into v_used from public.growth_usage where uid = p_uid and kind = p_kind and day = p_day;
  v_used := coalesce(v_used, 0);

  if v_source is null then
    select credits into v_credits from public.growth_profiles where uid = p_uid;
    return jsonb_build_object('ok', false, 'used', v_used, 'limit', p_limit, 'credits', v_credits);
  end if;

  -- Referral completes on the referred user's first successful use.
  update public.growth_profiles set referral_status = 'completed', referral_completed_at = now()
  where uid = p_uid and referral_status = 'pending' returning referred_by into v_ref;
  if found then
    v_done := true;
    update public.growth_profiles set credits = credits + p_referee_bonus where uid = p_uid;
    if v_ref is not null then
      select count(*) < p_referrer_monthly_cap into v_cap_ok from public.growth_profiles
      where referred_by = v_ref and referral_status = 'completed' and uid <> p_uid
        and referral_completed_at >= date_trunc('month', now());
      if v_cap_ok then
        update public.growth_profiles set credits = credits + p_referrer_bonus where uid = v_ref;
      end if;
    end if;
  end if;

  select credits into v_credits from public.growth_profiles where uid = p_uid;
  return jsonb_build_object(
    'ok', true, 'source', v_source, 'used', v_used, 'limit', p_limit, 'credits', v_credits,
    'referralCompleted', v_done, 'referralBonus', case when v_done then p_referee_bonus else 0 end
  );
end $$;

-- Give the unit back when the work could not be delivered (e.g. every AI provider failed).
create or replace function public.growth_refund(p_uid uuid, p_kind text, p_day date, p_source text) returns jsonb
language plpgsql as $$
begin
  if p_source = 'daily' then
    update public.growth_usage set count = greatest(count - 1, 0) where uid = p_uid and kind = p_kind and day = p_day;
  elsif p_source = 'credit' then
    update public.growth_profiles set credits = credits + 1 where uid = p_uid;
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.growth_usage_today(p_uid uuid, p_day date) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'chat', coalesce((select count from public.growth_usage where uid = p_uid and kind = 'chat' and day = p_day), 0),
    'tool', coalesce((select count from public.growth_usage where uid = p_uid and kind = 'tool' and day = p_day), 0)
  );
$$;

-- ── Streaks ──────────────────────────────────────────────────────────
-- p_milestones maps streak length -> bonus credits, e.g. {"3":5,"7":10}.

create or replace function public.growth_touch(p_uid uuid, p_day date, p_milestones jsonb default '{}'::jsonb) returns jsonb
language plpgsql as $$
declare v_last date; v_streak integer; v_new integer; v_longest integer; v_award integer := 0;
begin
  perform public.growth_ensure(p_uid);
  select last_active, streak, longest_streak into v_last, v_streak, v_longest from public.growth_profiles where uid = p_uid;

  if v_last is not null and v_last >= p_day then
    return jsonb_build_object('firstToday', false, 'streak', v_streak, 'longestStreak', v_longest, 'awarded', 0);
  end if;

  v_new := case when v_last = p_day - 1 then v_streak + 1 else 1 end;

  -- Conditional update: if a parallel request already advanced today, this matches no row and awards nothing.
  update public.growth_profiles
  set last_active = p_day, streak = v_new, longest_streak = greatest(longest_streak, v_new)
  where uid = p_uid and (last_active is null or last_active < p_day)
  returning longest_streak into v_longest;
  if not found then
    select streak, longest_streak into v_streak, v_longest from public.growth_profiles where uid = p_uid;
    return jsonb_build_object('firstToday', false, 'streak', v_streak, 'longestStreak', v_longest, 'awarded', 0);
  end if;

  v_award := coalesce((p_milestones ->> v_new::text)::integer, 0);
  if v_award > 0 then
    update public.growth_profiles set credits = credits + v_award where uid = p_uid;
  end if;
  return jsonb_build_object('firstToday', true, 'streak', v_new, 'longestStreak', v_longest, 'awarded', v_award);
end $$;

-- ── Referrals ────────────────────────────────────────────────────────

create or replace function public.growth_claim_referral(p_uid uuid, p_code text) returns jsonb
language plpgsql as $$
declare v_ref uuid; v_code text := upper(trim(coalesce(p_code, '')));
begin
  perform public.growth_ensure(p_uid);
  if exists (select 1 from public.growth_profiles where uid = p_uid and referred_by is not null) then
    return jsonb_build_object('ok', false, 'reason', 'already_referred');
  end if;
  select uid into v_ref from public.growth_profiles where referral_code = v_code;
  if not found then return jsonb_build_object('ok', false, 'reason', 'invalid_code'); end if;
  if v_ref = p_uid then return jsonb_build_object('ok', false, 'reason', 'self'); end if;
  -- Only genuinely new users can be "referred": someone who already used the product cannot be.
  if exists (select 1 from public.growth_usage where uid = p_uid) then
    return jsonb_build_object('ok', false, 'reason', 'not_new');
  end if;
  update public.growth_profiles set referred_by = v_ref, referral_status = 'pending'
  where uid = p_uid and referred_by is null;
  if not found then return jsonb_build_object('ok', false, 'reason', 'already_referred'); end if;
  return jsonb_build_object('ok', true);
end $$;

-- ── Newsletter ───────────────────────────────────────────────────────

create or replace function public.growth_subscribe(p_email text, p_source text default null) returns jsonb
language plpgsql as $$
declare v_email text := lower(trim(p_email)); v_existing public.growth_subscribers%rowtype;
begin
  select * into v_existing from public.growth_subscribers where lower(email) = v_email;
  if found then
    if v_existing.unsubscribed_at is not null then
      update public.growth_subscribers set unsubscribed_at = null where id = v_existing.id;
      return jsonb_build_object('ok', true, 'already', false);
    end if;
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  insert into public.growth_subscribers (email, source) values (v_email, left(p_source, 60));
  return jsonb_build_object('ok', true, 'already', false);
end $$;

create or replace function public.growth_unsubscribe(p_token text) returns jsonb
language plpgsql as $$
begin
  update public.growth_subscribers set unsubscribed_at = now() where token = p_token and unsubscribed_at is null;
  return jsonb_build_object('ok', found);
end $$;

create or replace function public.growth_subscribers_export() returns jsonb
language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object('email', email, 'source', source, 'createdAt', created_at) order by created_at), '[]'::jsonb)
  from public.growth_subscribers where unsubscribed_at is null;
$$;

-- ── Payments ─────────────────────────────────────────────────────────
-- All times are unix seconds and passed in, so behaviour is deterministic and testable.

create or replace function public.growth_plan_rank(p_plan text) returns integer
language sql immutable as $$ select case p_plan when 'premium' then 2 when 'pro' then 1 else 0 end $$;

-- Record a captured payment and decide the period it buys. Atomic per user (advisory lock) and idempotent
-- per payment: calling it again returns the original row untouched.
--   same plan still active  -> the new period starts when the current one ends (renewals stack)
--   different / no plan     -> starts now; other paid periods of that user are marked superseded
--   a LOWER plan than the active one (only possible by racing two checkouts) -> recorded but has no effect
create or replace function public.growth_payment_claim(
  p_payment_id text, p_order_id text, p_uid uuid, p_plan text, p_period text,
  p_amount integer, p_currency text, p_now bigint, p_duration bigint
) returns jsonb
language plpgsql as $$
declare
  v_row public.growth_payments%rowtype;
  v_created boolean := false;
  v_active public.growth_payments%rowtype;
  v_chain_end bigint;
  v_start bigint;
  v_status text := 'paid';
begin
  perform pg_advisory_xact_lock(hashtext('growth_payment:' || p_uid::text));

  select * into v_row from public.growth_payments where payment_id = p_payment_id;
  if found then
    if v_row.uid <> p_uid then return jsonb_build_object('ok', false, 'reason', 'uid_mismatch'); end if;
  else
    if exists (select 1 from public.growth_payments where order_id = p_order_id) then
      return jsonb_build_object('ok', false, 'reason', 'order_already_paid');
    end if;

    select * into v_active from public.growth_payments
    where uid = p_uid and status = 'paid' and period_start <= p_now and period_end > p_now
    order by public.growth_plan_rank(plan) desc, period_end desc limit 1;

    if found and public.growth_plan_rank(v_active.plan) > public.growth_plan_rank(p_plan) then
      v_status := 'superseded';
      v_start := p_now;
    elsif found and v_active.plan = p_plan then
      select max(period_end) into v_chain_end from public.growth_payments
      where uid = p_uid and status = 'paid' and plan = p_plan and period_end > p_now;
      v_start := greatest(p_now, v_chain_end);
    else
      v_start := p_now;
      update public.growth_payments set status = 'superseded' where uid = p_uid and status = 'paid' and period_end > p_now;
    end if;

    insert into public.growth_payments (payment_id, order_id, uid, plan, period, amount, currency, period_start, period_end, status)
    values (p_payment_id, p_order_id, p_uid, p_plan, p_period, p_amount, p_currency, v_start, v_start + p_duration, v_status)
    returning * into v_row;
    v_created := true;
  end if;

  return jsonb_build_object(
    'ok', true, 'created', v_created, 'applied', v_row.applied, 'status', v_row.status,
    'uid', v_row.uid, 'plan', v_row.plan, 'period', v_row.period,
    'periodStart', v_row.period_start, 'periodEnd', v_row.period_end,
    'reason', case when v_row.status = 'superseded' then 'lower_plan_active' else null end
  );
end $$;

-- What the user is entitled to at p_now (null = free). Highest active plan wins; its end is the end of the
-- last contiguous period of that plan, so stacked renewals are reflected.
create or replace function public.growth_payment_entitlement(p_uid uuid, p_now bigint) returns jsonb
language plpgsql stable as $$
declare v_row public.growth_payments%rowtype; v_end bigint;
begin
  select * into v_row from public.growth_payments
  where uid = p_uid and status = 'paid' and period_start <= p_now and period_end > p_now
  order by public.growth_plan_rank(plan) desc, period_end desc limit 1;
  if not found then return null; end if;
  select max(period_end) into v_end from public.growth_payments
  where uid = p_uid and status = 'paid' and plan = v_row.plan and period_end > p_now;
  return jsonb_build_object('plan', v_row.plan, 'period', v_row.period, 'periodEnd', v_end, 'paymentId', v_row.payment_id);
end $$;

create or replace function public.growth_payment_mark_applied(p_payment_id text) returns jsonb
language plpgsql as $$
begin
  update public.growth_payments set applied = true where payment_id = p_payment_id;
  return jsonb_build_object('ok', found);
end $$;

-- A full refund removes that purchase's access. Returns the user so the caller can re-derive their plan.
create or replace function public.growth_payment_refund(p_payment_id text) returns jsonb
language plpgsql as $$
declare v_uid uuid; v_was text;
begin
  select uid, status into v_uid, v_was from public.growth_payments where payment_id = p_payment_id for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'unknown_payment'); end if;
  update public.growth_payments set status = 'refunded' where payment_id = p_payment_id;
  return jsonb_build_object('ok', true, 'uid', v_uid, 'changed', v_was <> 'refunded');
end $$;

-- ── Admin stats ──────────────────────────────────────────────────────

create or replace function public.growth_stats(p_day date) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'profiles', (select count(*) from public.growth_profiles),
    'referralsCompleted', (select count(*) from public.growth_profiles where referral_status = 'completed'),
    'referralsPending', (select count(*) from public.growth_profiles where referral_status = 'pending'),
    'subscribers', (select count(*) from public.growth_subscribers where unsubscribed_at is null),
    'activeToday', (select count(*) from public.growth_profiles where last_active = p_day),
    'chatToday', (select coalesce(sum(count), 0) from public.growth_usage where kind = 'chat' and day = p_day),
    'toolToday', (select coalesce(sum(count), 0) from public.growth_usage where kind = 'tool' and day = p_day),
    'creditsOutstanding', (select coalesce(sum(credits), 0) from public.growth_profiles),
    'payments', (select count(*) from public.growth_payments where status <> 'refunded'),
    'revenue', coalesce((select jsonb_object_agg(currency, total) from (select currency, sum(amount) as total from public.growth_payments where status <> 'refunded' group by currency) t), '{}'::jsonb)
  );
$$;

-- ── Lock everything away from browsers ───────────────────────────────

do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'growth\_%'
  loop
    execute format('revoke all on function %s from public', r.sig);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function %s from anon, authenticated', r.sig);
    end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function %s to service_role', r.sig);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.growth_profiles, public.growth_usage, public.growth_subscribers, public.growth_payments from anon, authenticated;
  end if;
end $$;
