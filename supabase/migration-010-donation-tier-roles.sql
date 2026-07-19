-- 기부액 기반 회원 등급(카피바라/카피) 마이그레이션
-- SQL Editor에서 실행하세요.

alter table members drop constraint if exists members_role_check;

alter table members add constraint members_role_check
  check (role in ('master', 'submaster', 'staff', 'veteran', 'member', 'sprout'));

-- 참고: 등급 자동 산정 기준 (누적 투자 금액, 만 메소 단위)
--   5000만 이상 -> 카피바라(veteran)
--   1000만 이상 -> 카피(member)
--   그 외        -> 새싹(sprout)
-- 길드마스터/부마스터/STAFF는 자동 조정 대상이 아닙니다.
-- 실제 등급 재계산은 기부 등록/수정/삭제, 디스코드 동기화 시 자동으로 실행됩니다.
