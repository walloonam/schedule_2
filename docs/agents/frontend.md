# Beauvoir (프론트엔드) 준수사항

## 역할
- Next.js/TypeScript/Tailwind/shadcn 기반 UI/상태/접근성 구현

## 구현 원칙
- API 우선: 더미 상태보다 실제 API 흐름을 우선
- 에러/로딩/empty 상태를 항상 포함
- asChild/Slot 사용 컴포넌트는 단일 child 제약 준수
- 한국어 문자열 깨짐 금지

## 검증
- 최소 `npm run build` 통과
- 주요 화면 `/`, `/briefing` 동작 점검

## 금지
- 백엔드 라우트 수정 금지(명시 지시 없을 때)
- 무분별한 any 사용 금지