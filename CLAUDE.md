# 🌪️ trado — 중고물품 랜덤 교환 매칭

> trado = trade + tornado. 안 쓰는 물건이 토네이도처럼 휘몰아쳐 섞이고, 원하는 물건과 교환된다.
>
> 팔리지 않는 물건을 돈으로 바꾸는 대신, 내가 원하는 물건으로 바꿔보면 어떨까?

## 프로젝트 개요

- **목표:** 1일 해커톤 MVP. 오늘 16:00까지 Vercel에 배포된 URL을 제출해야 한다.
- **원칙:** 완성도보다 범위를 좁혀 끝까지 배포하는 것이 우선이다. 기능이 적어도 배포되어 동작하면 성공이다.
- **문제:** 중고물품을 정리하려는 사람이 중고거래 앱에 올려도 팔리지 않거나, 가격 흥정이 번거로워 물건을 방치한다.
- **해결:** 돈이 아니라 물건끼리 교환한다. 상대 물건에 X / + / O로 반응하고, O를 누르면 바로 교환이 성사된다.

## 기술 스택

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (DB + Auth), `@supabase/ssr` 사용
- Vercel 배포
- 환경 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 작업 규칙 (반드시 지킬 것)

1. **아래 "만들지 않는 기능"은 절대 추가하지 않는다.** 필요해 보여도 먼저 물어본다.
2. 커밋/푸시 전에 반드시 `npm run build`를 실행해 타입 오류와 빌드 오류가 없는지 확인한다.
3. 새 라이브러리는 꼭 필요할 때만 추가하고, 추가 전에 알린다.
4. 물건 사진은 이모지를 기본으로 하되, Supabase Storage를 이용한 이미지 업로드(최대 4장)를 추가로 지원한다. 사진이 없으면 이모지가 목록 썸네일로 보인다.
5. 모바일 우선 UI: 전체 화면을 `max-w-md mx-auto`로 감싸 390px 폭 기준으로 만든다. 데스크톱에서도 가운데 모바일 화면처럼 보이게 한다.
6. 디자인은 아래 "디자인 시스템"을 따른다. Claude Design 시안이 제공되면 그 시안을 우선한다.
7. 한 단계가 끝날 때마다 동작을 확인하고 다음 단계로 넘어간다. 여러 단계를 한 번에 만들지 않는다.

## 디자인 시스템

- Claude Design 프로토타입(`Trado 디자인/`) 반영. 라이트 테마. 컬러 토큰은 Tailwind 설정 또는 CSS 변수로 정의해서 사용한다.

| 토큰 | 값 | 용도 |
|---|---|---|
| page | `#EDEFF2` | 데스크톱에서 모바일 프레임 바깥 배경 |
| surface | `#FFFFFF` | 카드, 화면 배경 |
| muted | `#F4F5F7` | 입력창, 보조 버튼, 리스트 칩 배경 |
| soft-accent | `#E7ECF3` | 안내 배너, 선택된 라벨 배경 |
| accent | `#7792B5` | 주요 CTA, 활성 탭, O 버튼, 선택 테두리 |
| accent-strong | `#5C7299` | 링크, 강조 텍스트 |
| text | `#1A1A1A` | 기본 텍스트 |
| subtext | `#8A8F98` | 보조 텍스트 |
| faint | `#B4B8BF` | placeholder, 비활성 텍스트 |
| border | `#EDEEF0` | 구분선, 비선택 테두리 |
| danger | `#E4574B` | 차단 등 위험 텍스트 |
| danger-soft | `#FDEDED` | X 버튼 배경 |
| notify | `#FF5C5C` | 알림 배지 점 |
| star | `#F5B400` | 후기 별점 |

- 소용돌이 그래디언트(accent 계열 conic-gradient)는 로고와 매칭 성공 화면에만 쓴다.
- 폰트: Pretendard(jsDelivr CDN) 하나로 통일한다 (로고 포함, 별도 display 폰트 없음).
- 로고: 소문자 `trado`
- 모서리 16 ~ 24px, 액션 버튼은 원형, 매칭 카드 더미는 -2~2도 기울여 쌓는다.
- 모션: 카드가 회전하며 들어오고, X를 누르면 회전하며 옆으로 날아간다. 매칭 성공 시 두 물건이 자리를 바꾸는 애니메이션. CSS transition/keyframes로만 구현한다.
- 문구: 매칭 시작 "토네이도 돌리기 🌪️", 성공 "trado 성사!", 빈 상태 "지금은 바람이 잠잠해요", 알림 "🌪️ 새 trado가 성사됐어요!"

## 기능 범위

### 핵심 기능 (먼저 완성)

