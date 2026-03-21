# Migration Files

이 폴더는 PostgreSQL 초기 스키마와 이후 변경 이력을 SQL 파일로 관리한다.

규칙:
- 파일명은 `001_...sql`, `002_...sql`처럼 증가 순서가 드러나게 작성한다.
- `scripts/migrate.mjs`가 이 폴더의 `.sql` 파일을 이름순으로 적용한다.
- 새 환경에서는 `.env.local` 또는 환경변수에 `DATABASE_URL`을 넣은 뒤 `npm run db:migrate`를 실행한다.
