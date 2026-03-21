# Sprint 03 - Calendar Menu Panel

## Goal
- 캘린더와 필터 패널을 상시 노출 대신 메뉴 버튼을 통해 여는 구조로 바꿔, 진입 동선을 더 명확하게 만든다.

## Assigned Agents
- `Kuhn`: 범위와 완료조건 정리
- `Bacon`: 메뉴 버튼과 패널 구조 방향 제안
- `Beauvoir`: 헤더/사이드바/쉘 UI 리팩터링
- `Turing`: 접근성 및 패널 사용성 QA 기준 정리
- `Shannon`: dev 서버, 포트, lint/build, 기본 응답 검증

## Completed
- 헤더에 `캘린더 메뉴` 버튼 추가
- 메뉴 버튼으로 캘린더/태그 패널을 여는 구조로 전환
- 패널 상단에 활성 캘린더/태그 요약 추가
- 패널 내부에서 새 일정 추가와 필터 조정이 가능하도록 유지
- 데스크톱과 모바일에서 같은 메뉴 진입 패턴으로 정리

## Key Files
- [components/calendar-header.tsx](/root/schedule_2/components/calendar-header.tsx)
- [components/calendar-sidebar.tsx](/root/schedule_2/components/calendar-sidebar.tsx)
- [components/calendar-shell.tsx](/root/schedule_2/components/calendar-shell.tsx)

## Verification
- `npm run lint`
- `npm run build`
- `ss -ltnp | grep ':3000'`
- `curl -I http://127.0.0.1:3000/`
- `curl -I http://127.0.0.1:3000/briefing`

## QA Focus
- 메뉴 버튼 접근성
- 열기/닫기 상태 일관성
- 패널 내부 스크롤과 작은 높이 뷰포트 대응

## Notes
- 이번 스프린트는 데이터 구조를 건드리지 않고 탐색 UX를 정리하는 데 집중했다.
- 반복 일정 작업은 별도 브랜치성 변경이 남아 있어 이 스프린트 로그에는 포함하지 않았다.
