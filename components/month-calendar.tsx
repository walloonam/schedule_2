"use client";

import {
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday
} from "date-fns";
import { ko } from "date-fns/locale";
import { EventItem, TagItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type MonthCalendarProps = {
  currentDate: Date;
  events: EventItem[];
  tags: TagItem[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: EventItem) => void;
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function eventsOfDay(date: Date, events: EventItem[]) {
  return events
    .filter((event) => isSameDay(new Date(event.start), date))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
}

export function MonthCalendar({
  currentDate,
  events,
  tags,
  selectedDate,
  onSelectDate,
  onSelectEvent
}: MonthCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="hidden h-full flex-col md:flex">
      <div className="grid grid-cols-7 border-b bg-card">
        {weekdays.map((label) => (
          <div key={label} className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
            {label}
          </div>
        ))}
      </div>

      <div className="grid h-full grid-cols-7 gap-px bg-border">
        {days.map((date) => {
          const dayEvents = eventsOfDay(date, events);
          const visible = dayEvents.slice(0, 3);
          const hiddenCount = Math.max(0, dayEvents.length - visible.length);

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "group flex min-h-[130px] flex-col bg-background p-2 text-left transition-colors",
                !isSameMonth(date, monthStart) && "bg-muted/45 text-muted-foreground",
                isSameDay(date, selectedDate) && "bg-accent/60",
                isToday(date) && "ring-1 ring-primary/60"
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDate(date)}
                className="mb-2 flex items-center justify-between rounded-md px-1 py-0.5 text-left hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday(date) && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(date, "d", { locale: ko })}
                </span>
                {dayEvents.length > 3 ? <span className="text-[10px] text-muted-foreground">밀집</span> : null}
              </button>

              <div className="space-y-1">
                {visible.map((event) => {
                  const tag = tags.find((item) => item.id === event.tagId);
                  return (
                    <button
                      type="button"
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className="w-full truncate rounded-md px-2 py-1 text-left text-xs transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{
                        backgroundColor: `${tag?.color ?? "#3b82f6"}22`,
                        borderLeft: `3px solid ${tag?.color ?? "#3b82f6"}`
                      }}
                    >
                      <p className="truncate font-medium">{event.title}</p>
                      <p className="text-[11px] text-muted-foreground">{format(new Date(event.start), "HH:mm")}</p>
                    </button>
                  );
                })}
                {hiddenCount > 0 ? (
                  <p className="px-1 text-xs font-medium text-muted-foreground">+{hiddenCount} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

