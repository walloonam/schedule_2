import { endOfDay, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isSameWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

export const APP_TIME_ZONE = "Asia/Seoul";
export const APP_TIME_ZONE_OFFSET_MINUTES = 9 * 60;

const APP_TIME_ZONE_OFFSET_MS = APP_TIME_ZONE_OFFSET_MINUTES * 60_000;

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function toAppWallTime(value: Date | string) {
  return new Date(toDate(value).getTime() + APP_TIME_ZONE_OFFSET_MS);
}

export function fromAppWallTime(value: Date | string) {
  return new Date(toDate(value).getTime() - APP_TIME_ZONE_OFFSET_MS);
}

export function formatInAppTimeZone(value: Date | string, pattern: string, options?: Parameters<typeof format>[2]) {
  return format(toAppWallTime(value), pattern, {
    locale: ko,
    ...(options ?? {})
  });
}

export function isSameAppDay(left: Date | string, right: Date | string) {
  return isSameDay(toAppWallTime(left), toAppWallTime(right));
}

export function isSameAppWeek(left: Date | string, right: Date | string) {
  return isSameWeek(toAppWallTime(left), toAppWallTime(right), { locale: ko });
}

export function isSameAppMonth(left: Date | string, right: Date | string) {
  return isSameMonth(toAppWallTime(left), toAppWallTime(right));
}

export function isAppToday(value: Date | string) {
  return isSameAppDay(value, new Date());
}

export function startOfAppDay(value: Date | string) {
  return fromAppWallTime(startOfDay(toAppWallTime(value)));
}

export function endOfAppDay(value: Date | string) {
  return fromAppWallTime(endOfDay(toAppWallTime(value)));
}

export function startOfAppWeek(value: Date | string) {
  return fromAppWallTime(startOfWeek(toAppWallTime(value), { locale: ko }));
}

export function endOfAppWeek(value: Date | string) {
  return fromAppWallTime(endOfWeek(toAppWallTime(value), { locale: ko }));
}

export function startOfAppMonth(value: Date | string) {
  return fromAppWallTime(startOfMonth(toAppWallTime(value)));
}

export function endOfAppMonth(value: Date | string) {
  return fromAppWallTime(endOfMonth(toAppWallTime(value)));
}

export function toAppDateTimeInputValue(value: Date | string) {
  return toAppWallTime(value).toISOString().slice(0, 16);
}

export function toAppDateInputValue(value: Date | string) {
  return toAppWallTime(value).toISOString().slice(0, 10);
}

export function appDateTimeInputToIso(value: string) {
  return fromAppWallTime(`${value}:00Z`).toISOString();
}

export function appDateInputToStartOfDayIso(value: string) {
  return startOfAppDay(`${value}T00:00:00Z`).toISOString();
}

export function appDateInputToEndOfDayIso(value: string) {
  return endOfAppDay(`${value}T00:00:00Z`).toISOString();
}

export function getAppNowWithOffsetString(now: Date = new Date()) {
  const wallTime = toAppWallTime(now);
  return `${wallTime.toISOString().slice(0, 19)}+09:00`;
}
