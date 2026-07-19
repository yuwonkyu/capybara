-- 게시판 통합 마이그레이션
-- 공략(guide)·파티(hunt)·거래(share) 게시판을 게시판(free)의 말머리로 합칩니다.
-- SQL Editor에서 실행하세요.

-- 1) 기존 글을 free 게시판으로 옮기면서 말머리(category)를 지정한다.
update posts set board_type = 'free', category = '공략' where board_type = 'guide';
update posts set board_type = 'free', category = '파티' where board_type = 'hunt';
update posts set board_type = 'free', category = '거래' where board_type = 'share';

-- 2) 말머리가 없던 기존 자유게시판 글은 '자유'로 채운다.
update posts set category = '자유'
where board_type = 'free' and (category is null or category = '');

-- 참고: board_type 체크 제약은 그대로 두어도 무방합니다.
-- (더 이상 guide/hunt/share 로 새 글이 생기지 않습니다.)
