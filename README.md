# Capybara

친절한 카피바라씨 길드 홈페이지입니다. Next.js App Router 기반으로 구성되어 있고, npm으로 패키지를 관리하며, Tailwind CSS로 스타일을 적용합니다. 공지사항 / 업데이트 / 자유게시판 / 보스 사냥 게시판을 제공합니다.

## 기술 스택

- Next.js 15 (App Router, Route Handlers)
- React 18 / TypeScript
- Tailwind CSS 3
- Supabase (Postgres) — 게시판 데이터 저장
- bcryptjs — 게시글/댓글 비밀번호 해시

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열면 됩니다.

## 게시판 Supabase 설정 (필수)

게시판 글쓰기/조회는 Supabase DB가 있어야 동작합니다. 아래 순서로 설정해주세요.

1. [supabase.com](https://supabase.com) 에서 무료 프로젝트를 생성합니다.
2. 프로젝트의 **SQL Editor** 에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을 그대로 실행해 `posts`, `comments` 테이블을 만듭니다.
3. 프로젝트의 **Project Settings > API** 메뉴에서 `Project URL` 과 `service_role` 키를 확인합니다.
4. 루트에 `.env.local` 파일을 만들고 [`.env.example`](.env.example) 을 참고해 값을 채웁니다.
   ```
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
5. 개발 서버를 재시작하면 게시판이 정상 동작합니다.

`SUPABASE_SERVICE_ROLE_KEY` 는 서버(Route Handler)에서만 사용되며 클라이언트에 노출되지 않습니다. `.env.local` 은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

## 게시판 이용 방식

- 로그인 시스템 없이 **닉네임 + 비밀번호(4자 이상)** 로 글/댓글을 작성합니다.
- 글/댓글 수정·삭제 시 작성할 때 입력한 비밀번호를 다시 입력해야 합니다.
- 비밀번호는 bcrypt로 해시되어 저장되며, 평문으로는 저장되지 않습니다.

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
