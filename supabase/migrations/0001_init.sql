-- Christian Dating Do's & Don'ts — initial schema
-- Tables: users, daily_words, community_posts, post_reactions,
--         post_replies, reply_reactions, flagged_posts
-- Run with the Supabase SQL editor or `supabase db push`.

-- ============================================================
-- USERS  (profile mirror of auth.users)
-- ============================================================
create table if not exists public.users (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text,
  name               text,
  city               text,
  stage              text check (stage in ('seeking','dating','engaged','starting')),
  plan               text default 'annual' check (plan in ('monthly','annual')),
  is_premium         boolean not null default false,
  stripe_customer_id text,
  created_at         timestamptz not null default now()
);

-- ============================================================
-- DAILY WORDS  (one or more per calendar date)
-- ============================================================
create table if not exists public.daily_words (
  id          uuid primary key default gen_random_uuid(),
  date        date not null default current_date,
  type        text not null default 'VERSE',
  body        text not null,
  reference   text,
  translation text,
  reflection  text,
  created_at  timestamptz not null default now()
);
create index if not exists daily_words_date_idx on public.daily_words (date desc);

-- ============================================================
-- COMMUNITY POSTS  (the Wall)
-- user_id is nullable so seeded/system content can exist.
-- ============================================================
create table if not exists public.community_posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  name       text not null,
  location   text,
  stage      text check (stage in ('seeking','dating','engaged','starting')),
  category   text check (category in ('prayer','praise','word','wisdom')),
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists community_posts_created_idx on public.community_posts (created_at desc);

-- ============================================================
-- POST REACTIONS  (one reaction per user per post; kind is switchable)
-- ============================================================
create table if not exists public.post_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.community_posts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('praying','with_you','amen')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create index if not exists post_reactions_post_idx on public.post_reactions (post_id);

-- ============================================================
-- POST REPLIES
-- ============================================================
create table if not exists public.post_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.community_posts (id) on delete cascade,
  user_id    uuid references auth.users (id) on delete set null,
  name       text not null,
  location   text,
  stage      text check (stage in ('seeking','dating','engaged','starting')),
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists post_replies_post_idx on public.post_replies (post_id, created_at);

-- ============================================================
-- REPLY REACTIONS
-- ============================================================
create table if not exists public.reply_reactions (
  id         uuid primary key default gen_random_uuid(),
  reply_id   uuid not null references public.post_replies (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('praying','with_you','amen')),
  created_at timestamptz not null default now(),
  unique (reply_id, user_id)
);
create index if not exists reply_reactions_reply_idx on public.reply_reactions (reply_id);

-- ============================================================
-- FLAGGED POSTS  (moderation queue)
-- ============================================================
create table if not exists public.flagged_posts (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references public.community_posts (id) on delete cascade,
  reply_id   uuid references public.post_replies (id) on delete cascade,
  user_id    uuid references auth.users (id) on delete set null,
  reason     text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NEW-USER TRIGGER  (mirror auth.users → public.users)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, city, plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'You'),
    coalesce(new.raw_user_meta_data->>'city', 'somewhere'),
    coalesce(new.raw_user_meta_data->>'plan', 'annual')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users           enable row level security;
alter table public.daily_words     enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_reactions  enable row level security;
alter table public.post_replies    enable row level security;
alter table public.reply_reactions enable row level security;
alter table public.flagged_posts   enable row level security;

-- USERS: a user sees/edits only their own row.
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select using (auth.uid() = id);
drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users
  for insert with check (auth.uid() = id);
drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- DAILY WORDS: world-readable (scripture is never gated). No client writes.
drop policy if exists daily_words_read on public.daily_words;
create policy daily_words_read on public.daily_words
  for select using (true);

-- COMMUNITY POSTS: world-readable; authenticated users write/edit/remove their own.
drop policy if exists posts_read on public.community_posts;
create policy posts_read on public.community_posts
  for select using (true);
drop policy if exists posts_insert_own on public.community_posts;
create policy posts_insert_own on public.community_posts
  for insert with check (auth.uid() = user_id);
drop policy if exists posts_update_own on public.community_posts;
create policy posts_update_own on public.community_posts
  for update using (auth.uid() = user_id);
drop policy if exists posts_delete_own on public.community_posts;
create policy posts_delete_own on public.community_posts
  for delete using (auth.uid() = user_id);

-- POST REACTIONS: world-readable (for counts); users manage their own.
drop policy if exists post_reactions_read on public.post_reactions;
create policy post_reactions_read on public.post_reactions
  for select using (true);
drop policy if exists post_reactions_insert_own on public.post_reactions;
create policy post_reactions_insert_own on public.post_reactions
  for insert with check (auth.uid() = user_id);
drop policy if exists post_reactions_update_own on public.post_reactions;
create policy post_reactions_update_own on public.post_reactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists post_reactions_delete_own on public.post_reactions;
create policy post_reactions_delete_own on public.post_reactions
  for delete using (auth.uid() = user_id);

-- POST REPLIES: world-readable; users write/edit/remove their own.
drop policy if exists replies_read on public.post_replies;
create policy replies_read on public.post_replies
  for select using (true);
drop policy if exists replies_insert_own on public.post_replies;
create policy replies_insert_own on public.post_replies
  for insert with check (auth.uid() = user_id);
drop policy if exists replies_update_own on public.post_replies;
create policy replies_update_own on public.post_replies
  for update using (auth.uid() = user_id);
drop policy if exists replies_delete_own on public.post_replies;
create policy replies_delete_own on public.post_replies
  for delete using (auth.uid() = user_id);

-- REPLY REACTIONS: world-readable; users manage their own.
drop policy if exists reply_reactions_read on public.reply_reactions;
create policy reply_reactions_read on public.reply_reactions
  for select using (true);
drop policy if exists reply_reactions_insert_own on public.reply_reactions;
create policy reply_reactions_insert_own on public.reply_reactions
  for insert with check (auth.uid() = user_id);
drop policy if exists reply_reactions_update_own on public.reply_reactions;
create policy reply_reactions_update_own on public.reply_reactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists reply_reactions_delete_own on public.reply_reactions;
create policy reply_reactions_delete_own on public.reply_reactions
  for delete using (auth.uid() = user_id);

-- FLAGGED POSTS: authenticated users may file a flag; they can read their own.
drop policy if exists flags_insert_auth on public.flagged_posts;
create policy flags_insert_auth on public.flagged_posts
  for insert with check (auth.uid() = user_id);
drop policy if exists flags_select_own on public.flagged_posts;
create policy flags_select_own on public.flagged_posts
  for select using (auth.uid() = user_id);
