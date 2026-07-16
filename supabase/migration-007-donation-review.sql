-- 과거 디스코드 내역 가져오기용 마이그레이션
-- migration-006-discord-donations.sql 실행 후 이어서 실행하세요.

-- 투자 횟수를 자동으로 확정하지 못한 기록(스크린샷만 있거나 금액을 추측한 경우)
-- 길마가 확인 후 횟수를 수정하도록 표시한다.
alter table donations
  add column if not exists needs_review boolean not null default false;

create index if not exists donations_needs_review_idx
  on donations (needs_review) where needs_review = true;
