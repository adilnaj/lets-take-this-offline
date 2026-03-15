create or replace function match_similar_words(
  query_embedding extensions.vector(1024),
  similarity_threshold float  -- cosine DISTANCE threshold (0 = identical, lower = more similar)
)
returns table(id uuid, title text, distance float)
language sql
as $$
  select id, title, (embedding <=> query_embedding) as distance
  from public.words
  where embedding is not null
    and (embedding <=> query_embedding) < similarity_threshold
  order by distance asc
  limit 1;
$$;
