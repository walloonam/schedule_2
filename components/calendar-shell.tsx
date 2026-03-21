"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from "date-fns";
import { Plus, Search, X } from "lucide-react";
import { AgendaPanel } from "@/components/agenda-panel";
import { CalendarHeader } from "@/components/calendar-header";
import { CalendarSidebar } from "@/components/calendar-sidebar";
import { EventModal } from "@/components/event-modal";
import { MonthCalendar } from "@/components/month-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { initialCalendars, tags } from "@/lib/dummy-data";
import {
  createEvent,
  deleteEvent as removeEvent,
  listEvents,
  mapEventDraftToMutationInput,
  mapEventRecordToItem,
  toUserErrorMessage,
  updateEvent
} from "@/lib/events-api";
import { CalendarItem, CalendarView, EventDraft, EventItem } from "@/lib/types";

function moveDate(date: Date, view: CalendarView, dir: "prev" | "next") {
  const plus = dir === "next";
  if (view === "month") return plus ? addMonths(date, 1) : subMonths(date, 1);
  if (view === "week") return plus ? addWeeks(date, 1) : subWeeks(date, 1);
  return plus ? addDays(date, 1) : subDays(date, 1);
}

const availableTagIds = tags.map((tag) => tag.id);
const fallbackTagId = tags[0]?.id ?? "";

function getVisibleDateWindow(currentDate: Date, view: CalendarView) {
  if (view === "month") {
    return {
      start: startOfWeek(startOfMonth(currentDate)),
      end: endOfWeek(endOfMonth(currentDate))
    };
  }

  if (view === "week") {
    return {
      start: startOfWeek(currentDate),
      end: endOfWeek(currentDate)
    };
  }

  return {
    start: startOfDay(currentDate),
    end: endOfDay(currentDate)
  };
}

