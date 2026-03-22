# Sprint 06 - Home Natural Language Schedule MVP

## Goal
- `Home` 화면에서 자연어 문장을 입력하면 규칙 기반 파서가 일정 초안을 만들고, 사용자가 확인 후 저장할 수 있게 한다.

## Assigned Agents
- `Kuhn`: 범위, 완료조건, 비범위 정리
- `Bacon`: 운영 화면에 맞는 자연어 입력 UX 방향 제안
- `Beauvoir`: Home 입력창, 확인 카드, 저장 플로우 프론트 구조 제안
- `Dirac`: 규칙 기반 파서와 API 구조 정리
- `Turing`: 모호한 입력, 저장 전 확인, 실패 메시지 QA 기준 정리
- `Shannon`: `build + start`, API 응답, Home 동작 검증

## Completed
- `Home` 화면에 자연어 입력창 추가
- `/api/natural-events/parse` 규칙 기반 파서 API 추가
- 날짜, 시간, 기간, 우선순위, 제목 추출 로직 추가
- 저장 전 확인 카드 UI 추가
- 모호하거나 정보가 부족한 문장은 저장하지 않고 경고/누락값 표시
- 일정 저장은 기존 `/api/events` 흐름을 재사용
- `100개` 회귀 테스트 스크립트 추가

## Key Files
- [app/page.tsx](/root/schedule_2/app/page.tsx)
- [components/home-natural-scheduler.tsx](/root/schedule_2/components/home-natural-scheduler.tsx)
- [app/api/natural-events/parse/route.ts](/root/schedule_2/app/api/natural-events/parse/route.ts)
- [lib/server/natural-events/parse.ts](/root/schedule_2/lib/server/natural-events/parse.ts)
- [scripts/test-natural-schedule.mjs](/root/schedule_2/scripts/test-natural-schedule.mjs)
- [docs/natural-language-scheduling-mvp.md](/root/schedule_2/docs/natural-language-scheduling-mvp.md)

## Verification
- `npm run lint`
- `npm run build`
- `npm run start`
- `npm run test:natural-schedule`
- `curl -I http://127.0.0.1:3000/`
- `POST /api/natural-events/parse` with:
  - `내일 오후 3시 긴급 디자인 리뷰 1시간`
  - `금요일 리뷰`

## QA Focus
- 자연어 입력이 일정 초안으로 안정적으로 해석되는지
- 모호한 문장은 자동 저장되지 않는지
- 저장 전 확인 단계가 항상 존재하는지
- 저장 후 기존 캘린더 흐름과 충돌하지 않는지

## Notes
- 현재는 규칙 기반 MVP이며, 로컬 LLM fallback은 아직 포함하지 않았다.
- `Home` 입력은 빠른 초안 생성용이고, 잘못된 자동 저장을 막기 위해 확인 단계를 우선했다.
