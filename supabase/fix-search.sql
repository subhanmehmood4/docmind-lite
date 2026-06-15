-- Run if chat says "no document uploaded" but upload succeeded
-- IVFFlat index fails on small datasets (fewer rows than list count)

drop index if exists documents_embedding_idx;

create index if not exists documents_embedding_hnsw_idx
  on documents
  using hnsw (embedding vector_cosine_ops);
