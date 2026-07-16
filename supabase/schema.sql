-- 카피 길드 홈페이지 게시판 스키마 (카카오 로그인 기반)
-- 새 Supabase 프로젝트의 SQL Editor에서 실행하세요.
-- 기존에 옛 스키마(비밀번호 방식)를 쓰고 있다면 migration-001-kakao-auth.sql을 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  board_type text not null check (board_type in ('notice', 'update', 'free', 'guide', 'hunt', 'share')),
  title text not null,
  content text not null,
  nickname text not null,
  user_id uuid references auth.users (id) on delete set null,
  password_hash text,
  image_urls text[] not null default '{}',
  category text,
  views integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_board_type_created_at_idx
  on posts (board_type, created_at desc);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  nickname text not null,
  content text not null,
  user_id uuid references auth.users (id) on delete set null,
  password_hash text,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_created_at_idx
  on comments (post_id, created_at asc);

-- 공지사항/업데이트 게시판 작성 권한용 관리자 목록 (레거시)
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

-- 회원 등급 (master/submaster/staff/member/sprout)
create table if not exists members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'sprout'
    check (role in ('master', 'submaster', 'staff', 'member', 'sprout')),
  discord_user_id text,  -- 디스코드 계정 연결 (기부현황 등급 표시용)
  created_at timestamptz not null default now()
);

create unique index if not exists members_discord_user_id_key
  on members (discord_user_id)
  where discord_user_id is not null;

-- 길드 기부현황 (길드 스킬 투자 기록)
create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  nickname text not null,
  guild text not null default '카피',              -- 카피 / 카피랜드
  amount_man integer not null default 0 check (amount_man >= 0), -- 만 메소 단위
  invest_count integer not null default 1 check (invest_count >= 0),
  skill text,
  image_url text,
  note text,
  -- 디스코드에서 가져온 기록
  discord_user_id text,
  discord_name text,
  discord_message_id text,
  -- 투자 횟수를 자동 확정하지 못해 길마 확인이 필요한 기록
  needs_review boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists donations_created_at_idx on donations (created_at desc);
create index if not exists donations_user_id_idx on donations (user_id);
create index if not exists donations_guild_idx on donations (guild);

-- 같은 디스코드 메시지를 두 번 가져오지 않도록 중복 방지
create unique index if not exists donations_discord_message_id_key
  on donations (discord_message_id)
  where discord_message_id is not null;

-- 이 프로젝트의 모든 읽기/쓰기는 서버(Route Handler)가
-- SUPABASE_SERVICE_ROLE_KEY로 처리하므로 RLS를 켜서
-- 클라이언트(anon key)의 직접 접근은 막아둡니다.
alter table posts enable row level security;
alter table comments enable row level security;
alter table admins enable row level security;
alter table members enable row level security;
alter table donations enable row level security;

-- 이미지 저장용 공개 버킷 (읽기는 공개, 업로드는 서버에서만 수행)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- 관리자 등록 방법:
-- 1. 홈페이지에서 카카오 로그인을 1회 진행합니다.
-- 2. Supabase 대시보드 > Authentication > Users 에서 본인 계정의 UUID를 복사합니다.
-- 3. 아래 쿼리의 <UUID> 를 바꿔 실행합니다.
-- insert into admins (user_id, note) values ('<UUID>', '길드장');
