# Atelier Schedule

Atelier Schedule is a focused calendar workspace for planning, reviewing, and capturing the day without forcing everything into one screen.

The app is split into three surfaces:
- `Home` for today’s summary and quick capture
- `Calendar` for editing and search
- `Briefing` for priorities and next actions

## Current Focus

- Home / Calendar / Briefing 3-way split
- PostgreSQL + SQL migration storage
- Rule-based natural language event capture
- Calendar search/filter + month workspace
- Compact edit modal for small screens
- Regression tests, benchmark notes, and issue tracking

## Start Here

- [Issue Board](docs/issues/issue-log.md)
- [Issue Creation Guide](docs/issue-creation-guide.md)
- [Sprint Logs](docs/sprints/README.md)
- [Natural Language MVP](docs/natural-language-scheduling-mvp.md)
- [Benchmark Notes](docs/natural-language-scheduling-benchmark.md)

## Local Run

```bash
npm install
npm run db:migrate
npm run build
npm run start
```

For UI checks, `build + start` is the more stable path than `next dev`.

## Working Rules

- Issue titles use `[AREA-##]` format.
- Issue bodies follow `문제 제기 / 해결 방법 / 결과`.
- Closed work moves into `docs/issues/issue-log.md` under `Done`.
- Open follow-up work stays in `Open`.

## Labels

- `area:ux` for UI, IA, and usability
- `area:be` for API, schema, and storage
- `area:nlp` for natural-language parsing
- `area:qa` for tests, regressions, and benchmarks
- `area:ops` for runtime, timezone, and server stability
- `area:doc` for docs, handoff, and planning
