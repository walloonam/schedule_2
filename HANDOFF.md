# HANDOFF (PC 이전용)

## 0) 프로젝트 경로
- 현재 기준: `C:\dev\schedule_2`

## 1) 다른 PC로 옮길 때
1. 이 폴더 전체를 복사하거나 git으로 push/pull
2. 새 PC에서 같은 경로(또는 원하는 경로)에 체크아웃
3. 의존성 설치: `npm install`
4. 환경변수 준비: `.env.local`에 `DATABASE_URL` 설정
5. 마이그레이션 실행: `npm run db:migrate`
6. 개발 서버 실행: `npm run dev -- --port 3000`
7. 접속: `http://127.0.0.1:3000`
8. 원격에서 바로 붙을 때는 호스트 바인딩이 `0.0.0.0`으로 열려 있어야 함

## 2) 반드시 같이 옮길 파일
- `docs/agents/*` (에이전트 규칙)
- `docs/agents/task-template.md` (지시 템플릿)
- `requirements.md`
- `prd-v1.md`, `backlog-v1.md`
- `briefing-prd.md`, `briefing-design.md`
- `api-spec.md`

## 3) 현재 구현 상태 요약
- 캘린더 UI + 모달 CRUD
- `/api/events` 기반 데이터 연동
- PostgreSQL + SQL migration 기반 일정 저장소
- 브리핑 위젯(메인) + 브리핑 전용 페이지(`/briefing`)
- 로딩/에러/재시도/empty 상태 포함
- 다크모드 포함

## 4) 최근 중요 이슈 및 해결
- `React.Children.only expected ...` 런타임 에러 해결
- 원인: `Button asChild`에서 다중 child 전달
- 조치: `components/ui/button.tsx`에서 `asChild` 경로 분리

## 5) 다음 작업 권장 순서
1. 브리핑 우선순위 분류(긴급/중요) 고도화
2. 검색/필터 고도화
3. 반복 일정 + 예외 날짜
4. 알림 기능

## 6) Codex에서 세션 복원 시 첫 프롬프트 예시
"이 저장소의 `docs/agents/README.md`와 `docs/agents/task-template.md`를 먼저 읽고, 고정 팀(Kuhn/Bacon/Beauvoir/Dirac/Shannon)만 사용해서 작업해줘. 서버 패키지 설치나 포트 확인은 Shannon에게 맡기고, 작업 끝나면 dev 서버 재기동 후 `/`와 `/briefing` 상태코드 확인까지 해줘."

## 7) 참고
- 에이전트 ID/세션 상태는 PC/세션이 바뀌면 유지되지 않을 수 있음
- 따라서 역할 문서 기반으로 에이전트를 재생성/재지시하면 동일 방식으로 이어갈 수 있음
