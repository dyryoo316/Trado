-- trado 데이터베이스 스키마 + RLS
-- Supabase SQL Editor에서 전체 실행 (재실행 가능하도록 기존 테이블 삭제 후 생성)

drop table if exists reviews cascade;
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
  description text,
  image_urls text[] not null default '{}',
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
  completed_at timestamptz,
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

-- 후기
create table reviews (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  target_user_id uuid not null references profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- 테이블 권한 부여 ("Automatically expose new tables"를 꺼뒀으므로 직접 부여)
grant usage on schema public to authenticated;
grant select, insert, update, delete on profiles, items, reactions, matches, reports, blocks, reviews to authenticated;

-- RLS 활성화
alter table profiles enable row level security;
alter table items enable row level security;
alter table reactions enable row level security;
alter table matches enable row level security;
alter table reports enable row level security;
alter table blocks enable row level security;
alter table reviews enable row level security;

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

-- reviews: 작성자/대상자 모두 조회 가능, 본인이 작성한 것만 쓰기
create policy "reviews_select_related" on reviews
  for select to authenticated using (auth.uid() in (reviewer_id, target_user_id));
create policy "reviews_insert_own" on reviews
  for insert to authenticated with check (reviewer_id = auth.uid());

-- 매칭 성사 판정 (양쪽 O 상호 확인 후 matches 생성 + 두 물건 status 변경)
-- 호출자는 반드시 item_a의 소유자여야 하며, item_a -> item_b로 O 반응을
-- 미리 저장해둔 상태에서 호출한다. SECURITY DEFINER로 상대방 소유
-- item의 status까지 갱신한다 (RLS 상 본인 items만 update 가능하므로).
drop function if exists create_match_if_mutual(uuid, uuid);
create function create_match_if_mutual(p_item_a_id uuid, p_item_b_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_a uuid;
  v_user_b uuid;
  v_match_id uuid;
begin
  select owner_id into v_user_a from items where id = p_item_a_id;
  select owner_id into v_user_b from items where id = p_item_b_id;

  if v_user_a is null or v_user_b is null then
    return null;
  end if;

  if auth.uid() is distinct from v_user_a then
    raise exception '본인 물건으로만 매칭을 확정할 수 있어요';
  end if;

  if not exists (
    select 1 from reactions
    where from_item_id = p_item_b_id and to_item_id = p_item_a_id and type = 'O'
  ) then
    return null;
  end if;

  insert into matches (item_a_id, item_b_id, user_a_id, user_b_id)
  values (p_item_a_id, p_item_b_id, v_user_a, v_user_b)
  returning id into v_match_id;

  update items set status = 'matched' where id in (p_item_a_id, p_item_b_id);

  return v_match_id;
end;
$$;

grant execute on function create_match_if_mutual(uuid, uuid) to authenticated;

-- Storage: 물건 사진 버킷 (공개 읽기, 본인 폴더에만 쓰기)
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

drop policy if exists "item_images_read_public" on storage.objects;
drop policy if exists "item_images_insert_own" on storage.objects;
drop policy if exists "item_images_delete_own" on storage.objects;

create policy "item_images_read_public" on storage.objects
  for select using (bucket_id = 'item-images');
create policy "item_images_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "item_images_delete_own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