export function CalendarShell() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [calendars, setCalendars] = useState<CalendarItem[]>(initialCalendars);
  const [activeTags, setActiveTags] = useState<string[]>(tags.map((tag) => tag.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [remoteTotal, setRemoteTotal] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const visibleWindow = getVisibleDateWindow(currentDate, view);
      const result = await listEvents({
        q: searchQuery || undefined,
        startsFrom: (startsOn ? startOfDay(new Date(startsOn)) : visibleWindow.start).toISOString(),
        endsUntil: (endsOn ? endOfDay(new Date(endsOn)) : visibleWindow.end).toISOString()
      });
      const mappedEvents = result.items.map((record) =>
        mapEventRecordToItem(record, { availableTagIds, fallbackTagId })
      );
      setEvents(mappedEvents);
      setRemoteTotal(result.total);
    } catch (error) {
      setLoadError(toUserErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, endsOn, searchQuery, startsOn, view]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const visibleCalendarIds = useMemo(
    () => calendars.filter((calendar) => calendar.checked).map((calendar) => calendar.id),
    [calendars]
  );

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) => visibleCalendarIds.includes(event.calendarId) && activeTags.includes(event.tagId)
      ),
    [events, visibleCalendarIds, activeTags]
  );

  const activeFilterSummary = useMemo(() => {
    const summary: Array<{ key: string; label: string }> = [];

    if (searchQuery) {
      summary.push({ key: "search", label: `검색: ${searchQuery}` });
    }

    if (startsOn) {
      summary.push({ key: "startsOn", label: `시작: ${startsOn}` });
    }

    if (endsOn) {
      summary.push({ key: "endsOn", label: `종료: ${endsOn}` });
    }

    if (calendars.some((calendar) => !calendar.checked)) {
      summary.push({
        key: "calendar",
        label: `캘린더 ${calendars.filter((calendar) => calendar.checked).length}/${calendars.length}`
      });
    }

    if (activeTags.length !== tags.length) {
      summary.push({ key: "tag", label: `태그 ${activeTags.length}/${tags.length}` });
    }

    return summary;
  }, [activeTags.length, calendars, endsOn, searchQuery, startsOn]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const saveEvent = async (payload: EventDraft, eventId?: string) => {
    try {
      const input = mapEventDraftToMutationInput(payload);
      if (eventId) {
        await updateEvent(eventId, input);
      } else {
        await createEvent(input);
      }
      await fetchEvents();
      setEditingEvent(null);
      setModalOpen(false);
    } catch (error) {
      throw new Error(toUserErrorMessage(error));
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await removeEvent(eventId);
      await fetchEvents();
      setEditingEvent(null);
      setModalOpen(false);
    } catch (error) {
      throw new Error(toUserErrorMessage(error));
    }
  };

  const toggleCalendar = (calendarId: string) => {
    setCalendars((prev) =>
      prev.map((calendar) =>
        calendar.id === calendarId ? { ...calendar, checked: !calendar.checked } : calendar
      )
    );
  };

  const toggleTag = (tagId: string) => {
    setActiveTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  const resetAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStartsOn("");
    setEndsOn("");
    setCalendars(initialCalendars);
    setActiveTags(tags.map((tag) => tag.id));
  };

  const showGlobalEmpty = filteredEvents.length === 0;
  const visibleCalendarCount = calendars.filter((calendar) => calendar.checked).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="ambient-orb left-[-8rem] top-6 h-56 w-56 md:h-72 md:w-72" />
      <div className="ambient-orb bottom-[-7rem] right-[-3rem] h-48 w-48 md:h-72 md:w-72" />

      <div className="mx-auto max-w-[1760px] px-2 py-2 md:px-4 md:py-4">
        <div className="workspace-shell flex min-h-[calc(100vh-1rem)] overflow-hidden md:min-h-[calc(100vh-2rem)]">
          <CalendarSidebar
            calendars={calendars}
            tags={tags}
            activeTagIds={activeTags}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onToggleCalendar={toggleCalendar}
            onToggleTag={toggleTag}
            onCreate={openCreateModal}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <CalendarHeader
              currentDate={currentDate}
              view={view}
              visibleCalendarCount={visibleCalendarCount}
              activeTagCount={activeTags.length}
              onViewChange={setView}
              onToday={() => {
                setCurrentDate(new Date());
                setSelectedDate(new Date());
              }}
              onPrev={() => setCurrentDate((prev) => moveDate(prev, view, "prev"))}
              onNext={() => setCurrentDate((prev) => moveDate(prev, view, "next"))}
              onOpenMenu={() => setMenuOpen(true)}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((prev) => !prev)}
            />

            <section className="flex-1 overflow-auto px-4 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5">
              <div className="enter-rise space-y-4">
                <section className="glass-panel p-4 md:p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="editorial-kicker">Calendar</p>
                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">검색과 필터로 일정만 빠르게 탐색하세요.</h2>
                        <p className="mt-1 text-sm text-muted-foreground">이 화면에는 캘린더와 검색 도구만 남겨 작업 흐름을 단순하게 유지합니다.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="data-pill">{remoteTotal} fetched</span>
                        {activeFilterSummary.length > 0 ? (
                          <Button variant="outline" size="sm" onClick={resetAllFilters}>
                            전체 초기화
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)]">
                      <label className="space-y-2">
                        <span className="text-sm font-medium">검색</span>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="제목 또는 설명 검색"
                            className="pl-10"
                          />
                        </div>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium">시작일</span>
                        <Input type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium">종료일</span>
                        <Input type="date" value={endsOn} onChange={(event) => setEndsOn(event.target.value)} />
                      </label>
                    </div>

                    {activeFilterSummary.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {activeFilterSummary.map((item) => (
                          <span key={item.key} className="data-pill">
                            {item.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        현재 전체 일정이 표시되고 있습니다. 검색어나 날짜 조건을 넣어 범위를 좁혀보세요.
                      </p>
                    )}
                  </div>
                </section>

                {isLoading && events.length === 0 ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-44" />
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
                      {Array.from({ length: 14 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  </div>
                ) : loadError && events.length === 0 ? (
                  <div className="glass-panel flex h-full min-h-[360px] flex-col items-center justify-center rounded-[var(--radius-lg)] border border-destructive/30 p-8 text-center">
                    <h2 className="text-base font-semibold">일정 목록을 불러오지 못했습니다</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
                    <Button className="mt-4" onClick={() => void fetchEvents()}>
                      다시 시도
                    </Button>
                  </div>
                ) : showGlobalEmpty ? (
                  <div className="glass-panel flex h-full min-h-[360px] flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed p-8 text-center">
                    <h2 className="text-base font-semibold">조건에 맞는 일정이 없습니다</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      검색어나 날짜 범위를 조정하거나 전체 초기화로 다시 넓혀보세요.
                    </p>
                    {activeFilterSummary.length > 0 ? (
                      <Button variant="outline" className="mt-4" onClick={resetAllFilters}>
                        <X className="h-4 w-4" />
                        필터 초기화
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <>
                    {loadError ? (
                      <div className="mb-3 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
                        <p className="text-destructive">{loadError}</p>
                        <Button variant="outline" size="sm" onClick={() => void fetchEvents()}>
                          재시도
                        </Button>
                      </div>
                    ) : null}
                    {view === "month" ? (
                      <MonthCalendar
                        currentDate={currentDate}
                        events={filteredEvents}
                        tags={tags}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        onSelectEvent={openEditModal}
                      />
                    ) : (
                      <AgendaPanel
                        view={view}
                        currentDate={currentDate}
                        events={filteredEvents}
                        tags={tags}
                        onSelectEvent={openEditModal}
                      />
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <EventModal
        open={modalOpen}
        mode={editingEvent ? "edit" : "create"}
        editingEvent={editingEvent}
        tags={tags}
        calendars={calendars}
        onOpenChange={setModalOpen}
        onSave={saveEvent}
        onDelete={deleteEvent}
        defaultStart={selectedDate}
      />

      <Button
        size="icon"
        className="fixed bottom-5 right-5 z-30 rounded-full shadow-soft md:hidden"
        onClick={openCreateModal}
        aria-label="새 일정 추가"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </main>
  );
}
