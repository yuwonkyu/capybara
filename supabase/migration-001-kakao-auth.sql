-- 카카오 로그인 전환 마이그레이션
-- 이미 schema.sql로 posts/comments 테이블을 만든 기존 프로젝트에서 실행하세요.
-- (새 프로젝트라면 이 파일 대신 schema.sql만 실행하면 됩니다.)

-- 글/댓글에 작성자(auth.users) 연결
alter table posts
  add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table comments
  add column if not exists user_id uuid references auth.users (id) on delete set null;

-- 비밀번호 방식 제거: 기존 글은 password_hash가 남아 있어도 무방
alter table posts alter column password_hash drop not null;
alter table comments alter column password_hash drop not null;

-- 공지사항/업데이트 게시판 작성 권한용 관리자 목록
create table if not exists admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- 관리자 등록 방법:
-- 1. 홈페이지에서 카카오 로그인을 1회 진행합니다.
-- 2. Supabase 대시보드 > Authentication > Users 에서 본인 계정의 UUID를 복사합니다.
-- 3. 아래 쿼리의 <UUID> 를 바꿔 실행합니다.
-- insert into admins (user_id, note) values ('<UUID>', '길드장');
