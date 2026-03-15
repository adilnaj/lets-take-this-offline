-- sentence_feedback_calls: per-user daily AI call tracking for rate limiting
-- One row per (user, date) — call_count incremented each time the user gets AI feedback.
-- PRIMARY KEY on (user_id, call_date) enables upsert-based atomic increment.
create table public.sentence_feedback_calls (
  user_id    uuid  not null references auth.users(id) on delete cascade,
  call_date  date  not null default current_date,
  call_count integer not null default 1,
  primary key (user_id, call_date)
);

-- RLS
alter table public.sentence_feedback_calls enable row level security;

create policy "sentence_feedback_calls_own" on public.sentence_feedback_calls
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
