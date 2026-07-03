-- 게시판 개편(공략/사냥/나눔) + 이미지 첨부 마이그레이션
-- 이미 schema.sql을 실행한 프로젝트의 SQL Editor에서 실행하세요.

-- 게시판 종류 변경: free/boss -> guide/hunt/share
alter table posts drop constraint if exists posts_board_type_check;

update posts set board_type = 'hunt' where board_type = 'boss';
update posts set board_type = 'share' where board_type = 'free';

alter table posts add constraint posts_board_type_check
  check (board_type in ('notice', 'update', 'guide', 'hunt', 'share'));

-- 게시글 이미지 첨부
alter table posts
  add column if not exists image_urls text[] not null default '{}';

-- 이미지 저장용 공개 버킷 (읽기는 공개, 업로드는 서버에서만 수행)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;
