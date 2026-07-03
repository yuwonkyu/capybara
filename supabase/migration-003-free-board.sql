-- 자유게시판(free) 추가 마이그레이션
-- SQL Editor에서 실행하세요.

alter table posts drop constraint if exists posts_board_type_check;

alter table posts add constraint posts_board_type_check
  check (board_type in ('notice', 'update', 'free', 'guide', 'hunt', 'share'));
