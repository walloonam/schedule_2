const BASE_URL = process.env.NATURAL_SCHEDULE_BASE_URL || "http://127.0.0.1:3000";
const NOW = process.env.NATURAL_SCHEDULE_NOW || "2026-03-22T09:00:00+09:00";
const ROUNDS = Number(process.env.NATURAL_SCHEDULE_ROUNDS || 20);
const CONCURRENCY = Number(process.env.NATURAL_SCHEDULE_CONCURRENCY || 5);

function buildBenchmarkCases() {
  const cases = [];
  const dayTokens = ["오늘", "내일", "모레", "이번주 금요일", "다음주 화요일"];
  const timeTokens = ["오전 9시", "오전 10시 30분", "오후 2시", "오후 4시 15분", "15:30"];
  const priorities = ["낮음", "보통", "높음", "긴급"];
  const titles = [
    "standup sync",
    "디자인 리뷰",
    "배포 점검",
    "문서 정리",
    "고객 미팅",
    "운영 확인",
    "QA 체크",
    "기획 정리",
    "출장 준비",
    "병원 예약"
  ];

  for (const day of dayTokens) {
    for (const time of timeTokens) {
      for (const priority of priorities) {
        const title = titles[cases.length % titles.length];
        const duration = cases.length % 2 === 0 ? "30분" : "1시간";
        cases.push(`${day} ${time} ${priority} ${title} ${duration}`);
        if (cases.length === 100) {
          return cases;
        }
      }
    }
  }

  return cases;
}

function percentile(values, ratio) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * ratio));
  return sorted[index];
}

async function worker(queue, latencies, failures) {
  while (queue.length > 0) {
    const text = queue.shift();
    const startedAt = performance.now();

    try {
      const response = await fetch(`${BASE_URL}/api/natural-events/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, now: NOW })
      });

      const elapsed = performance.now() - startedAt;
      latencies.push(elapsed);

      if (!response.ok) {
        failures.push({ text, status: response.status });
        continue;
      }

      const payload = await response.json();
      if (!payload?.data || typeof payload.data !== "object") {
        failures.push({ text, status: "invalid-payload" });
      }
    } catch (error) {
      failures.push({ text, status: error instanceof Error ? error.message : "unknown-error" });
    }
  }
}

async function run() {
  const cases = buildBenchmarkCases();
  const queue = [];
  for (let round = 0; round < ROUNDS; round += 1) {
    queue.push(...cases);
  }

  const latencies = [];
  const failures = [];
  const startedAt = performance.now();

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue, latencies, failures)));

  const totalMs = performance.now() - startedAt;
  const totalRequests = latencies.length;
  const averageMs = totalRequests > 0 ? latencies.reduce((sum, value) => sum + value, 0) / totalRequests : 0;
  const requestsPerSecond = totalMs > 0 ? (totalRequests / totalMs) * 1000 : 0;

  const result = {
    cases: cases.length,
    rounds: ROUNDS,
    concurrency: CONCURRENCY,
    totalRequests,
    totalMs: Number(totalMs.toFixed(2)),
    averageMs: Number(averageMs.toFixed(2)),
    p50Ms: Number(percentile(latencies, 0.5).toFixed(2)),
    p95Ms: Number(percentile(latencies, 0.95).toFixed(2)),
    maxMs: Number((latencies.length > 0 ? Math.max(...latencies) : 0).toFixed(2)),
    requestsPerSecond: Number(requestsPerSecond.toFixed(2)),
    failures: failures.length
  };

  console.log(JSON.stringify(result, null, 2));

  if (failures.length > 0) {
    console.log("\nSample failures:");
    for (const failure of failures.slice(0, 10)) {
      console.log(`- ${failure.text} :: ${failure.status}`);
    }
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
