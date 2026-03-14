-- user_activity: one row per (user, word, activity_type, day)
create table public.user_activity (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  word_id          uuid        not null references public.words(id) on delete cascade,
  activity_type    text        not null check (activity_type in ('flashcard','fill_blank','sentence','context_match')),
  completed_date   date        not null default current_date,
  created_at       timestamptz not null default now(),
  unique (user_id, word_id, activity_type, completed_date)
);
create index on public.user_activity (user_id, completed_date);

-- user_stats: one row per user
create table public.user_stats (
  user_id          uuid        primary key references auth.users(id) on delete cascade,
  total_points     integer     not null default 0,
  streak_count     integer     not null default 0,
  last_active_date date,
  updated_at       timestamptz not null default now()
);

-- user_favorites
create table public.user_favorites (
  user_id    uuid  not null references auth.users(id) on delete cascade,
  word_id    uuid  not null references public.words(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, word_id)
);
create index on public.user_favorites (user_id);

-- word_mastery
create table public.word_mastery (
  user_id        uuid  not null references auth.users(id) on delete cascade,
  word_id        uuid  not null references public.words(id) on delete cascade,
  mastery_level  text  not null default 'seen'
                       check (mastery_level in ('seen','learning','mastered')),
  activity_count integer not null default 0,
  updated_at     timestamptz not null default now(),
  primary key (user_id, word_id)
);
create index on public.word_mastery (user_id);

-- RLS
alter table public.user_activity  enable row level security;
alter table public.user_stats      enable row level security;
alter table public.user_favorites  enable row level security;
alter table public.word_mastery    enable row level security;

create policy "user_activity_own"  on public.user_activity
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_stats_own"     on public.user_stats
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_favorites_own" on public.user_favorites
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "word_mastery_own"   on public.word_mastery
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
