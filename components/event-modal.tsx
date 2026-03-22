"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarItem, EventDraft, EventItem, TagItem } from "@/lib/types";
import { appDateTimeInputToIso, toAppDateInputValue, toAppDateTimeInputValue } from "@/lib/timezone";
import { cn } from "@/lib/utils";

type EventModalProps = {
  open: boolean;
  mode: "create" | "edit";
  editingEvent: EventItem | null;
  tags: TagItem[];
  calendars: CalendarItem[];
  onOpenChange: (open: boolean) => void;
  onSave: (payload: EventDraft, eventId?: string) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  defaultStart: Date;
};

export function EventModal({
  open,
  mode,
  editingEvent,
  tags,
  calendars,
  onOpenChange,
  onSave,
  onDelete,
  defaultStart
}: EventModalProps) {
  const selectClassName =
    "field-base appearance-none bg-background pr-10 disabled:cursor-not-allowed disabled:opacity-50";
  const compactFieldClassName = "min-h-10 px-3 py-2 text-[0.95rem] shadow-none";
  const compactSelectClassName = cn(selectClassName, compactFieldClassName);

  const initial = useMemo<EventDraft>(() => {
    if (editingEvent) {
      return {
        title: editingEvent.title,
        description: editingEvent.description,
        start: toAppDateTimeInputValue(editingEvent.start),
        end: toAppDateTimeInputValue(editingEvent.end),
        tagId: editingEvent.tagId,
        calendarId: editingEvent.calendarId,
        recurrenceEnabled: editingEvent.recurrence !== null,
        recurrenceFrequency: editingEvent.recurrence?.frequency ?? "none",
        recurrenceInterval: String(editingEvent.recurrence?.interval ?? 1),
        recurrenceUntil: editingEvent.recurrence?.until ? toAppDateInputValue(editingEvent.recurrence.until) : ""
      };
    }

    const start = defaultStart;
    const end = new Date(defaultStart.getTime() + 60 * 60 * 1000);

    return {
      title: "",
      description: "",
      start: toAppDateTimeInputValue(start),
      end: toAppDateTimeInputValue(end),
      tagId: tags[0]?.id ?? "",
      calendarId: calendars[0]?.id ?? "",
      recurrenceEnabled: false,
      recurrenceFrequency: "none",
      recurrenceInterval: "1",
      recurrenceUntil: ""
    };
  }, [editingEvent, defaultStart, tags, calendars]);

  const [draft, setDraft] = useState<EventDraft>(initial);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRecurrenceDetails, setShowRecurrenceDetails] = useState(initial.recurrenceEnabled);
  const isBusy = isSaving || isDeleting;

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setSubmitError(null);
      setIsSaving(false);
      setIsDeleting(false);
      setShowRecurrenceDetails(initial.recurrenceEnabled);
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;

    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  const update = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    if (isBusy) return;
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    if (isBusy || !draft.title.trim()) return;

    if (new Date(appDateTimeInputToIso(draft.start)).getTime() >= new Date(appDateTimeInputToIso(draft.end)).getTime()) {
      setSubmitError("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    try {
      setSubmitError(null);
      setIsSaving(true);
      await onSave(draft, editingEvent?.sourceEventId ?? editingEvent?.id);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "일정을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent || isBusy) return;

    try {
      setSubmitError(null);
      setIsDeleting(true);
      await onDelete(editingEvent.sourceEventId ?? editingEvent.id);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "일정을 삭제하지 못했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const recurrenceSummary = draft.recurrenceEnabled
    ? `매주 · ${draft.recurrenceInterval}주 간격${draft.recurrenceUntil ? ` · ${draft.recurrenceUntil}까지` : ""}`
    : "이번 일정만 저장";
  const selectedTag = tags.find((tag) => tag.id === draft.tagId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!top-2 !bottom-2 flex min-h-0 flex-col overflow-hidden sm:!top-4 sm:!bottom-4 sm:max-w-[40rem]">
        <DialogHeader className="shrink-0 border-b border-border/70 px-4 pb-2.5 pt-4 pr-14 sm:px-5 sm:pt-5">
          <DialogTitle>{mode === "create" ? "새 일정 추가" : "일정 수정"}</DialogTitle>
          <DialogDescription>핵심 정보만 빠르게 정리하고 저장합니다.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
          <div className="space-y-3 pb-1">
            <div className="space-y-1">
              <label htmlFor="event-title" className="text-sm font-medium">
                제목
              </label>
              <Input
                id="event-title"
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="예: 스프린트 회고"
                disabled={isBusy}
                className={compactFieldClassName}
              />
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="event-start" className="text-sm font-medium">
                  시작
                </label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={draft.start}
                  onChange={(e) => update("start", e.target.value)}
                  disabled={isBusy}
                  className={compactFieldClassName}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="event-end" className="text-sm font-medium">
                  종료
                </label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={draft.end}
                  onChange={(e) => update("end", e.target.value)}
                  disabled={isBusy}
                  className={compactFieldClassName}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="event-calendar" className="text-sm font-medium">
                  캘린더
                </label>
                <select
                  id="event-calendar"
                  value={draft.calendarId}
                  onChange={(e) => update("calendarId", e.target.value)}
                  disabled={isBusy}
                  className={compactSelectClassName}
                >
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">우선순위</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTag ? `선택됨: ${selectedTag.name}` : "이 일정의 우선순위를 고르세요."}
                    </p>
                  </div>
                  {selectedTag ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedTag.color }} />
                      {selectedTag.name}
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => update("tagId", tag.id)}
                      aria-pressed={draft.tagId === tag.id}
                      disabled={isBusy}
                      className={cn(
                        "flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        draft.tagId === tag.id
                          ? "border-foreground/20 bg-accent/70 text-foreground shadow-sm"
                          : "border-border/70 bg-background/70 text-muted-foreground hover:border-ring/30 hover:bg-accent/35 hover:text-foreground"
                      )}
                      aria-label={tag.name}
                    >
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="min-w-0 flex-1 truncate font-medium">{tag.name}</span>
                      {draft.tagId === tag.id ? <Check className="h-4 w-4 shrink-0 text-foreground" /> : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-border/70 bg-background/60 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">반복</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{recurrenceSummary}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2.5 text-muted-foreground"
                  onClick={() => setShowRecurrenceDetails((prev) => !prev)}
                >
                  {showRecurrenceDetails ? "접기" : "설정"}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", showRecurrenceDetails ? "rotate-180" : undefined)}
                  />
                </Button>
              </div>

              {showRecurrenceDetails ? (
                <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
                  <label className="flex items-center justify-between gap-3 rounded-[calc(var(--radius-md)-0.25rem)] bg-background/80 px-3 py-2 text-sm font-medium">
                    <span>반복 사용</span>
                    <input
                      type="checkbox"
                      checked={draft.recurrenceEnabled}
                      onChange={(event) => update("recurrenceEnabled", event.target.checked)}
                      disabled={isBusy}
                      className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>

                  {draft.recurrenceEnabled ? (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]">
                      <label className="space-y-1">
                        <span className="text-sm font-medium">주기</span>
                        <select
                          value={draft.recurrenceFrequency}
                          onChange={(event) =>
                            update("recurrenceFrequency", event.target.value as EventDraft["recurrenceFrequency"])
                          }
                          disabled={isBusy}
                          className={compactSelectClassName}
                        >
                          <option value="weekly">매주 반복</option>
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="text-sm font-medium">간격</span>
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          inputMode="numeric"
                          value={draft.recurrenceInterval}
                          onChange={(event) => update("recurrenceInterval", event.target.value)}
                          disabled={isBusy}
                          className={compactFieldClassName}
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-sm font-medium">종료일</span>
                        <Input
                          type="date"
                          value={draft.recurrenceUntil}
                          onChange={(event) => update("recurrenceUntil", event.target.value)}
                          disabled={isBusy}
                          className={compactFieldClassName}
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">이번 일정만 저장됩니다.</p>
                  )}

                  {editingEvent?.recurrence ? (
                    <p className="text-xs text-muted-foreground">반복 일정 수정은 현재 시리즈 전체에 적용됩니다.</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="event-description" className="text-sm font-medium">
                  설명
                </label>
                <span className="text-xs text-muted-foreground">선택</span>
              </div>
              <Textarea
                id="event-description"
                value={draft.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="참여자, 준비물, 체크사항"
                disabled={isBusy}
                className="min-h-[88px] max-h-28 resize-none px-3 py-2 text-[0.95rem] leading-5 shadow-none"
              />
            </div>

            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/70 bg-card/98 px-4 py-2.5 sm:justify-between sm:px-5">
          {mode === "edit" && editingEvent ? (
            <Button size="sm" variant="destructive" onClick={() => void handleDelete()} disabled={isBusy}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          ) : (
            <div />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
              취소
            </Button>
            <Button size="sm" onClick={() => void submit()} disabled={isBusy || !draft.title.trim()}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
