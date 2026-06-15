-- DocMind Lite — Supabase schema (768-dim embeddings via Hugging Face mpnet)
-- Run in Supabase SQL Editor
--
-- If you previously used OpenAI (1536 dims), drop the old table first:
--   drop table if exists documents;
--   drop function if exists match_documents;

create extension if not exists vector;

create table if not exists documents (
  id          bigserial primary key,
  content     text not null,
  page        int not null,
  embedding   vector(768) not null,
  created_at  timestamptz default now()
);

create index if not exists documents_embedding_idx
  on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function match_documents (
  query_embedding vector(768),
  match_count int default 5
)
returns table (id bigint, content text, page int, similarity float)
language sql stable
as $$
  select id, content, page,
         1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Demo setup: allow server-side access with the anon key
alter table documents disable row level security;

grant usage on schema public to anon, authenticated;
grant all on table documents to anon, authenticated;
grant execute on function match_documents(vector, int) to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
