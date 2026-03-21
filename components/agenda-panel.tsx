"use client";

import { format, isSameDay, isSameWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { EventItem, TagItem, CalendarView } from "@/lib/types";

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
    <div className="hidden h-full overflow-auto p-4 md:block">
      <h2 className="mb-3 text-sm font-semibold">{view === "day" ? "Day View" : "Week View"}</h2>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          표시할 일정이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event) => {
            const tag = tags.find((item) => item.id === event.tagId);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="w-full rounded-xl border bg-card p-3 text-left shadow-soft transition hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">{event.title}</p>
                  <span className="text-xs" style={{ color: tag?.color ?? "#3b82f6" }}>
                    {tag?.name ?? "기타"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
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

