# Capybara

친절한 카피바라씨 길드 홈페이지입니다. Next.js App Router 기반으로 구성되어 있고, npm으로 패키지를 관리하며, Tailwind CSS로 스타일을 적용합니다. 공지사항 / 업데이트 / 자유게시판 / 공략 / 사냥 / 나눔 게시판을 제공합니다.

## 기술 스택

- Next.js 15 (App Router, Route Handlers)
- React 18 / TypeScript
- Tailwind CSS 3
- Supabase (Postgres + Auth) — 게시판 데이터 저장, 카카오 로그인

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열면 됩니다.

## 게시판 Supabase 설정 (필수)

게시판 글쓰기/조회는 Supabase DB가 있어야 동작합니다. 아래 순서로 설정해주세요.

1. [supabase.com](https://supabase.com) 에서 무료 프로젝트를 생성합니다.
2. 프로젝트의 **SQL Editor** 에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을 그대로 실행해 `posts`, `comments`, `admins` 테이블과 이미지 버킷을 만듭니다.
   - 이미 이전 버전 스키마를 쓰고 있다면 대신 마이그레이션 파일을 순서대로 실행합니다: [`migration-001-kakao-auth.sql`](supabase/migration-001-kakao-auth.sql)(비밀번호 방식에서 전환), [`migration-002-boards-images.sql`](supabase/migration-002-boards-images.sql)(게시판 개편 + 이미지 첨부).
3. 프로젝트의 **Project Settings > API** 메뉴에서 `Project URL`, `anon(public)` 키, `service_role` 키를 확인합니다.
4. 루트에 `.env.local` 파일을 만들고 [`.env.example`](.env.example) 을 참고해 값을 채웁니다.
   ```
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. 개발 서버를 재시작하면 게시판이 정상 동작합니다. Vercel에 배포한 경우 Vercel 프로젝트의 **Settings > Environment Variables** 에도 같은 4개 값을 넣고 재배포해야 합니다.

`SUPABASE_SERVICE_ROLE_KEY` 는 서버(Route Handler)에서만 사용되며 클라이언트에 노출되지 않습니다. `.env.local` 은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

## 카카오 로그인 설정 (필수)

글/댓글 작성은 카카오 로그인이 필요합니다. Supabase Auth의 카카오 프로바이더를 사용합니다.

1. [developers.kakao.com](https://developers.kakao.com) 에 로그인하고 **내 애플리케이션 > 애플리케이션 추가하기** 로 앱을 만듭니다.
2. **[앱] > [플랫폼 키]** 에서 `REST API 키` 를 복사해둡니다.
3. **카카오 로그인** 을 활성화(ON)합니다.
4. **[앱] > [플랫폼 키] > [REST API 키] > [리다이렉트 URI]** 에 아래 주소를 등록합니다. (개편된 콘솔 기준 — 카카오 로그인 메뉴에는 로그아웃 리다이렉트만 있습니다)
   ```
   https://<Supabase프로젝트ID>.supabase.co/auth/v1/callback
   ```
   (Supabase 대시보드 > Authentication > Providers > Kakao 화면에 나오는 Callback URL을 그대로 복사하면 됩니다.)
5. **동의항목** 에서 `닉네임` 을 필수 동의로 설정합니다. 동의 목적에는 "게시판 글/댓글 작성자 닉네임 표시 및 사용자 식별" 정도로 적으면 됩니다. (프로필 사진은 선택)
6. **카카오 로그인 > 보안** 에서 `Client Secret` 을 생성하고 활성화합니다.
6. Supabase 대시보드 > **Authentication > Providers > Kakao** 를 켜고, 카카오의 `REST API 키` 와 `Client Secret` 을 입력해 저장합니다.
7. Supabase 대시보드 > **Authentication > URL Configuration** 에서
   - `Site URL` 을 배포 주소(예: `https://capyguild.vercel.app`)로 설정하고,
   - `Redirect URLs` 에 `http://localhost:3000/**` 와 배포 주소(`https://capyguild.vercel.app/**`)를 추가합니다.

### 관리자(공지/업데이트 작성 권한) 등록

공지사항·업데이트 게시판은 `admins` 테이블에 등록된 계정만 글을 쓸 수 있습니다.

1. 홈페이지에서 카카오 로그인을 1회 진행합니다.
2. Supabase 대시보드 > **Authentication > Users** 에서 본인 계정의 `UID` 를 복사합니다.
3. **SQL Editor** 에서 실행합니다:
   ```sql
   insert into admins (user_id, note) values ('<복사한 UID>', '길드장');
   ```

## 게시판 이용 방식

- 글 목록(제목·작성자·날짜)은 누구나 볼 수 있지만, **글 내용과 댓글은 로그인한 회원만** 볼 수 있습니다.
- **카카오 로그인** 후 글/댓글을 작성하며, 카카오 프로필 닉네임이 작성자명으로 표시됩니다.
- 글 수정은 본인만, 글/댓글 삭제는 본인 또는 관리자만 할 수 있습니다.
- 공지사항 게시판 글쓰기는 관리자(길드마스터·부마스터·STAFF) 전용입니다. 자유게시판·공략·사냥·거래 게시판은 로그인한 누구나 쓸 수 있습니다.
- 업데이트는 내부 게시판이 아니라 [메이플 플래닛 공식 업데이트 게시판](https://mapleplanet.co.kr/board/update)으로 바로 연결되는 외부 링크입니다. (글쓰기 없음)
- 거래 게시판은 글마다 말머리(나눔·요청·판매)를 붙입니다.
- 본문에 이미지를 원하는 위치(커서)에 삽입할 수 있고, 링크는 자동으로 하이퍼링크가 됩니다. 이미지는 클릭하면 큰 화면(모달)으로 볼 수 있어요.
- 최근 1주일 이내 게시글은 목록에서 제목 앞에 ✨ 표시가 붙습니다.

### 길드 기부현황 (디스코드 연동)

- `/donations` 에서 길드 스킬 투자(기부) 기록을 관리합니다. **로그인한 회원만** 볼 수 있습니다.
- **카피 / 카피랜드** 두 길드를 탭으로 나눠 각각 집계합니다.
- 길드 스킬 투자 **1회 = 500만 메소**로 고정 계산됩니다.
- 길마용 **집계 표(아이디 / 투자횟수 / 회원등급)** 와 **엑셀(CSV) 다운로드**를 제공합니다.
- 기부 기록 삭제는 본인 또는 관리자만 가능합니다.

#### 디스코드 자동 수집 설정

길드원이 디스코드 투자 채널에 `!투자 2` + 인증샷을 올리면, 관리자가 `디스코드 동기화` 버튼을 눌러 가져옵니다.

1. [Discord Developer Portal](https://discord.com/developers/applications) 에서 **New Application** → 좌측 **Bot** 메뉴로 이동합니다.
2. **Privileged Gateway Intents** 에서 **MESSAGE CONTENT INTENT** 를 켭니다. (봇이 100개 미만 서버에 있으면 심사 없이 바로 사용 가능)
3. **Reset Token** 으로 봇 토큰을 발급받아 복사합니다. (토큰은 절대 공개 저장소에 올리지 마세요)
4. **OAuth2 → URL Generator** 에서 `bot` 스코프 + `View Channels`, `Read Message History` 권한을 선택해 나온 URL로 봇을 길드 서버에 초대합니다.
5. 디스코드에서 **설정 → 고급 → 개발자 모드** 를 켠 뒤, 투자 채널을 우클릭 → **ID 복사** 로 채널 ID를 확인합니다. (서버 아이콘 우클릭 → ID 복사 = 서버 ID)
6. Vercel 프로젝트 **Settings → Environment Variables** 에 아래 값을 추가하고 재배포합니다.

```
DISCORD_BOT_TOKEN=봇 토큰
DISCORD_GUILD_ID=디스코드 서버 ID        # 서버 닉네임(예: 전태영/저격수/104) 표시용
DISCORD_CHANNEL_CAPY=카피-길드-투자자 채널 ID
DISCORD_CHANNEL_CAPYLAND=카피랜드-길드-투자자 채널 ID
```

**인증 양식**: 메시지에 `!투자 2` (또는 `투자 2회`)를 포함하고 인증샷을 첨부합니다.

동기화는 아래 순서로 투자 횟수를 판단합니다.

1. `!투자 2` 양식이 있으면 → **그대로 확정**
2. 양식은 없지만 인증샷 + 금액 표현이 있으면 (`천만원 투자했습니다` 등) → **추측 후 `확인필요` 표시** (1회 = 500만 기준)
3. 인증샷만 있고 숫자가 없으면 → **0회 + `확인필요` 표시**
4. 인증샷도 양식도 없는 잡담 → **무시**

`확인필요` 기록은 목록에서 노란색으로 표시되고, 관리자는 인증샷을 보면서 **투자 횟수를 바로 입력해 수정**할 수 있습니다. 덕분에 봇 도입 이전의 과거 인증 내역도 한 번에 가져와 정리할 수 있습니다.

- 같은 메시지는 중복 저장되지 않습니다(메시지 ID로 판별).
- 디스코드 첨부 이미지는 URL이 만료되므로 **Supabase Storage로 복사해 영구 보관**합니다.
- 회원등급을 표에 표시하려면 `members.discord_user_id` 에 해당 회원의 디스코드 사용자 ID를 넣어 사이트 계정과 연결해야 합니다. 연결 전에는 `미연동`으로 표시됩니다.

### 회원 등급 & 관리자 페이지

- 회원 등급은 길드마스터 · 부마스터 · STAFF · 친절한카피 · 새싹 5단계입니다. 로그인하면 자동으로 새싹으로 등록됩니다.
- 관리자 권한(공지 작성·글 관리)은 길드마스터·부마스터·STAFF가 가집니다.
- **길드마스터**는 헤더의 `관리자` 버튼(`/admin`)에서 전체 길드원 목록을 보고 등급 변경·추방을 할 수 있습니다.
- 게시글에 이미지를 최대 5장(장당 5MB, PNG/JPG/GIF/WEBP)까지 첨부할 수 있습니다. 이미지는 Supabase Storage의 `post-images` 공개 버킷에 저장됩니다.
- 카카오 로그인 도입 전(닉네임+비밀번호 방식)에 작성된 글은 그대로 보이지만, 관리자만 삭제할 수 있습니다.

## 카카오톡 오픈채팅 연동 관련 안내

카카오는 오픈채팅(자유채팅/공지방) 메시지를 외부에서 읽고 쓰는 공식 API를 제공하지 않습니다. 그래서 이 홈페이지의 게시판과 카카오톡 오픈채팅은 **자동으로 연동되지 않습니다.** 대신 헤더/홈 화면에 오픈채팅 바로가기 링크를 두었으니, 공지사항 게시판에 글을 올린 뒤 카톡 공지방에도 같은 내용을 수동으로 공유하는 방식을 권장합니다. (참고: 카카오톡 "채널"(비즈니스 채널)은 별도의 메시지 발송 API가 있지만, 오픈채팅과는 다른 별개 기능입니다.)

## 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드 생성
- `npm run start`: 빌드된 앱 실행
- `npm run lint`: ESLint 검사

## 프로젝트 구조

- `app/`: App Router 페이지, API 라우트, 전역 스타일
  - `app/board/[type]`: 게시판 목록/글쓰기/상세/수정 페이지 (`notice`, `update`, `free`, `boss`)
  - `app/api/posts`, `app/api/comments`: 게시글/댓글 API
- `components/`: 헤더/푸터/게시판 UI 컴포넌트
- `lib/`: Supabase 클라이언트, 타입, 게시판/외부 링크 설정
- `supabase/schema.sql`: 게시판 DB 스키마
- `tailwind.config.ts`: Tailwind 설정 (아이보리 + 블루/그린 파스텔 테마)
- `package.json`: 의존성과 스크립트
