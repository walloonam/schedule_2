# 자연어 일정 파서 벤치마크

## 기준
- 대상 기능: 규칙 기반 자연어 일정 파서
- 서버: 현재 개발 서버
- 런타임: `next start`
- 측정 방식:
  - 추가 `100개` 서로 다른 케이스
  - `npm run bench:natural-schedule`
  - `pidstat -r -u -p <next-server-pid>`

## 실행 명령
```bash
npm run build
npm run start
npm run test:natural-schedule
npm run bench:natural-schedule
```

고동시성 확인:
```bash
NATURAL_SCHEDULE_CONCURRENCY=20 NATURAL_SCHEDULE_ROUNDS=20 npm run bench:natural-schedule
```

## 추가 100케이스 결과
- 회귀 테스트: `100/100 passed`
- 스크립트: [scripts/test-natural-schedule.mjs](/root/schedule_2/scripts/test-natural-schedule.mjs)

## 벤치마크 결과
### 1차
- 조건: `100케이스 x 20라운드`, 동시성 `5`
- 총 요청: `2000`
- 평균 응답: `6.76ms`
- `p50`: `5.96ms`
- `p95`: `14.06ms`
- 최대: `69.46ms`
- 처리량: `713.13 req/s`
- 서버 CPU 피크: `134%`
- 서버 RSS 피크: `약 171MB`

### 2차
- 조건: `100케이스 x 20라운드`, 동시성 `20`
- 총 요청: `2000`
- 평균 응답: `21.85ms`
- `p50`: `19.08ms`
- `p95`: `39.2ms`
- 최대: `150.23ms`
- 처리량: `883.59 req/s`
- 서버 CPU 피크: `109%`
- 서버 RSS 피크: `약 211MB`

## 해석
- 규칙 기반 파서는 매우 가볍다.
- 현재 `4 CPU` 환경에서 `next-server`가 대략 `1.1 ~ 1.3 코어` 정도만 강하게 사용했다.
- 메모리도 `next-server` 기준 `약 170MB ~ 210MB` 수준으로 안정적이었다.
- 반복 벤치 중 메모리가 계속 우상향하는 뚜렷한 누수 징후는 보이지 않았다.
- 즉, 자연어 파서 자체는 현재 앱 스택 위에 올려도 부담이 크지 않다.

## 추천 스펙
### 최소
- `1 vCPU`
- `1 GB RAM`
- 단일 사용자 또는 매우 낮은 요청량
- 기능은 동작하겠지만 Next.js + DB + 운영 여유가 적다

### 실사용 최소
- `2 vCPU`
- `2 ~ 4 GB RAM`
- 현재 규칙 기반 파서 MVP를 안정적으로 운영하기 좋은 하한선

### 권장
- `2 ~ 4 vCPU`
- `4 GB RAM`
- Next.js, PostgreSQL, 자연어 파서, 일반적인 관리자 사용량까지 고려하면 가장 무난하다

### 여유
- `4 vCPU`
- `8 GB RAM`
- 테스트, 빌드, 다중 사용자, 향후 규칙 증가와 추가 기능까지 고려할 때 가장 편하다

## 결론
- 규칙 기반 자연어 일정 추가는 `로컬 LLM 없이도` 충분히 빠르다.
- 이 기능만 놓고 보면 현재 서버도 `충분히 감당 가능`하다.
- 따라서 당장은 CPU/메모리 증설보다 `규칙 확장 + 회귀 테스트 유지`가 더 중요하다.
