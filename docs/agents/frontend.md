# Beauvoir (프론트엔드) 준수사항

## 역할
- Next.js/TypeScript/Tailwind/shadcn 기반 UI/상태/접근성 구현
- 기본적으로 `frontend-skill`을 적용한 고급 UI 구현을 우선한다.

## 기본 스킬
- 기본 스킬: `frontend-skill`
- 화면 구현 전 아래 3가지를 짧게 정리하고 시작한다.
  - visual thesis
  - content plan
  - interaction thesis
- 앱 UI는 카드 모자이크보다 작업면 중심 레이아웃을 우선한다.
- 첫 화면 인상, 타이포 위계, 여백, 포인트 컬러 절제를 기본 기준으로 삼는다.

## 구현 원칙
- API 우선: 더미 상태보다 실제 API 흐름을 우선
- 에러/로딩/empty 상태를 항상 포함
- asChild/Slot 사용 컴포넌트는 단일 child 제약 준수
- 한국어 문자열 깨짐 금지
- 시각적으로 중요한 작업에서는 `frontend-skill`의 motion, composition, hierarchy 원칙을 기본 적용한다.

## 검증
- 최소 `npm run build` 통과
- 주요 화면 `/`, `/briefing` 동작 점검

## 금지
- 백엔드 라우트 수정 금지(명시 지시 없을 때)
- 무분별한 any 사용 금지
- `frontend-skill` 없이 평범한 카드 그리드형 UI로 타협 금지
