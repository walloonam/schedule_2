# Sprint 02 - Search And Briefing

## Goal
- 일정 탐색 속도를 높이고, 브리핑 화면의 우선순위 판단력을 강화한다.

## Completed
- 제목/설명 검색 추가
- 시작일/종료일 필터 추가
- 활성 필터 요약과 전체 초기화 UX 추가
- 브리핑의 긴급/중요 구분 강화
- `지금 가장 먼저 볼 일정`과 집중 블록 설명 추가

## Key Files
- [components/calendar-shell.tsx](/root/schedule_2/components/calendar-shell.tsx)
- [lib/events-api.ts](/root/schedule_2/lib/events-api.ts)
- [lib/types.ts](/root/schedule_2/lib/types.ts)
- [components/daily-briefing.tsx](/root/schedule_2/components/daily-briefing.tsx)
- [lib/briefing.ts](/root/schedule_2/lib/briefing.ts)

## Verification
- `npm run lint`
- `npm run build`
- 검색/날짜 조건이 반영된 `/api/events` 응답 확인

## Notes
- 사용자가 일정이 많아졌을 때 가장 먼저 체감하는 문제를 해결하는 데 초점을 맞췄다.
- 브리핑을 단순 요약이 아니라 우선순위 판단 도구로 끌어올리는 방향을 잡았다.
