"use client";

import { format, isSameDay, isSameWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { Repeat } from "lucide-react";
import { CalendarView, EventItem, TagItem } from "@/lib/types";

type AgendaPanelProps = {
  view: CalendarView;
  currentDate: Date;
  events: EventItem[];
  tags: TagItem[];
  onSelectEvent: (event: EventItem) => void;
};

export function AgendaPanel({ view, currentDate, events, tags, onSelectEvent }: AgendaPanelProps) {
  const filtered = events
    .filter((event) => {
      const start = new Date(event.start);
      if (view === "day") return isSameDay(start, currentDate);
      return isSameWeek(start, currentDate);
    })
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

  return (
    <div className="hidden h-full overflow-auto md:block">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <p className="editorial-kicker">Agenda lane</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
            {view === "day" ? "하루 흐름" : "이번 주 흐름"}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} items</p>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel rounded-[var(--radius-lg)] border border-dashed p-8 text-center text-sm text-muted-foreground">
          표시할 일정이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const tag = tags.find((item) => item.id === event.tagId);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="glass-panel w-full rounded-[var(--radius-lg)] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card/86 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-base font-semibold tracking-[-0.02em]">{event.title}</p>
                    {event.recurrence ? <Repeat className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: tag?.color ?? "#3b82f6" }}>
                    {tag?.name ?? "기타"}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {format(new Date(event.start), "M월 d일 (EEE) HH:mm", { locale: ko })}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
