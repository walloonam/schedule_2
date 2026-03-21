"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Menu, MoonStar, SunMedium } from "lucide-react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/lib/types";
import { cn } from "@/lib/utils";

type CalendarHeaderProps = {
  currentDate: Date;
  view: CalendarView;
  visibleCalendarCount: number;
  activeTagCount: number;
  onViewChange: (view: CalendarView) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenMenu: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
};

const views: CalendarView[] = ["day", "week", "month"];
const viewLabels: Record<CalendarView, string> = {
  day: "일",
  week: "주",
  month: "월"
};

function getHeaderTitle(currentDate: Date, view: CalendarView) {
  if (view === "month") {
    return format(currentDate, "yyyy년 M월", { locale: ko });
  }

  if (view === "week") {
    const start = startOfWeek(currentDate, { locale: ko });
    const end = endOfWeek(currentDate, { locale: ko });
    return `${format(start, "M월 d일", { locale: ko })} - ${format(end, "M월 d일", { locale: ko })}`;
  }

  return format(currentDate, "M월 d일 EEEE", { locale: ko });
}

export function CalendarHeader({
  currentDate,
  view,
  visibleCalendarCount,
  activeTagCount,
  onViewChange,
  onToday,
  onPrev,
  onNext,
  onOpenMenu,
  darkMode,
  onToggleDarkMode
}: CalendarHeaderProps) {
  const filterCount = visibleCalendarCount + activeTagCount;

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-card/60 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:min-w-0 xl:flex-1">
          <div className="min-w-0">
            <p className="editorial-kicker">Live workspace · {viewLabels[view]} 보기</p>
            <h1 className="mt-1 truncate text-lg font-semibold tracking-[-0.03em] md:text-[1.9rem]">
              {getHeaderTitle(currentDate, view)}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onToday}>
              오늘
            </Button>
            <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1">
              <Button variant="ghost" size="icon" onClick={onPrev} aria-label="이전 기간">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onNext} aria-label="다음 기간">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/70 p-1">
            {views.map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                onClick={() => onViewChange(item)}
                aria-pressed={view === item}
                className={cn(
                  "min-w-[3rem] rounded-full px-3 capitalize",
                  view === item && "bg-secondary text-foreground shadow-sm hover:bg-secondary"
                )}
              >
                {viewLabels[item]}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMenu}
            aria-label={`캘린더 메뉴 열기. 캘린더 ${visibleCalendarCount}개와 태그 ${activeTagCount}개가 활성화되어 있습니다.`}
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">캘린더 메뉴</span>
            <span className="sm:hidden">메뉴</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
              {filterCount}
            </span>
          </Button>

          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground md:flex">
            <CalendarDays className="h-3.5 w-3.5" />
            캘린더 {visibleCalendarCount}개
          </div>

          <Button variant="outline" size="icon" onClick={onToggleDarkMode} aria-label="다크 모드 전환">
            {darkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
