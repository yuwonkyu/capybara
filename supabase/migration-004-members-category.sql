-- 회원 등급(members) + 거래 게시판 말머리(category) 마이그레이션
-- SQL Editor에서 실행하세요.

-- 1) 거래 게시판 말머리
alter table posts add column if not exists category text;

-- 2) 회원 등급 테이블
create table if not exists members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'sprout'
    check (role in ('master', 'submaster', 'staff', 'member', 'sprout')),
  created_at timestamptz not null default now()
);

alter table members enable row level security;

-- 3) 기존 admins 테이블에 등록된 계정을 길드마스터로 승격
insert into members (user_id, role)
select user_id, 'master' from admins
on conflict (user_id) do update set role = 'master';

-- 참고:
-- - 관리자 권한(공지 작성/글 관리): master, submaster, staff
-- - 관리자 페이지(회원 관리) 접근: master(길드마스터)만 가능
-- - 로그인하면 자동으로 'sprout'(새싹)으로 등록되고, 관리자 페이지에서 등급을 조정합니다.
-- - 기존 admins 테이블은 더 이상 사용하지 않지만, 안전을 위해 남겨둡니다.
