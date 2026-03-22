# Issue Board

이 문서는 지금까지 해결한 작업을 GitHub issue처럼 정리한 보드다.
`Done`은 완료된 이슈, `Open`은 다음에 이어서 볼 이슈다.
실제 GitHub issue 번호는 `#1`부터 `#19`까지 생성되었다.

## Done

- [x] `[UX-01] Home / Calendar / Briefing 역할 분리` (`#1`)
  - 홈은 오늘 요약, 캘린더는 작업면, 브리핑은 우선순위 확인 화면으로 분리했다.
  - 관련: [Sprint 04](/root/schedule_2/docs/sprints/sprint-04-home-calendar-ia.md)

- [x] `[UX-02] 캘린더 메뉴 진입 단순화` (`#2`)
  - 캘린더 보조 패널을 메뉴 버튼으로 여는 구조로 바꿨다.
  - 관련: [Sprint 03](/root/schedule_2/docs/sprints/sprint-03-calendar-menu-panel.md)

- [x] `[UX-03] 일정 수정 모달 세로 압축` (`#3`)
  - 작은 높이에서 하단 CTA가 잘리는 문제를 줄였다.
  - 관련: [Sprint 05](/root/schedule_2/docs/sprints/sprint-05-modal-redesign-and-qa.md)

- [x] `[UX-04] Calendar 화면 단순화` (`#4`)
  - `/calendar`에서 브리핑 성격을 걷어내고 캘린더 + 검색 작업면으로 정리했다.
  - 관련: [Sprint 04](/root/schedule_2/docs/sprints/sprint-04-home-calendar-ia.md)

- [x] `[BE-01] PostgreSQL 저장소 전환` (`#5`)
  - 메모리 저장소를 PostgreSQL + SQL migration 구조로 바꿨다.

- [x] `[NLP-01] 자연어 일정 추가 MVP` (`#6`)
  - Home 입력창에서 규칙 기반으로 일정 초안을 만들고 확인 후 저장하는 흐름을 넣었다.
  - 관련: [Sprint 06](/root/schedule_2/docs/sprints/sprint-06-home-natural-language-schedule-mvp.md)

- [x] `[OPS-01] 시간대 혼선 수정` (`#7`)
  - UTC와 앱 표시 시간대가 섞여 보이던 문제를 `Asia/Seoul` 기준으로 통일했다.
  - 관련: [lib/timezone.ts](/root/schedule_2/lib/timezone.ts)

- [x] `[QA-01] 자연어 파서 회귀/벤치마크 정리` (`#8`)
  - 100개 회귀 테스트와 벤치마크를 추가해 성능과 안정성을 확인했다.
  - 관련: [docs/natural-language-scheduling-benchmark.md](/root/schedule_2/docs/natural-language-scheduling-benchmark.md)

- [x] `[OPS-02] CSS 자산/개발 서버 불안정성 대응` (`#9`)
  - `next dev` / `next start`에서 CSS가 깨지던 이슈를 점검하고, UI 확인은 `build + start` 기준으로 운영하도록 정리했다.

- [x] `[NLP-02] 로컬 LLM 없이 규칙 기반 MVP로 시작` (`#10`)
  - 자연어 일정 기능은 현재 로컬 LLM 없이 규칙 파서만 사용한다.
  - 관련: [docs/natural-language-scheduling-mvp.md](/root/schedule_2/docs/natural-language-scheduling-mvp.md)

- [x] `[UX-05] 홈 자연어 입력 규칙 안내 추가` (`#11`)
  - 입력창 아래에 예시와 해석 규칙을 붙여 사용자가 바로 따라 쓸 수 있게 했다.

- [x] `[UX-06] 우선순위 색상/라벨 정리` (`#12`)
  - 태그를 우선순위 기준으로 다시 읽히게 정리했다.

- [x] `[UX-07] 빈 일정 상태에서도 월간 캘린더 유지` (`#13`)
  - 일정이 없어도 캘린더 그리드가 숨지지 않도록 바꿨다.

- [x] `[OPS-03] 오늘 요약과 캘린더 사이 시간대 표시 일치` (`#14`)
  - 입력/저장/브리핑/달력 표시 시간을 앱 기준으로 맞췄다.

## Open

- [ ] `[NLP-03] 로컬 LLM fallback 여부 재검토` (`#15`)
  - 실패 문장 패턴이 충분히 쌓이면 fallback 도입을 다시 판단한다.

- [ ] `[BE-02] 반복 일정 고도화` (`#16`)
  - 주간 반복을 넘어서 예외 날짜, 더 복잡한 반복 규칙을 다루는 작업이 남아 있다.

- [ ] `[QA-02] 유지보수용 회귀 케이스 확장` (`#17`)
  - 자연어 입력 케이스와 모달 UI 회귀를 더 늘려 재현 시간을 줄인다.

- [ ] `[UX-08] 검색/필터 UX 추가 개선` (`#18`)
  - 현재는 동작하지만 더 빠른 탐색을 위해 필터 표현을 정리할 여지가 있다.

- [ ] `[UX-09] 모바일 캘린더 조작성 개선` (`#19`)
  - 작은 화면에서의 날짜 이동과 편집 동선은 추가 검토 여지가 있다.

## 사용법

- 새 작업이 끝나면 `Done`에 체크를 옮긴다.
- 다시 해야 하는 일이 생기면 `Open`으로 분리한다.
- 실제 GitHub issue로 옮길 때는 이 문서의 `ISS-*` 제목을 그대로 쓰면 된다.
