"use client";

import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventItem, TagItem } from "@/lib/types";

type MobileAgendaListProps = {
  date: Date;
  events: EventItem[];
  tags: TagItem[];
  onSelectEvent: (event: EventItem) => void;
};

export function MobileAgendaList({ date, events, tags, onSelectEvent }: MobileAgendaListProps) {
  const list = events
    .filter((event) => isSameDay(new Date(event.start), date))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

  if (!list.length) {
    return (
      <div className="glass-panel rounded-[var(--radius-lg)] p-5 text-center md:hidden">
        <p className="text-sm font-medium">선택한 날짜에 일정이 없습니다</p>
        <p className="mt-1 text-xs text-muted-foreground">상단 버튼으로 새 일정을 추가해보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      <div className="px-1">
        <p className="editorial-kicker">Mobile agenda</p>
        <h2 className="mt-1 text-base font-semibold tracking-[-0.02em]">
          {format(date, "M월 d일 (EEE)", { locale: ko })}
        </h2>
      </div>

      <div className="space-y-2">
        {list.map((event) => {
          const tag = tags.find((item) => item.id === event.tagId);
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelectEvent(event)}
              className="glass-panel w-full rounded-[var(--radius-lg)] p-4 text-left transition duration-200 hover:border-primary/25 hover:bg-card/86 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-semibold tracking-[-0.02em]">{event.title}</p>
                  {event.recurrence ? <Repeat className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
                </div>
                <Badge style={{ backgroundColor: `${tag?.color ?? "#3b82f6"}22`, color: tag?.color ?? "#3b82f6" }}>
                  {tag?.name ?? "기타"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
