-- 0002_pgvector.sql
-- Enable pgvector extension and upgrade knowledge_chunks for real vector search.
-- Run this after 0001_init.sql.

create extension if not exists vector;

-- Upgrade embedding column from jsonb to vector(1536) for OpenAI text-embedding-3-small.
-- Existing jsonb arrays are cast; rows with null embedding stay null.
alter table public.knowledge_chunks
  alter column embedding type vector(1536)
  using case
    when embedding is null then null
    else (
      select array_agg(v::float)::vector(1536)
      from jsonb_array_elements_text(embedding) as v
    )
  end;

-- IVFFlat index for fast approximate nearest-neighbour cosine search.
-- lists = 100 is a reasonable default; tune when chunk count exceeds 1 M.
create index if not exists knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ---------------------------------------------------------------
-- RPC: search_knowledge_chunks
-- Returns the top-K most similar chunks for a given query vector.
-- Falls back gracefully when no embeddings are indexed.
-- ---------------------------------------------------------------
create or replace function search_knowledge_chunks(
  p_tenant_id    uuid,
  p_embedding    vector(1536),
  p_match_count  int  default 5,
  p_min_sim      float default 0.0
)
returns table (
  source_id   uuid,
  title       text,
  url         text,
  snippet     text,
  similarity  float
)
language sql
stable
security definer
as $$
  select
    kc.source_id,
    coalesce(kc.title, ks.title)  as title,
    coalesce(kc.url,   ks.url)    as url,
    kc.snippet,
    1 - (kc.embedding <=> p_embedding) as similarity
  from public.knowledge_chunks kc
  join public.knowledge_sources ks on ks.id = kc.source_id
  where kc.tenant_id = p_tenant_id
    and kc.embedding is not null
    and 1 - (kc.embedding <=> p_embedding) >= p_min_sim
  order by kc.embedding <=> p_embedding
  limit p_match_count;
$$;

-- ---------------------------------------------------------------
-- knowledge_sources: add chunk_count convenience column
-- ---------------------------------------------------------------
alter table public.knowledge_sources
  add column if not exists chunk_count  int     not null default 0,
  add column if not exists status       text    not null default 'pending',
  add column if not exists updated_at   timestamptz not null default now();

-- Keep chunk_count in sync automatically
create or replace function sync_source_chunk_count()
returns trigger language plpgsql as $$
begin
  update public.knowledge_sources
  set
    chunk_count = (
      select count(*) from public.knowledge_chunks
      where source_id = coalesce(new.source_id, old.source_id)
    ),
    status = 'indexed',
    updated_at = now()
  where id = coalesce(new.source_id, old.source_id);
  return null;
end;
$$;

drop trigger if exists trg_sync_chunk_count on public.knowledge_chunks;
create trigger trg_sync_chunk_count
  after insert or delete on public.knowledge_chunks
  for each row execute function sync_source_chunk_count();

-- ---------------------------------------------------------------
-- tenants: add branding columns used by Settings page
-- ---------------------------------------------------------------
alter table public.tenants
  add column if not exists bot_name         text,
  add column if not exists welcome_message  text,
  add column if not exists widget_theme     text not null default 'dark',
  add column if not exists brand_color      text not null default '#7c3aed',
  add column if not exists website_url      text,
  add column if not exists updated_at       timestamptz not null default now();
