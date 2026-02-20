-- 0001_init.sql
create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role text not null default 'agent',
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  url text,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  source_id uuid not null references public.knowledge_sources(id) on delete cascade,
  title text,
  url text,
  snippet text not null,
  embedding jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  external_id text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid,
  tool_name text not null,
  input jsonb not null,
  output jsonb,
  success boolean not null,
  created_at timestamptz not null default now()
);

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.leads enable row level security;
alter table public.skill_audit_logs enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "tenant_members_read_sources" on public.knowledge_sources
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = knowledge_sources.tenant_id
  )
);

create policy "tenant_members_manage_sources" on public.knowledge_sources
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = knowledge_sources.tenant_id
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = knowledge_sources.tenant_id
  )
);

create policy "tenant_members_manage_chunks" on public.knowledge_chunks
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = knowledge_chunks.tenant_id
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = knowledge_chunks.tenant_id
  )
);

create policy "tenant_members_manage_conversations" on public.conversations
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = conversations.tenant_id
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = conversations.tenant_id
  )
);

create policy "tenant_members_manage_messages" on public.messages
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = messages.tenant_id
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = messages.tenant_id
  )
);

create policy "tenant_members_manage_leads" on public.leads
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = leads.tenant_id
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = leads.tenant_id
  )
);

create policy "tenant_members_manage_skill_logs" on public.skill_audit_logs
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = skill_audit_logs.tenant_id
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.tenant_id = skill_audit_logs.tenant_id
  )
);

insert into public.tenants (id, name)
values ('11111111-1111-1111-1111-111111111111', 'Demo Realty')
on conflict do nothing;
