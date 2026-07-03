-- 카피 길드 홈페이지 게시판 스키마
-- Supabase 프로젝트의 SQL Editor에서 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  board_type text not null check (board_type in ('notice', 'update', 'free', 'boss')),
  title text not null,
  content text not null,
  nickname text not null,
  password_hash text not null,
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
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_created_at_idx
  on comments (post_id, created_at asc);

-- 이 프로젝트의 모든 읽기/쓰기는 서버(Route Handler)가
-- SUPABASE_SERVICE_ROLE_KEY로 처리하므로 RLS를 켜서
-- 클라이언트(anon key)의 직접 접근은 막아둡니다.
alter table posts enable row level security;
alter table comments enable row level security;
