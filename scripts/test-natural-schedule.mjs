const BASE_URL = process.env.NATURAL_SCHEDULE_BASE_URL || "http://127.0.0.1:3000";
const NOW = "2026-03-22T09:00:00+09:00";

function kstIso(year, month, day, hour, minute = 0) {
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute, 0)).toISOString();
}

function deepEqualArray(a = [], b = []) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function compareSubset(actual, expected) {
  const errors = [];

  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[key];
    if (Array.isArray(expectedValue)) {
      if (!deepEqualArray(actualValue, expectedValue)) {
        errors.push(`${key}: expected ${JSON.stringify(expectedValue)}, received ${JSON.stringify(actualValue)}`);
      }
      continue;
    }

    if (expectedValue && typeof expectedValue === "object") {
      const nestedErrors = compareSubset(actualValue ?? {}, expectedValue);
      errors.push(...nestedErrors.map((message) => `${key}.${message}`));
      continue;
    }

    if (actualValue !== expectedValue) {
      errors.push(`${key}: expected ${JSON.stringify(expectedValue)}, received ${JSON.stringify(actualValue)}`);
    }
  }

  return errors;
}

function createSuccessCases() {
  const cases = [];
  const relativeDays = [
    ["오늘", 22],
    ["내일", 23],
    ["모레", 24],
    ["다음주 월요일", 30],
    ["다음주 화요일", 31]
  ];
  const priorities = [
    ["낮음", "planning"],
    ["보통", "meeting"],
    ["높음", "review"],
    ["긴급", "deadline"]
  ];

  for (const [dayLabel, day] of relativeDays) {
    for (const [priorityLabel, priorityTagId] of priorities) {
      cases.push({
        name: `success-${dayLabel}-${priorityLabel}`,
        text: `${dayLabel} 오후 3시 ${priorityLabel} 디자인 리뷰 1시간`,
        expected: {
          title: "디자인 리뷰",
          startAt: kstIso(2026, 3, day, 15, 0),
          endAt: kstIso(2026, 3, day, 16, 0),
          durationMinutes: 60,
          priorityTagId,
          calendarId: "team",
          confidence: "high",
          missingFields: [],
          warnings: []
        }
      });
    }
  }

  return cases;
}

function createWeekdayCases() {
  const weekdays = [
    ["월요일", 23],
    ["화요일", 24],
    ["수요일", 25],
    ["목요일", 26],
    ["금요일", 27]
  ];
  const titleSpecs = [
    ["낮음", "기획 정리", "planning"],
    ["보통", "팀 회의", "meeting"],
    ["높음", "디자인 리뷰", "review"],
    ["긴급", "배포 점검", "deadline"]
  ];

  const cases = [];
  for (const [weekdayLabel, day] of weekdays) {
    titleSpecs.forEach(([priorityLabel, title, priorityTagId], index) => {
      const hour = 9 + index;
      const durationMinutes = index % 2 === 0 ? 30 : 60;
      const durationLabel = durationMinutes === 30 ? "30분" : "1시간";
      const actualHour = hour === 12 ? 0 : hour;
      cases.push({
        name: `weekday-${weekdayLabel}-${title}`,
        text: `${weekdayLabel} 오전 ${hour}시 ${priorityLabel} ${title} ${durationLabel}`,
        expected: {
          title,
          startAt: kstIso(2026, 3, day, actualHour, 0),
          endAt: kstIso(2026, 3, day, actualHour, durationMinutes),
          durationMinutes,
          priorityTagId,
          confidence: "high",
          missingFields: [],
          warnings: []
        }
      });
    });
  }

  return cases;
}

function createThisNextWeekCases() {
  const specs = [
    ["이번 주 월요일", 2026, 3, 23, "오전", 9, "보통", "주간 공유", 30, "meeting"],
    ["이번 주 화요일", 2026, 3, 24, "오전", 10, "낮음", "요구사항 정리", 60, "planning"],
    ["이번 주 수요일", 2026, 3, 25, "오후", 2, "긴급", "릴리즈 점검", 60, "deadline"],
    ["이번 주 목요일", 2026, 3, 26, "오후", 4, "중요", "UX 리뷰", 30, "review"],
    ["이번 주 금요일", 2026, 3, 27, "오후", 5, "보통", "회고", 60, "meeting"],
    ["다음 주 월요일", 2026, 3, 30, "오전", 11, "낮음", "문서 정리", 60, "planning"],
    ["다음 주 화요일", 2026, 3, 31, "오후", 1, "보통", "동기화", 30, "meeting"],
    ["다음 주 수요일", 2026, 4, 1, "오후", 3, "높음", "리스크 점검", 60, "review"],
    ["다음 주 목요일", 2026, 4, 2, "오전", 10, "긴급", "QA 확인", 30, "deadline"],
    ["다음 주 금요일", 2026, 4, 3, "오후", 6, "중요", "마무리 리뷰", 60, "review"]
  ];

  return specs.flatMap(([label, year, month, day, meridiem, hour, priorityLabel, title, durationMinutes, priorityTagId], index) => {
    const actualHour = meridiem === "오후" ? (hour % 12) + 12 : hour;
    const durationLabel = durationMinutes === 30 ? "30분" : "1시간";
    const noSpaceLabel = label.replace(/\s+/g, "");
    return [
      {
        name: `weekphrase-${index + 1}-spaced`,
        text: `${label} ${meridiem} ${hour}시 ${priorityLabel} ${title} ${durationLabel}`,
        expected: {
          title,
          startAt: kstIso(year, month, day, actualHour, 0),
          endAt: kstIso(year, month, day, actualHour, durationMinutes),
          durationMinutes,
          priorityTagId,
          confidence: "high",
          missingFields: [],
          warnings: []
        }
      },
      {
        name: `weekphrase-${index + 1}-compact`,
        text: `${noSpaceLabel} ${meridiem} ${hour}시 ${priorityLabel} ${title} ${durationLabel}`,
        expected: {
          title,
          startAt: kstIso(year, month, day, actualHour, 0),
          endAt: kstIso(year, month, day, actualHour, durationMinutes),
          durationMinutes,
          priorityTagId,
          confidence: "high",
          missingFields: [],
          warnings: []
        }
      }
    ];
  });
}

