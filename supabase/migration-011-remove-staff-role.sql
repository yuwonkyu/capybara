-- STAFF 등급 제거 마이그레이션
-- SQL Editor에서 실행하세요.

-- 혹시 STAFF로 지정된 회원이 있으면 부마스터로 내린다 (관리자 권한 유지)
update members set role = 'submaster' where role = 'staff';

alter table members drop constraint if exists members_role_check;

alter table members add constraint members_role_check
  check (role in ('master', 'submaster', 'veteran', 'member', 'sprout'));