- 회원가입 / 로그인 (이메일 + 비밀번호 + 닉네임)
- 내 물건 등록
- X / + / O 랜덤 교환 매칭
- 매칭 성공 화면

### 추가 기능 (핵심 기능 배포 후)

- 앱 안 매칭 알림 (토스트 + 종 아이콘 배지)
- 신고 / 차단
- 거래 방법 선택 화면 (직거래 / 택배)
- 마이페이지
- 별점 후기 (교환 완료 후 상대에게 별점 1~5 + 텍스트 후기)

### 만들지 않는 기능

실제 결제 연동, 배송 연동, 위치 인증, 실시간 채팅(매칭 화면 내 메모/메시지 전송 포함), AI 추천, 가격 평가, 이메일 인증, 브라우저 푸시 알림, 배지/뱃지 시스템, 관리자 화면

## 버튼 3개의 의미

| 버튼 | 의미 | 동작 |
|---|---|---|
| ❌ X | 관심 없음 | 반응 저장 후 다른 사용자의 물건으로 넘어감 |
| ➕ + | 다른 물건 요청 | 반응 저장 후 **같은 사용자의 다른 물건**을 보여줌. 없으면 "이 사용자의 다른 물건이 없어요" 토스트 후 다음 물건으로 |
| ⭕ O | 교환 희망 | 반응 저장 후 바로 매칭 성사 (상호 확인 없음) |

## 데이터베이스

```sql
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
```

**Storage:** `item-images` 공개 버킷(사용자 폴더 `{user_id}/...`에만 본인이 쓰기 가능, 읽기는 공개).

**RLS:** 모든 테이블에 RLS를 켜고, 로그인한 사용자는 `profiles`, `items` 전체 조회 가능, 나머지는 본인 관련 행만 조회 가능하게 한다. 쓰기는 본인 행만 허용한다. 매칭 성사처럼 두 사용자에게 걸친 처리는 서버 액션에서 수행한다.

## 핵심 로직

### 매칭 후보 조회

사용자가 선택한 내 물건 A 기준으로 아래 조건을 모두 만족하는 물건 중 하나를 랜덤으로 보여준다.

- 내 물건이 아님 (`owner_id != 나`)
- `status = 'available'`
- A로 이미 반응한 적 없음 (`reactions`에 A → 해당 물건 없음)
- 내가 차단했거나 나를 차단한 사용자의 물건이 아님

(카테고리/원하는 카테고리 일치는 후보 조회 조건에서 제외했다 — 해커톤 시연 중 후보가
너무 쉽게 안 뜨는 문제가 있어 범위를 넓혔다. `wanted_categories` 컬럼과 등록 화면의
입력 필드는 남겨두되, 매칭 후보 필터링에는 더 이상 쓰지 않는다.)

후보가 없으면 "지금은 교환할 물건이 없어요" 빈 상태 화면을 보여준다.

### 매칭 성사 판정 (O를 눌렀을 때)

1. `reactions`에 A → B, type O 저장 (클라이언트에서 본인 반응이라 RLS 통과)
2. 서버 액션에서 Postgres 함수 `create_match_if_mutual(item_a_id, item_b_id)` 호출 — 상대방 소유 물건의 status까지 바꿔야 해서 SECURITY DEFINER 함수로 처리한다 (호출자가 item_a 소유자인지 내부에서 검증)
3. 함수는 상호 확인 없이 바로 `matches`를 생성하고 A, B `status`를 `matched`로 변경, match id를 반환 → 매칭 성공 화면으로 이동 (단, 둘 중 하나라도 이미 `matched` 상태면 아무 것도 하지 않고 null 반환 — 중복 클릭 방지)

### 앱 안 알림

- 공통 레이아웃에서 로그인 사용자의 `matches` 중 `seen_by_a/b = false`인 것이 있으면 상단에 "🌪️ 새 trado가 성사됐어요!" 토스트와 홈의 종 아이콘 배지를 표시한다. 종 아이콘을 누르면 마이페이지의 교환 목록으로 이동한다. 알림 목록 화면은 만들지 않는다.
- 매칭 성공 화면이나 마이페이지에서 해당 매칭을 보면 `seen` 값을 true로 바꾼다.
- 시간이 남으면 Supabase Realtime으로 실시간 표시를 추가한다 (선택).

### 신고 / 차단

- 매칭 카드 오른쪽 위 ⋯ 메뉴를 누르면 하단 시트 하나에 신고하기 / 차단하기가 함께 뜬다.
- 신고: 사유 선택 모달 → `reports`에 저장 → "신고가 접수되었어요" 토스트 → 다음 물건
- 차단: 확인 후 `blocks`에 저장 → 이후 매칭 후보에서 제외 → 다음 물건

## 화면과 라우트

