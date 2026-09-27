# 진행 상황

flex(flex.team)의 기능을 벤치마킹한 HR SaaS 포트폴리오 프로젝트다. 과정은 블로그 시리즈 "클로드코딩과 함께 flex 만들기"로 정리한다.

> 비공식 학습용 프로젝트이며 플렉스 주식회사와 무관하다. flex의 이름, 로고, 디자인, 문구는 사용하지 않는다.


## 기술 스택

Next.js(App Router) + Tailwind + shadcn/ui(Base UI) + Supabase(Auth, Postgres + RLS, Storage, Cron)

| 패키지 | 버전 |
|---|---|
| Next.js | 16.3.6 |
| React | 19.2.8 |
| Tailwind CSS | 4.3.3 |
| shadcn CLI | 4.21.0 |
| @supabase/supabase-js | 2.117.2 |
| @supabase/ssr | 0.12.7 |
| Supabase CLI | 2.118.0 |


## 완료한 작업

| 단계 | 커밋 | 포스팅 |
|---|---|---|
| 1. 프로젝트 셋업 (Next.js, shadcn, Supabase 로컬·클라우드 연결, 첫 마이그레이션) | `4d15db1` | 1편 |
| 2. 로그인/로그아웃 화면 | `2a2dfa8` | 2편 |


## 환경

| | 로컬 | 클라우드 |
|---|---|---|
| API URL | http://127.0.0.1:54321 | https://dfsfofdkcofionmqrzaq.supabase.co |
| Studio | http://127.0.0.1:54323 | https://supabase.com/dashboard/project/dfsfofdkcofionmqrzaq |
| 메일함 | Mailpit http://127.0.0.1:54324 | 기본 SMTP (시간당 2통, 팀원 주소만) |
| 리전 | - | ap-northeast-2 (서울) |
| 환경변수 | `.env.local` | Vercel 환경변수 (배포 시) |
| 테스트 계정 | 로컬 Studio에서 생성 (`db reset` 시 삭제됨) | - |

* 개발은 로컬 DB로 한다. `.env.local`의 URL과 키는 둘 다 로컬 값이어야 한다.
* 클라우드 URL과 키는 Vercel 환경변수에만 넣는다.


## 주요 결정

| 결정 | 이유 |
|---|---|
| shadcn은 Base UI (`-b base -p nova`) | 2026-07부터 shadcn 기본값. `asChild` 대신 `render` prop을 쓴다. 나중에 바꾸기 어렵다 |
| 로컬 DB 우선 개발 | 마이그레이션을 `db reset`으로 마음껏 다시 적용하고, 완성되면 `db push --linked`로 올린다 |
| `auto_expose_new_tables = false` | 2026-05-30 이후 만든 클라우드 프로젝트는 테이블을 자동 공개하지 않는다. 로컬도 맞춰서 "로컬은 되는데 클라우드는 42501" 문제를 막는다 |
| 회원가입 화면 없음 | HR 서비스는 초대 구조다. 데모 계정은 `supabase/seed.sql`로 만든다 |
| 페이지와 Server Action에서 `getClaims()` 재확인 | proxy를 유일한 방어선으로 쓰지 않는다 (Next.js 공식 권장) |
| `security definer` 함수는 `private` 스키마에 | `public`에 두면 Data API로 호출될 수 있다 |
| Supabase CLI는 devDependency | 전역 설치 없이 `npx supabase ...`로 실행한다 |


## 마이그레이션 규칙

테이블을 만들 때는 항상 아래 네 가지를 한 마이그레이션에 함께 쓴다.

```sql
create table public.example (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  created_at timestamptz not null default now()
);

alter table public.example enable row level security;

grant select, insert, update, delete on public.example to authenticated;

create policy "example: same company can read"
on public.example for select to authenticated
using (company_id in (select private.my_company_ids()));
```

* 정책에서 `auth.uid()`는 `(select auth.uid())`로 감싼다 (행마다 재평가 방지).
* 정책에 쓰는 컬럼(`company_id` 등)에는 인덱스를 둔다.
* `private` 스키마 함수는 `security definer` + `set search_path = ''`로 만들고, 이름은 스키마까지 붙여 쓴다.
* 뷰는 `security_invoker = true`로 만든다 (기본값은 RLS를 우회한다).


