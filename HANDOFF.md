# HANDOFF (PC 이전용)

## 0) 프로젝트 경로
- 현재 기준: `C:\dev\schedule_2`

## 1) 다른 PC로 옮길 때
1. 이 폴더 전체를 복사하거나 git으로 push/pull
2. 새 PC에서 같은 경로(또는 원하는 경로)에 체크아웃
3. 의존성 설치: `npm install`
4. 환경변수 준비: `.env.local`에 `DATABASE_URL` 설정
5. 마이그레이션 실행: `npm run db:migrate`
6. 안정 확인용 서버 실행: `npm run build && PORT=3000 npm run start`
7. 개발 중 수정용 서버 실행: `npm run dev -- --hostname 0.0.0.0 --port 3000`
8. 접속: `http://127.0.0.1:3000` 또는 원격 접속 시 `http://<server-ip>:3000`
9. 원격에서 바로 붙을 때는 호스트 바인딩이 `0.0.0.0`으로 열려 있어야 함

## 2) 반드시 같이 옮길 파일
- `docs/agents/*` (에이전트 규칙)
- `docs/agents/task-template.md` (지시 템플릿)
- `requirements.md`
- `prd-v1.md`, `backlog-v1.md`
- `briefing-prd.md`, `briefing-design.md`
- `api-spec.md`

## 3) 현재 구현 상태 요약
- Home / Calendar / Briefing 3분 구조
- 캘린더 UI + 모달 CRUD
- `/api/events` 기반 데이터 연동
- PostgreSQL + SQL migration 기반 일정 저장소
- `Home`은 오늘 요약과 빠른 이동 중심
- `Calendar`는 검색/필터 + 월간 캘린더 작업면 중심
- `Briefing`은 우선순위와 집중 블록 요약 전용 페이지(`/briefing`)
- 로딩/에러/재시도/empty 상태 포함
- 다크모드 포함

## 4) 최근 중요 이슈 및 해결
- `React.Children.only expected ...` 런타임 에러 해결
- 원인: `Button asChild`에서 다중 child 전달
- 조치: `components/ui/button.tsx`에서 `asChild` 경로 분리
- Next.js `dev` 환경에서 CSS 자산이 불안정하게 404 될 수 있음
- UI 시각 확인은 `npm run build && npm run start` 기준이 더 안정적임
- 수정 모달은 작은 높이 뷰포트에서 하단 CTA 잘림 리스크가 남아 있어 QA가 계속 필요함

## 5) 다음 작업 권장 순서
1. 일정 수정 모달의 무스크롤 레이아웃 재설계
2. 반복 일정 + 예외 날짜
3. 알림 기능
4. 검색/필터 고도화 후속 polish

## 6) Codex에서 세션 복원 시 첫 프롬프트 예시
"이 저장소의 `docs/agents/README.md`와 `docs/agents/task-template.md`, `docs/agents/codex-manager.md`를 먼저 읽고, 관리자 역할로 고정 팀(Kuhn/Bacon/Beauvoir/Dirac/Shannon/Turing)에게 먼저 작업을 배정해줘. 서버 패키지 설치나 포트 확인은 Shannon에게 맡기고, UI 확인은 `npm run build && PORT=3000 npm run start` 기준으로 `/`, `/calendar`, `/briefing`와 CSS 자산 응답까지 확인해줘."

## 7) 참고
- 에이전트 ID/세션 상태는 PC/세션이 바뀌면 유지되지 않을 수 있음
- 따라서 역할 문서 기반으로 에이전트를 재생성/재지시하면 동일 방식으로 이어갈 수 있음
