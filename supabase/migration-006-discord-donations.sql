-- 디스코드 연동 기부현황 마이그레이션
-- migration-005-donations.sql 실행 후 이어서 실행하세요.

-- 길드 구분 (카피 / 카피랜드)
alter table donations
  add column if not exists guild text not null default '카피';

-- 디스코드에서 가져온 기록 정보
alter table donations add column if not exists discord_user_id text;
alter table donations add column if not exists discord_name text;
alter table donations add column if not exists discord_message_id text;

-- 같은 디스코드 메시지를 두 번 가져오지 않도록 중복 방지
create unique index if not exists donations_discord_message_id_key
  on donations (discord_message_id)
  where discord_message_id is not null;

create index if not exists donations_guild_idx on donations (guild);

-- 사이트 회원 ↔ 디스코드 계정 연결 (회원등급 표시용)
alter table members add column if not exists discord_user_id text;

create unique index if not exists members_discord_user_id_key
  on members (discord_user_id)
  where discord_user_id is not null;
