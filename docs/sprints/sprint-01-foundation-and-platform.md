# Sprint 01 - Foundation And Platform

## Goal
- 프로젝트 실행 기반을 안정화하고, 일정 앱의 기본 UI 톤과 런타임 환경을 정리한다.

## Completed
- Node/npm 설치 및 프로젝트 의존성 설치
- ESLint 설정 추가 및 `npm run lint` 동작 정리
- dev/start 서버를 `0.0.0.0`으로 바인딩
- PostgreSQL 연결 구조 도입
- SQL migration 실행 스크립트 추가
- 메인 캘린더와 브리핑 화면의 시각 리디자인 반영

## Key Files
- [package.json](/root/schedule_2/package.json)
- [eslint.config.mjs](/root/schedule_2/eslint.config.mjs)
- [lib/server/db.ts](/root/schedule_2/lib/server/db.ts)
- [db/migrations/001_init.sql](/root/schedule_2/db/migrations/001_init.sql)
- [components/calendar-shell.tsx](/root/schedule_2/components/calendar-shell.tsx)
- [components/daily-briefing.tsx](/root/schedule_2/components/daily-briefing.tsx)

## Verification
- `npm run lint`
- `npm run build`
- `/` 200
- `/briefing` 200

## Notes
- 팀 운영 규칙과 에이전트 역할 문서를 함께 정리했다.
- UI 리디자인 이후 모달/필터/브리핑 톤을 공통 스타일로 맞추기 시작했다.
