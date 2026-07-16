-- 길드 기부현황(길드 스킬 투자 기록) 마이그레이션
-- SQL Editor에서 실행하세요.

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  nickname text not null,
  -- 기부 메소 (만 메소 단위. 예: 500 = 500만 메소)
  amount_man integer not null default 0 check (amount_man >= 0),
  -- 길드 스킬 투자 횟수
  invest_count integer not null default 1 check (invest_count >= 0),
  -- 투자한 길드 스킬 이름
  skill text,
  -- 인증 스크린샷 (Supabase Storage post-images 버킷)
  image_url text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists donations_created_at_idx on donations (created_at desc);
create index if not exists donations_user_id_idx on donations (user_id);

alter table donations enable row level security;

-- 모든 읽기/쓰기는 서버(Route Handler)가 service role 키로 처리합니다.
