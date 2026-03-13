-- Enable pgvector extension (required for vector(1024) column and HNSW index)
-- Must be in 'extensions' schema to avoid conflicts with public schema
create extension if not exists vector with schema extensions;

-- Category enum: fixed list that Phase 2 archive filter UI will use directly.
-- These 8 values cover all common business/tech jargon domains.
-- DO NOT add free-form values — the seed script must pick from this list exactly.
create type word_category as enum (
  'Strategy',
  'Tech',
  'Finance',
  'HR',
  'Operations',
  'Marketing',
  'Legal',
  'Other'
);

-- Words table: core content table for the entire application.
-- Schema is intentionally wide — all Phase 2-5 fields are included here
-- to avoid destructive ALTER TABLE operations in later phases.
create table public.words (
  id                uuid         primary key default gen_random_uuid(),
  title             text         not null,
  slug              text         not null unique,
  daily_date        date         not null unique,  -- DATE (not TIMESTAMP) — uniqueness enforced; Phase 2 routing depends on this
  category          word_category not null,
  definition        text         not null,
  exec_summary      text         not null,         -- "executive summary" shown on word page
  where_used        text         not null,         -- "where/how used" context section
  usage_examples    jsonb        not null default '[]', -- array of example sentences
  heard_in_wild     text,                          -- paraphrased citation (nullable: some words may lack citations)
  heard_source_url  text,                          -- source link for citation (nullable)
  embedding         extensions.vector(1024),       -- voyage-3.5 produces 1024-dim vectors; Phase 5 uses this for dedup
  created_at        timestamptz  not null default now()
);

-- HNSW index for fast cosine similarity search.
-- Phase 5 AI pipeline uses this for near-duplicate detection.
-- Created now so Phase 5 doesn't need a migration.
create index words_embedding_hnsw_idx
  on public.words
  using hnsw (embedding extensions.vector_cosine_ops);

-- Enable Row Level Security
alter table public.words enable row level security;

-- Policy: anyone (anon or authenticated) can read words.
-- This is intentional — word content is public, no login required to browse.
create policy "words_public_read"
  on public.words
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies for anon or authenticated roles.
-- Only the service role key (used in seed script and AI pipeline cron) can write.
-- This is enforced by RLS — service role bypasses RLS entirely.
