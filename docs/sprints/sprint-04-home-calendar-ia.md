# Sprint 04 - Home Calendar IA And Modal Follow-up

## Goal
- 홈, 캘린더, 브리핑의 역할을 분리해 탐색 피로를 줄이고, 캘린더 화면을 작업면 중심으로 단순화한다.

## Assigned Agents
- `Kuhn`: 정보구조와 완료조건 정리
- `Bacon`: `Home / Calendar / Briefing` 분리 방향과 화면 역할 정의
- `Beauvoir`: 라우트 분리와 캘린더 작업면 단순화 구현
- `Turing`: 작은 높이 뷰포트, 모달 CTA 노출, 화면 역할 혼선 QA 기준 정리
- `Shannon`: `build/start`, 포트, CSS 자산 응답 검증

## Completed
- `Home / Calendar / Briefing` 3분 구조를 고정
- `/calendar`를 캘린더 + 검색/필터 중심 작업면으로 단순화
- 상단 전역 내비게이션으로 세 화면 진입 구조 통일
- 수정 모달의 하단 잘림과 배경 스크롤 이슈를 줄이기 위한 구조 조정 진행
- UI 확인 기준을 `dev`보다 `build + start` 중심으로 운영 정리

## Key Files
- [app/page.tsx](/root/schedule_2/app/page.tsx)
- [app/calendar/page.tsx](/root/schedule_2/app/calendar/page.tsx)
- [app/layout.tsx](/root/schedule_2/app/layout.tsx)
- [components/app-nav.tsx](/root/schedule_2/components/app-nav.tsx)
- [components/calendar-shell.tsx](/root/schedule_2/components/calendar-shell.tsx)
- [components/event-modal.tsx](/root/schedule_2/components/event-modal.tsx)
- [components/ui/dialog.tsx](/root/schedule_2/components/ui/dialog.tsx)
- [next.config.mjs](/root/schedule_2/next.config.mjs)

## Verification
- `npm run lint`
- `npm run build`
- `PORT=3000 npm run start`
- `curl -I http://127.0.0.1:3000/`
- `curl -I http://127.0.0.1:3000/calendar`
- `curl -I http://127.0.0.1:3000/briefing`
- hashed CSS asset `200 OK` 확인

## QA Focus
- `Home / Calendar / Briefing` 역할이 겹치지 않는지 확인
- `/calendar`에서 불필요한 요약/보조 패널이 제거됐는지 확인
- 작은 높이 뷰포트에서 수정 모달 CTA가 보이는지 확인
- 모달 오픈 시 배경 스크롤이 같이 움직이지 않는지 확인

## Notes
- 수정 모달은 여전히 작은 높이 뷰포트에서 리그레션 가능성이 있어 지속 QA가 필요하다.
- Next.js `dev` 환경의 CSS 자산 불안정으로 인해 시각 검증은 `start` 서버 기준이 더 안전하다.