function createWarningCases() {
  const specs = [
    ["3시 디자인 리뷰", "디자인 리뷰", 22, 3, null],
    ["오늘 3시 낮음 문서 정리", "문서 정리", 22, 3, "planning"],
    ["내일 9시 보통 회의", "회의", 23, 9, "meeting"],
    ["모레 11시 높음 QA 검토", "QA 검토", 24, 11, "review"],
    ["금요일 5시 긴급 배포 확인", "배포 확인", 27, 5, "deadline"]
  ];

  const cases = [];
  for (let repeat = 0; repeat < 4; repeat += 1) {
    for (const [text, title, day, hour, priorityTagId] of specs) {
      cases.push({
        name: `warning-${repeat + 1}-${title}`,
        text,
        expected: {
          title,
          startAt: kstIso(2026, 3, day, hour, 0),
          endAt: kstIso(2026, 3, day, hour + 1, 0),
          priorityTagId,
          confidence: "medium",
          missingFields: [],
          warnings:
            text.includes("오늘") || text.includes("내일") || text.includes("모레") || text.includes("금요일")
              ? ["시간대가 명확하지 않아 입력한 시각을 그대로 해석했습니다."]
              : [
                  "날짜 표현이 없어 오늘 기준으로 해석했습니다.",
                  "시간대가 명확하지 않아 입력한 시각을 그대로 해석했습니다."
                ]
        }
      });
    }
  }

  return cases;
}

function createFailureCases() {
  const inputs = [
    ["금요일 리뷰", ["startAt", "endAt"]],
    ["긴급 회의", ["startAt", "endAt"]],
    ["중요하게 하나 등록", ["startAt", "endAt"]],
    ["내일 오후에 배포", ["startAt", "endAt"]],
    ["내일 3시", ["title"]],
    ["오늘 긴급", ["startAt", "endAt", "title"]],
    ["다음주 화요일", ["startAt", "endAt", "title"]],
    ["보통 일정 하나", ["startAt", "endAt"]],
    ["낮음", ["startAt", "endAt", "title"]],
    ["금요일", ["startAt", "endAt", "title"]],
    ["리뷰", ["startAt", "endAt"]],
    ["회의 잡아줘", ["startAt", "endAt"]],
    ["다음 주 금요일 중요", ["startAt", "endAt", "title"]],
    ["모레 문서 정리", ["startAt", "endAt"]],
    ["오늘 오후에 회의", ["startAt", "endAt"]],
    ["내일 급한", ["startAt", "endAt", "title"]],
    ["이번주 수요일 디자인", ["startAt", "endAt"]],
    ["중요", ["startAt", "endAt", "title"]],
    ["급한 작업", ["startAt", "endAt"]],
    ["다음주쯤 회의 잡아줘", ["startAt", "endAt"]]
  ];

  return inputs.map(([text, missingFields], index) => ({
    name: `failure-${index + 1}`,
    text,
    expected: {
      confidence: "low",
      missingFields
    }
  }));
}

const cases = [
  ...createSuccessCases(),
  ...createWeekdayCases(),
  ...createThisNextWeekCases(),
  ...createWarningCases(),
  ...createFailureCases()
];

if (cases.length !== 100) {
  throw new Error(`Expected 100 cases, received ${cases.length}`);
}

async function run() {
  const failures = [];

  for (const testCase of cases) {
    const response = await fetch(`${BASE_URL}/api/natural-events/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: testCase.text,
        now: NOW
      })
    });

    const payload = await response.json();
    if (!response.ok || !payload?.data) {
      failures.push({
        name: testCase.name,
        text: testCase.text,
        errors: [`request failed with status ${response.status}`]
      });
      continue;
    }

    const errors = compareSubset(payload.data, testCase.expected);
    if (errors.length > 0) {
      failures.push({
        name: testCase.name,
        text: testCase.text,
        errors
      });
    }
  }

  const passed = cases.length - failures.length;
  console.log(`Natural schedule regression: ${passed}/${cases.length} passed`);

  if (failures.length > 0) {
    for (const failure of failures.slice(0, 20)) {
      console.log(`\n[FAIL] ${failure.name}`);
      console.log(`input: ${failure.text}`);
      failure.errors.forEach((message) => console.log(`- ${message}`));
    }
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
