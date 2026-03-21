"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from "date-fns";
import { Plus } from "lucide-react";
import { CalendarHeader } from "@/components/calendar-header";
import { CalendarSidebar } from "@/components/calendar-sidebar";
import { DailyBriefing } from "@/components/daily-briefing";
import { MonthCalendar } from "@/components/month-calendar";
import { EventModal } from "@/components/event-modal";
import { MobileAgendaList } from "@/components/mobile-agenda-list";
import { AgendaPanel } from "@/components/agenda-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await listEvents();
      const mappedEvents = result.items.map((record) =>
        mapEventRecordToItem(record, { availableTagIds, fallbackTagId })
      );
      setEvents(mappedEvents);
    } catch (error) {
      setLoadError(toUserErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const showGlobalEmpty = filteredEvents.length === 0;
  const mobileDate = view === "month" ? selectedDate : currentDate;
  const visibleCalendarCount = calendars.filter((calendar) => calendar.checked).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex h-screen max-w-[1680px] overflow-hidden rounded-none border border-border/70 bg-card/40 lg:my-4 lg:h-[calc(100vh-2rem)] lg:rounded-2xl lg:shadow-soft">
        <CalendarSidebar
          calendars={calendars}
          tags={tags}
          activeTagIds={activeTags}
          mobileOpen={mobileFiltersOpen}
          onMobileOpenChange={setMobileFiltersOpen}
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
            onOpenFilters={() => setMobileFiltersOpen(true)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          />

          <section className="flex-1 overflow-auto p-4 md:p-5">
            <DailyBriefing mode="compact" className="mb-4" />

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
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-card p-8 text-center">
                <h2 className="text-base font-semibold">일정 목록을 불러오지 못했습니다</h2>
                <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
                <Button className="mt-4" onClick={() => void fetchEvents()}>
                  다시 시도
                </Button>
              </div>
            ) : showGlobalEmpty ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center">
                <h2 className="text-base font-semibold">조건에 맞는 일정이 없습니다</h2>
                <p className="mt-1 text-sm text-muted-foreground">필터를 해제하거나 새 일정을 추가해보세요.</p>
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
                <MobileAgendaList
                  date={mobileDate}
                  events={filteredEvents}
                  tags={tags}
                  onSelectEvent={openEditModal}
                />
              </>
            )}
          </section>
        </div>
      </div>

      <Button
        size="icon"
        className="fixed bottom-5 right-5 z-30 rounded-full shadow-soft md:hidden"
        onClick={openCreateModal}
        aria-label="새 일정 추가"
      >
        <Plus className="h-5 w-5" />
      </Button>

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
    </main>
  );
}
