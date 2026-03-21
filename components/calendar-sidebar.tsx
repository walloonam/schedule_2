"use client";

import { Check, CalendarDays, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, chipButtonVariants } from "@/components/ui/badge";
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
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
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
}: Omit<CalendarSidebarProps, "mobileOpen" | "onMobileOpenChange">) {
  const activeCalendarCount = calendars.filter((calendar) => calendar.checked).length;
  const activeTagCount = activeTagIds.length;

  return (
    <div className="space-y-6">
      <Button className="w-full justify-start rounded-[var(--radius-md)]" onClick={onCreate}>
        <Plus className="h-4 w-4" />
        일정 추가
      </Button>

      <section aria-labelledby="calendar-filter-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 id="calendar-filter-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                "ui-interactive flex min-h-11 w-full items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-left shadow-sm",
                calendar.checked
                  ? "border-primary/15 bg-primary/5 text-foreground"
                  : "border-transparent bg-transparent text-muted-foreground hover:bg-accent/70"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: calendar.color }} aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium">{calendar.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {calendar.checked ? "표시 중" : "숨김"}
                  </span>
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                  calendar.checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-transparent"
                )}
                aria-hidden="true"
              >
                <Check className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="tag-filter-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 id="tag-filter-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            태그 필터
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
  mobileOpen,
  onMobileOpenChange,
  onToggleCalendar,
  onToggleTag,
  onCreate
}: CalendarSidebarProps) {
  const handleCreate = () => {
    onCreate();
    onMobileOpenChange(false);
  };

  return (
    <>
      <aside
        className="hidden w-[300px] shrink-0 border-r border-border/70 bg-card/75 px-4 py-5 backdrop-blur-sm lg:block"
        aria-label="캘린더 필터 사이드바"
      >
        <SidebarContent
          calendars={calendars}
          tags={tags}
          activeTagIds={activeTagIds}
          onToggleCalendar={onToggleCalendar}
          onToggleTag={onToggleTag}
          onCreate={onCreate}
        />
      </aside>

      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent className="lg:hidden">
          <DialogHeader className="border-b border-border/70 px-5 pb-4 pt-5">
            <DialogTitle>필터 및 캘린더</DialogTitle>
            <DialogDescription>
              모바일에서는 표시할 캘린더와 태그를 패널에서 빠르게 전환할 수 있습니다.
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
    </>
  );
}
