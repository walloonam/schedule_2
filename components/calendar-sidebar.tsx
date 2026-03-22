"use client";

import { CalendarDays, Check, Plus, Tag } from "lucide-react";
import { Badge, chipButtonVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { CalendarItem, TagItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type CalendarSidebarProps = {
  calendars: CalendarItem[];
  tags: TagItem[];
  activeTagIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleCalendar: (calendarId: string) => void;
  onToggleTag: (tagId: string) => void;
  onCreate: () => void;
};

function contrastText(hex: string) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((chunk) => chunk + chunk).join("") : raw;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#111827" : "#ffffff";
}

function SidebarContent({
  calendars,
  tags,
  activeTagIds,
  onToggleCalendar,
  onToggleTag,
  onCreate
}: Omit<CalendarSidebarProps, "open" | "onOpenChange">) {
  const activeCalendarCount = calendars.filter((calendar) => calendar.checked).length;
  const activeTagCount = activeTagIds.length;

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="space-y-4">
          <div>
            <p className="editorial-kicker">Calendar menu</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">캘린더 작업면</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              메뉴 패널에서 표시할 캘린더와 태그를 조정하고, 새 일정을 바로 추가할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[var(--radius-md)] border border-border/60 bg-background/70 px-3 py-3">
              <p className="editorial-kicker">캘린더</p>
              <p className="mt-2 text-base font-semibold">
                {activeCalendarCount}/{calendars.length}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border/60 bg-background/70 px-3 py-3">
              <p className="editorial-kicker">태그</p>
              <p className="mt-2 text-base font-semibold">
                {activeTagCount}/{tags.length}
              </p>
            </div>
          </div>
        </div>

        <Button className="w-full justify-start rounded-[var(--radius-md)]" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          일정 추가
        </Button>
      </div>

      <section aria-labelledby="calendar-filter-heading" className="space-y-3 border-t border-border/60 pt-6">
        <div className="flex items-center justify-between gap-2 px-1">
          <h2
            id="calendar-filter-heading"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            캘린더
          </h2>
          <Badge variant="outline" size="sm">
            {activeCalendarCount}/{calendars.length}
          </Badge>
        </div>

        <div className="space-y-2">
          {calendars.map((calendar) => (
            <button
              key={calendar.id}
              type="button"
              onClick={() => onToggleCalendar(calendar.id)}
              aria-pressed={calendar.checked}
              className={cn(
                "ui-interactive flex min-h-11 w-full items-center justify-between rounded-[var(--radius-md)] border px-3 py-2.5 text-left shadow-sm transition-all duration-200",
                calendar.checked
                  ? "border-primary/15 bg-primary/5 text-foreground"
                  : "border-transparent bg-transparent text-muted-foreground hover:bg-accent/50"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: calendar.color }} aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium">{calendar.name}</span>
                  <span className="block text-xs text-muted-foreground">{calendar.checked ? "표시 중" : "숨김"}</span>
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                  calendar.checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-transparent"
                )}
                aria-hidden="true"
              >
                <Check className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="tag-filter-heading" className="space-y-3 border-t border-border/60 pt-6">
        <div className="flex items-center justify-between gap-2 px-1">
          <h2
            id="tag-filter-heading"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <Tag className="h-3.5 w-3.5" />
            우선순위 필터
          </h2>
          <Badge variant="outline" size="sm">
            {activeTagCount}/{tags.length}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = activeTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleTag(tag.id)}
                aria-pressed={active}
                className={cn(chipButtonVariants({ active, size: "sm" }), "gap-2")}
                style={
                  active
                    ? {
                        backgroundColor: tag.color,
                        color: contrastText(tag.color)
                      }
                    : {
                        backgroundColor: `${tag.color}14`,
                        borderColor: `${tag.color}44`,
                        color: tag.color
                      }
                }
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: active ? contrastText(tag.color) : tag.color }}
                  aria-hidden="true"
                />
                {tag.name}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function CalendarSidebar({
  calendars,
  tags,
  activeTagIds,
  open,
  onOpenChange,
  onToggleCalendar,
  onToggleTag,
  onCreate
}: CalendarSidebarProps) {
  const handleCreate = () => {
    onCreate();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100vw-1rem,30rem)] p-0 sm:w-[min(92vw,30rem)] lg:left-4 lg:top-4 lg:bottom-4 lg:h-[calc(100dvh-2rem)] lg:w-[min(100vw-2rem,31rem)] lg:max-w-none lg:-translate-x-0 lg:-translate-y-0 lg:rounded-[1.75rem]">
        <DialogHeader className="border-b border-border/70 px-5 pb-4 pt-5 pr-14">
          <DialogTitle>캘린더 메뉴</DialogTitle>
          <DialogDescription>
            캘린더 표시와 우선순위 필터를 여기서 빠르게 조정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto px-4 py-4">
          <SidebarContent
            calendars={calendars}
            tags={tags}
            activeTagIds={activeTagIds}
            onToggleCalendar={onToggleCalendar}
            onToggleTag={onToggleTag}
            onCreate={handleCreate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
