import { addDays, addWeeks, set, startOfDay, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { badRequest } from "@/lib/server/errors";
import { ParsedScheduleDraft } from "@/lib/types";

const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_CALENDAR_ID = "team";

const weekdayIndex: Record<string, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6
};

const priorityMatchers = [
  { id: "deadline", patterns: ["긴급", "급한", "즉시", "빨리"] },
  { id: "review", patterns: ["중요", "높음", "우선"] },
  { id: "meeting", patterns: ["보통", "일반"] },
  { id: "planning", patterns: ["낮음", "나중에"] }
] as const;

function normalizeInput(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function getOffsetMinutes(value: string | Date) {
  if (typeof value === "string") {
    if (value.endsWith("Z")) {
      return 0;
    }

    const match = value.match(/([+-])(\d{2}):(\d{2})$/);
    if (match) {
      const [, sign, hourText, minuteText] = match;
      const rawMinutes = Number(hourText) * 60 + Number(minuteText);
      return sign === "+" ? rawMinutes : -rawMinutes;
    }
  }

  return -new Date(value).getTimezoneOffset();
}

function toPseudoLocalDate(value: string | Date, offsetMinutes: number) {
  const date = new Date(value);
  return new Date(date.getTime() + offsetMinutes * 60_000);
}

function fromPseudoLocalDate(value: Date, offsetMinutes: number) {
  return new Date(value.getTime() - offsetMinutes * 60_000);
}

function stripMatchedText(source: string, pattern: RegExp) {
  return source.replace(pattern, " ").replace(/\s+/g, " ").trim();
}

function parsePriority(text: string) {
  for (const matcher of priorityMatchers) {
    for (const keyword of matcher.patterns) {
      if (text.includes(keyword)) {
        return { tagId: matcher.id, cleaned: text.replace(keyword, " ").replace(/\s+/g, " ").trim() };
      }
    }
  }

  return { tagId: null, cleaned: text };
}

function parseRelativeDate(text: string, now: Date) {
  const today = startOfDay(now);

  if (text.includes("모레")) {
    return { date: addDays(today, 2), cleaned: stripMatchedText(text, /모레/g) };
  }

  if (text.includes("내일")) {
    return { date: addDays(today, 1), cleaned: stripMatchedText(text, /내일/g) };
  }

  if (text.includes("오늘")) {
    return { date: today, cleaned: stripMatchedText(text, /오늘/g) };
  }

  const weekMatch = text.match(/(이번\s*주|다음\s*주)\s*([월화수목금토일])요일?/);
  if (weekMatch) {
    const [, weekToken, dayToken] = weekMatch;
    const baseWeek = weekToken.replace(/\s+/g, "") === "다음주" ? addWeeks(today, 1) : today;
    const weekStart = startOfWeek(baseWeek, { locale: ko });
    const date = addDays(weekStart, weekdayIndex[dayToken]);
    return {
      date,
      cleaned: stripMatchedText(text, /(이번\s*주|다음\s*주)\s*[월화수목금토일]요일?/g)
    };
  }

  const weekdayMatch = text.match(/([월화수목금토일])요일/);
  if (weekdayMatch) {
    const dayToken = weekdayMatch[1];
    const weekStart = startOfWeek(today, { locale: ko });
    let date = addDays(weekStart, weekdayIndex[dayToken]);
    if (date < today) {
      date = addWeeks(date, 1);
    }
    return {
      date,
      cleaned: stripMatchedText(text, /[월화수목금토일]요일/g)
    };
  }

  return { date: today, cleaned: text, inferred: true };
}

function parseTime(text: string) {
  const meridiemMatch = text.match(/(오전|오후)\s*(\d{1,2})(?:시)?(?:\s*(\d{1,2})분)?/);
  if (meridiemMatch) {
    const [, meridiem, hourText, minuteText] = meridiemMatch;
    const rawHour = Number(hourText);
    const minute = Number(minuteText ?? 0);
    let hour = rawHour % 12;
    if (meridiem === "오후") {
      hour += 12;
    }
    if (meridiem === "오전" && rawHour === 12) {
      hour = 0;
    }
    return {
      hour,
      minute,
      cleaned: stripMatchedText(text, /(오전|오후)\s*\d{1,2}(?:시)?(?:\s*\d{1,2}분)?/g),
      explicit: true
    };
  }

  const hhmmMatch = text.match(/\b(\d{1,2}):(\d{2})\b/);
  if (hhmmMatch) {
    const [, hourText, minuteText] = hhmmMatch;
    return {
      hour: Number(hourText),
      minute: Number(minuteText),
      cleaned: stripMatchedText(text, /\b\d{1,2}:\d{2}\b/g),
      explicit: true
    };
  }

  const hourOnlyMatch = text.match(/(?:^|\s)(\d{1,2})시(?=\s|$)/);
  if (hourOnlyMatch) {
    const hour = Number(hourOnlyMatch[1]);
    return {
      hour,
      minute: 0,
      cleaned: stripMatchedText(text, /(?:^|\s)\d{1,2}시(?=\s|$)/g),
      explicit: false
    };
  }

  return { hour: null, minute: null, cleaned: text, explicit: false };
}

function parseDuration(text: string) {
  const hourMinuteMatch = text.match(/(\d{1,2})시간\s*(\d{1,2})분/);
  if (hourMinuteMatch) {
    const [, hourText, minuteText] = hourMinuteMatch;
    const durationMinutes = Number(hourText) * 60 + Number(minuteText);
    return {
      durationMinutes,
      cleaned: stripMatchedText(text, /\d{1,2}시간\s*\d{1,2}분/g)
    };
  }

  const hourMatch = text.match(/(\d{1,2})시간/);
  if (hourMatch) {
    const durationMinutes = Number(hourMatch[1]) * 60;
    return {
      durationMinutes,
      cleaned: stripMatchedText(text, /\d{1,2}시간/g)
    };
  }

  const minuteMatch = text.match(/(\d{1,3})분/);
  if (minuteMatch) {
    const durationMinutes = Number(minuteMatch[1]);
    return {
      durationMinutes,
      cleaned: stripMatchedText(text, /\d{1,3}분/g)
    };
  }

  return { durationMinutes: null, cleaned: text };
}

function clampHour(hour: number | null) {
  if (hour === null || Number.isNaN(hour)) {
    return null;
  }

  if (hour < 0 || hour > 23) {
    return null;
  }

  return hour;
}

export function parseNaturalSchedule(input: string, now: string | Date = new Date()): ParsedScheduleDraft {
  const originalText = normalizeInput(input);
  if (!originalText) {
    throw badRequest("입력 문장이 비어 있습니다.");
  }

  const offsetMinutes = getOffsetMinutes(now);
  const pseudoNow = toPseudoLocalDate(now, offsetMinutes);
  const warnings: string[] = [];
  const missingFields: ParsedScheduleDraft["missingFields"] = [];

  const { tagId, cleaned: withoutPriority } = parsePriority(originalText);
  const { date, cleaned: withoutDate, inferred: inferredDate } = parseRelativeDate(withoutPriority, pseudoNow);
  const { hour, minute, cleaned: withoutTime, explicit: explicitTime } = parseTime(withoutDate);
  const { durationMinutes, cleaned: withoutDuration } = parseDuration(withoutTime);

  const cleanTitle = withoutDuration
    .replace(/\b(잡아줘|등록해줘|추가해줘|만들어줘|잡기)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const finalHour = clampHour(hour);
  const finalMinute = minute ?? 0;
  let startAt: string | null = null;
  let endAt: string | null = null;

  if (finalHour !== null) {
    const startDate = set(date, {
      hours: finalHour,
      minutes: finalMinute,
      seconds: 0,
      milliseconds: 0
    });
    const endDate = new Date(startDate.getTime() + (durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60_000);
    startAt = fromPseudoLocalDate(startDate, offsetMinutes).toISOString();
    endAt = fromPseudoLocalDate(endDate, offsetMinutes).toISOString();
  } else {
    missingFields.push("startAt", "endAt");
    warnings.push("시작 시간이 없어 저장 전에 확인이 필요합니다.");
  }

  if (!cleanTitle) {
    missingFields.push("title");
  }

  if (inferredDate) {
    warnings.push("날짜 표현이 없어 오늘 기준으로 해석했습니다.");
  }

  if (finalHour !== null && !explicitTime) {
    warnings.push("시간대가 명확하지 않아 입력한 시각을 그대로 해석했습니다.");
  }

  const confidence: ParsedScheduleDraft["confidence"] =
    missingFields.length > 0 ? "low" : warnings.length > 0 ? "medium" : "high";

  return {
    title: cleanTitle,
    startAt,
    endAt,
    durationMinutes,
    priorityTagId: tagId,
    calendarId: DEFAULT_CALENDAR_ID,
    confidence,
    needsConfirmation: true,
    missingFields: Array.from(new Set(missingFields)),
    warnings,
    originalText
  };
}
