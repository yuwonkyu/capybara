-- 디스코드 원문 채팅 내용 보관 마이그레이션
-- migration-007-donation-review.sql 실행 후 이어서 실행하세요.

-- 인증 당시 디스코드에 쓴 메시지 원문 (스크린샷만으로 헷갈릴 때 참고용)
alter table donations add column if not exists discord_content text;

-- 원본 메시지로 바로 이동할 링크를 만들기 위한 채널 ID
alter table donations add column if not exists discord_channel_id text;
