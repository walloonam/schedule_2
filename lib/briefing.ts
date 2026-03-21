import { endOfDay, startOfDay } from "date-fns";
import { EventItem } from "@/lib/types";

const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = 60_000;
const HIGH_RISK_WINDOW_HOURS = 4;
const FOCUS_BLOCK_MINUTES = 90;

export type FocusBlock = {
  start: string;
  end: string;
  durationMinutes: number;
};

export type DailyBriefingSummary = {
  todayEvents: EventItem[];
  totalCount: number;
  highRiskEvents: EventItem[];
  firstUpcomingEvent: EventItem | null;
  minutesUntilFirstEvent: number | null;
  focusBlocks: FocusBlock[];
};

function sortByStart(left: EventItem, right: EventItem) {
  return new Date(left.start).getTime() - new Date(right.start).getTime();
}

export function getTodayEvents(events: EventItem[], now: Date = new Date()) {
  const dayStart = startOfDay(now).getTime();
  const dayEnd = endOfDay(now).getTime();

  return events
    .filter((event) => {
      const start = new Date(event.start).getTime();
      const end = new Date(event.end).getTime();
      return start <= dayEnd && end >= dayStart;
    })
    .sort(sortByStart);
}

function buildFocusBlocks(todayEvents: EventItem[], now: Date) {
  const blocks: FocusBlock[] = [];
  const minimumGap = FOCUS_BLOCK_MINUTES * MS_PER_MINUTE;
  const endOfToday = endOfDay(now).getTime();
  let cursor = Math.max(now.getTime(), startOfDay(now).getTime());

  for (const event of todayEvents) {
    const start = new Date(event.start).getTime();
    const end = new Date(event.end).getTime();

    if (end <= cursor) {
      continue;
    }

    if (start - cursor >= minimumGap) {
      blocks.push({
        start: new Date(cursor).toISOString(),
        end: new Date(cursor + minimumGap).toISOString(),
        durationMinutes: FOCUS_BLOCK_MINUTES
      });
    }

    cursor = Math.max(cursor, end);
  }

  if (endOfToday - cursor >= minimumGap) {
    blocks.push({
      start: new Date(cursor).toISOString(),
      end: new Date(cursor + minimumGap).toISOString(),
      durationMinutes: FOCUS_BLOCK_MINUTES
    });
  }

  return blocks;
}

export function createDailyBriefing(events: EventItem[], now: Date = new Date()): DailyBriefingSummary {
  const todayEvents = getTodayEvents(events, now);
  const nowTime = now.getTime();
  const highRiskBoundary = nowTime + HIGH_RISK_WINDOW_HOURS * MINUTES_PER_HOUR * MS_PER_MINUTE;

  const firstUpcomingEvent =
    todayEvents.find((event) => new Date(event.start).getTime() >= nowTime) ?? null;

  return {
    todayEvents,
    totalCount: todayEvents.length,
    highRiskEvents: todayEvents.filter((event) => {
      const start = new Date(event.start).getTime();
      return start >= nowTime && start <= highRiskBoundary;
    }),
    firstUpcomingEvent,
    minutesUntilFirstEvent: firstUpcomingEvent
      ? Math.max(0, Math.ceil((new Date(firstUpcomingEvent.start).getTime() - nowTime) / MS_PER_MINUTE))
      : null,
    focusBlocks: buildFocusBlocks(todayEvents, now)
  };
}

export function formatRelativeMinutes(minutes: number | null) {
  if (minutes === null) {
    return "남은 일정 없음";
  }

  if (minutes <= 0) {
    return "곧 시작";
  }

  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes}분 후`;
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const restMinutes = minutes % MINUTES_PER_HOUR;
  return restMinutes === 0 ? `${hours}시간 후` : `${hours}시간 ${restMinutes}분 후`;
}