| 라우트 | 화면 | 내용 |
|---|---|---|
| `/login` | 로그인 / 회원가입 | 상단 탭으로 전환. 이메일, 비밀번호, 닉네임(가입 탭만) |
| `/` | 홈 | 로고, 알림 종 아이콘(배지), 내 물건 가로 스크롤, [토네이도 돌리기 🌪️], [+ 물건 등록] |
| `/items/new` | 물건 등록 | 이모지, 이름, 카테고리, 상태, 원하는 카테고리(복수), [등록하기] |
| `/match` | 매칭 ⭐ | 상단 "내 물건: 🧸 곰 인형으로 교환 중"(변경 가능), 큰 상대 물건 카드, X / + / O 버튼 |
| `/match/success/[id]` | 매칭 성공 | 소용돌이 배경, trado 성사!, 내 물건 ⇄ 상대 물건, [거래 방법 정하기] |
| `/trade/[matchId]` | 거래 방법 선택 | 직거래(희망 장소, 시간) / 택배(주소) → `matches.trade_method`, `trade_detail`에 저장 |
| `/mypage` | 마이페이지 | 내 물건, 진행중/완료된 교환(거래 방법 포함), 후기 쓰기 진입점, 로그아웃 |
| `/matches/[matchId]/review` | 후기 작성 | 별점(1~5) + 텍스트 → `reviews`에 저장 |

- 로그인하지 않은 사용자는 `/login`으로 보낸다.
- 하단 탭바: 홈 / 매칭 / 마이
- 위 8개 화면 외에 스플래시, 온보딩, 알림 목록, 배지 등은 만들지 않는다.

## 만드는 순서

각 단계가 끝나면 `npm run build` 확인 후 커밋하고 Vercel에 배포한다.

1. **세팅:** Supabase 클라이언트 설정, 레이아웃(모바일 프레임 + 하단 탭바), 빈 홈 화면 → **첫 배포**
2. **회원가입 / 로그인:** 가입 시 `profiles`에 닉네임 저장, 로그인 보호
3. **물건 등록:** 등록 폼 + 마이페이지에 내 물건 목록
4. **매칭 화면:** 후보 조회, X / + / O 반응 저장
5. **매칭 성사:** 상호 O 판정, 매칭 성공 화면 → **여기까지가 핵심. 반드시 배포**
6. **앱 안 알림:** 토스트 + 배지
7. **신고 / 차단**
8. **거래 방법 선택**
9. **마이페이지 정리:** 성사된 교환 목록
10. **후기 작성:** 별점 + 텍스트

14:30 기준으로 끝나지 않은 추가 기능은 빼고 배포 안정화와 시연 준비에 집중한다.

## Supabase 설정 체크

- Authentication → Providers → Email에서 **Confirm email 끄기** (시연 중 인증 메일 대기 방지)
- Vercel 프로젝트에 환경 변수 2개 등록 후 **재배포**

## 시드 데이터

1. Supabase 대시보드에서 시연용 계정을 만든다: `me@test.com`(시연자), `user1~4@test.com`(샘플 사용자)
2. 샘플 사용자 계정으로 물건 20~30개를 SQL로 넣는다. 카테고리가 고르게 섞이게 하고, 한 사용자당 물건 3개 이상을 넣어 + 버튼이 동작하게 한다.
3. 실제 브랜드 대신 일반 이름을 쓴다 (예: 곰 인형, 소설책 세트, 무선 키보드, 니트 가디건, 머그컵).
4. 시연 성공을 위해 샘플 사용자의 "📚 소설책 세트"가 시연자의 "🧸 곰 인형"에 **미리 O를 누른 상태**로 넣어둔다. 시드 스크립트는 `supabase/seed.sql`로 저장한다.

## 시연 시나리오 (4분)

> "사용자가 안 쓰는 곰 인형을 등록하고, 원하는 책 세트와 교환 매칭이 성사되는 과정을 보여드리겠습니다."

1. `me@test.com`으로 로그인 → 홈
2. 물건 등록: 🧸 곰 인형, 원하는 카테고리 도서·생활용품
3. 매칭 화면: 첫 물건에 X → 다음 물건에 + (같은 사용자의 다른 물건 표시)
4. ⋯ 메뉴에서 차단 기능 짧게 보여주기
5. 📚 소설책 세트에 O → 매칭 성공 + 알림 토스트
6. 거래 방법 선택: 직거래, 장소 입력 후 확정
7. 마이페이지에서 성사된 교환 확인

시연 경로는 제출 전 배포 URL에서 직접 리허설하고 화면 녹화로 저장해둔다. 리허설 후 시드 데이터를 초기화할 수 있도록 `seed.sql`은 기존 데이터를 지우고 다시 넣을 수 있게 작성한다.