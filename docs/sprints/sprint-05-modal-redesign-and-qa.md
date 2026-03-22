# Sprint 05 - Modal Redesign And QA

## Goal
- 일정 수정 모달을 작은 높이 화면에서도 더 짧고 명확하게 사용하도록 재구성한다.

## Assigned Agents
- `Kuhn`: 스프린트 범위와 완료조건 정리
- `Bacon`: `frontend-skill` 기준의 정보량 감축과 상호작용 방향 제안
- `Beauvoir`: 모달 구조 압축과 반복 옵션 접기 구현
- `Turing`: `800px` 이하 높이, CTA 노출, nested scroll, background scroll QA 기준 정리
- `Shannon`: `build + start`, `0.0.0.0:3000`, 라우트 응답 검증

## Completed
- 제목, 시간, 캘린더, 태그, 설명의 핵심 필드를 더 촘촘한 편집 구조로 정리
- 반복 옵션을 기본 접힘 상태로 바꿔 세로 공간 점유를 줄임
- 설명 입력 높이와 푸터 패딩을 줄여 CTA 노출 가능성을 높임
- 수정 모달에서 배경 스크롤 잠금은 유지

## Key Files
- [components/event-modal.tsx](/root/schedule_2/components/event-modal.tsx)

## Verification
- `npm run lint`
- `npm run build`
- `npm run start`
- `curl -I http://127.0.0.1:3000/calendar`

## QA Focus
- `800px` 이하 높이에서 CTA가 스크롤 없이 보이는지
- 반복 섹션이 기본 접힘일 때 핵심 필드가 한 화면에 들어오는지
- 모달 오픈 시 배경 스크롤이 잠기는지
- nested scroll이 체감될 정도로 남아 있는지

## Notes
- Playwright 브라우저는 현재 root sandbox 제약으로 자동 시각 캡처를 못 했다.
- 실제 화면에서 여전히 잘림이 보이면 다음 단계는 반복 옵션 별도 시트 분리 또는 설명 필드 축소다.
