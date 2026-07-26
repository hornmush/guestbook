-- Supabase SQL Editor에서 실행하세요.

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  parent_id uuid references posts(id) on delete cascade,
  nickname text not null,
  content text not null,
  password text not null,
  created_at timestamptz not null default now()
);

create index if not exists posts_room_id_idx on posts(room_id);
create index if not exists posts_parent_id_idx on posts(parent_id);

alter table rooms enable row level security;
alter table posts enable row level security;

create policy "rooms_select" on rooms for select using (true);
create policy "rooms_insert" on rooms for insert with check (true);

create policy "posts_select" on posts for select using (true);
create policy "posts_insert" on posts for insert with check (true);
