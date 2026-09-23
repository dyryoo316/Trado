-- trado 데이터베이스 스키마 + RLS
-- Supabase SQL Editor에서 전체 실행 (재실행 가능하도록 기존 테이블 삭제 후 생성)

drop table if exists blocks cascade;
drop table if exists reports cascade;
drop table if exists matches cascade;
drop table if exists reactions cascade;
drop table if exists items cascade;
drop table if exists profiles cascade;

-- 사용자 프로필 (auth.users와 1:1)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  created_at timestamptz default now()
);

-- 물건
create table items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  emoji text not null default '📦',
  category text not null check (category in ('굿즈','의류','도서','생활용품','기타')),
  condition text not null check (condition in ('새것','거의 새것','좋음','사용감 있음')),
  wanted_categories text[] not null default '{}',
  status text not null default 'available' check (status in ('available','matched')),
  created_at timestamptz default now()
);

-- 반응 (내 물건 from_item으로 상대 물건 to_item에 반응)
create table reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  from_item_id uuid not null references items(id) on delete cascade,
  to_item_id uuid not null references items(id) on delete cascade,
  type text not null check (type in ('X','PLUS','O')),
  created_at timestamptz default now(),
  unique (from_item_id, to_item_id)
);

-- 매칭
create table matches (
  id uuid primary key default gen_random_uuid(),
  item_a_id uuid not null references items(id),
  item_b_id uuid not null references items(id),
  user_a_id uuid not null references profiles(id),
  user_b_id uuid not null references profiles(id),
  seen_by_a boolean not null default false,
  seen_by_b boolean not null default false,
  trade_method text check (trade_method in ('직거래','택배')),
  trade_detail jsonb,
  created_at timestamptz default now()
);

-- 신고
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id),
  target_user_id uuid not null references profiles(id),
  target_item_id uuid references items(id),
  reason text not null check (reason in ('허위 물건','부적절한 내용','기타')),
  created_at timestamptz default now()
);

-- 차단
create table blocks (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- RLS 활성화
alter table profiles enable row level security;
alter table items enable row level security;
alter table reactions enable row level security;
alter table matches enable row level security;
alter table reports enable row level security;
alter table blocks enable row level security;

-- profiles: 로그인한 사용자는 전체 조회, 본인 행만 쓰기
create policy "profiles_select_authenticated" on profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on profiles
  for update to authenticated using (id = auth.uid());

-- items: 로그인한 사용자는 전체 조회, 본인 행만 쓰기
create policy "items_select_authenticated" on items
  for select to authenticated using (true);
create policy "items_insert_own" on items
  for insert to authenticated with check (owner_id = auth.uid());
create policy "items_update_own" on items
  for update to authenticated using (owner_id = auth.uid());
create policy "items_delete_own" on items
  for delete to authenticated using (owner_id = auth.uid());

-- reactions: 본인이 남긴 반응만 조회/쓰기
create policy "reactions_select_own" on reactions
  for select to authenticated using (user_id = auth.uid());
create policy "reactions_insert_own" on reactions
  for insert to authenticated with check (user_id = auth.uid());

-- matches: 본인이 관련된 매칭만 조회
-- insert/update(양쪽 item 상태 변경 포함)는 서버 액션에서 처리
create policy "matches_select_own" on matches
  for select to authenticated using (auth.uid() in (user_a_id, user_b_id));
create policy "matches_insert_own" on matches
  for insert to authenticated with check (auth.uid() in (user_a_id, user_b_id));
create policy "matches_update_own" on matches
  for update to authenticated using (auth.uid() in (user_a_id, user_b_id));

-- reports: 본인이 신고한 건만 조회/쓰기
create policy "reports_select_own" on reports
  for select to authenticated using (reporter_id = auth.uid());
create policy "reports_insert_own" on reports
  for insert to authenticated with check (reporter_id = auth.uid());

-- blocks: 본인이 차단한 목록만 조회/쓰기
create policy "blocks_select_own" on blocks
  for select to authenticated using (blocker_id = auth.uid());
create policy "blocks_insert_own" on blocks
  for insert to authenticated with check (blocker_id = auth.uid());
create policy "blocks_delete_own" on blocks
  for delete to authenticated using (blocker_id = auth.uid());
