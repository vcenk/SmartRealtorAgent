-- Subscription & billing support
-- Each user gets one subscription row. Defaults to the free "starter" plan.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'starter'
    check (plan in ('starter', 'growth', 'enterprise')),
  status text not null default 'active'
    check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Index for Stripe webhook lookups
create index if not exists idx_subscriptions_stripe_customer
  on public.subscriptions(stripe_customer_id);

-- RLS
alter table public.subscriptions enable row level security;

-- Users can read their own subscription
drop policy if exists "users_read_own_subscription" on public.subscriptions;
create policy "users_read_own_subscription" on public.subscriptions
  for select using (user_id = auth.uid());

-- Service role can manage all subscriptions (for webhooks)
drop policy if exists "service_role_manage_subscriptions" on public.subscriptions;
create policy "service_role_manage_subscriptions" on public.subscriptions
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Auto-create a starter subscription when a new user signs up
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (NEW.id, 'starter', 'active')
  on conflict (user_id) do nothing;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- Backfill: give every existing user a starter subscription if they don't have one
insert into public.subscriptions (user_id, plan, status)
select id, 'starter', 'active'
from auth.users
where id not in (select user_id from public.subscriptions)
on conflict (user_id) do nothing;