## 자주 쓰는 명령

```bash
npm run dev
npm run lint
npm run build                       # 결과에 ƒ Proxy (Middleware)가 보여야 한다

npx supabase start                  # Docker Desktop 먼저 실행
npx supabase status                 # 로컬 URL, 키 확인
npx supabase migration new <이름>
npx supabase db reset               # 로컬만 초기화 + 마이그레이션·시드 적용
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts

npx supabase db push --linked --dry-run
npx supabase db push --linked
npx supabase migration list --linked
```


## ⛔ 실행 금지

* `npx supabase config push`: 로컬 site_url(127.0.0.1)이 클라우드 인증 설정을 덮어쓰고 이메일 인증이 꺼진다.
* `npx supabase db reset --linked`: 클라우드 DB를 전부 지운다.
* `npx supabase db push --include-seed`: 시드 데이터가 운영 DB에 들어간다.
* `npx supabase projects api-keys --reveal`: secret 키가 화면에 그대로 출력된다.
* secret 키(`sb_secret_...`)에 `NEXT_PUBLIC_`을 붙이는 것: RLS를 우회하는 키가 브라우저에 노출된다.


## 겪은 함정

* shadcn init 후 폰트가 적용되지 않는다 → `layout.tsx`에서 `variable: "--font-sans"`로 바꾼다.
* `shadcn add sidebar` 후 `use-mobile.ts`에서 lint가 실패한다 → `// eslint-disable-next-line react-hooks/set-state-in-effect`를 넣는다.
* `proxy.ts`를 루트에 두면 인식되지 않는다 → `src/proxy.ts`에 둔다.
* `config.toml`에서 `#`을 남기면 주석이라 적용되지 않는다.
* `supabase link --project-ref`에는 프로젝트 이름이 아니라 20자 ref를 넣는다.
* 로컬 URL에 클라우드 키를 넣으면 인증이 실패한다.
* 클라우드 대시보드에서 만든 계정으로는 로컬 앱에 로그인할 수 없다.
* SQL은 터미널이 아니라 마이그레이션 파일에 쓴다.
* Docker Desktop이 꺼져 있으면 `supabase start`가 `docker.sock` 에러를 낸다.


## 다음 할 일

### 3. 회사(테넌트)·역할 분리

- [ ] `companies`, `memberships(user_id, company_id, role)` 마이그레이션 (role: owner / admin / manager / employee)
- [ ] `private` 스키마에 RLS 헬퍼 함수 (`my_company_ids()`, `has_role()` 등)
- [ ] `supabase/seed.sql`: 회사 2개 × 역할별 데모 계정
- [ ] 계정을 바꿔 로그인하며 회사별로 데이터가 격리되는지 확인
- [ ] pgTAP으로 권한 매트릭스 테스트 (`npx supabase test db`)
- [ ] 역할에 따라 사이드바 메뉴를 다르게 보여 주기

### 이후

- [ ] 구성원 목록과 상세
- [ ] 휴가 신청과 승인 (결재 상태머신, 연차 원장)
- [ ] 출퇴근 기록
- [ ] 캘린더, 인사이트 대시보드


## 배포 전 체크리스트

- [ ] Vercel 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Production, Preview). 바꾸면 재배포한다
- [ ] Vercel 함수 리전을 `icn1`(서울)로 맞춘다
- [ ] Vercel Marketplace의 Supabase 연동은 쓰지 않는다 (기존 프로젝트를 연결할 수 없다)
- [ ] Supabase Auth → URL Configuration: Site URL과 Redirect URLs에 Vercel 주소를 넣는다
- [ ] 클라우드는 Confirm email이 기본으로 켜져 있다. 데모 방식에 맞게 정한다
- [ ] 외부 주소로 메일을 보내려면 커스텀 SMTP를 설정한다
- [ ] 무료 플랜은 7일 동안 활동이 없으면 일시정지된다. 외부 keep-alive를 두거나 제출 전에 확인한다
- [ ] 데모에는 가짜 데이터만 쓴다 (주민번호 등 실제 개인정보 금지)
