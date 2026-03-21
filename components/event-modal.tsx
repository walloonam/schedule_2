"use client";

import { useEffect, useMemo, useState } from "react";
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

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toLocalDateValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

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

  const initial = useMemo<EventDraft>(() => {
    if (editingEvent) {
      return {
        title: editingEvent.title,
        description: editingEvent.description,
        start: toLocalInputValue(new Date(editingEvent.start)),
        end: toLocalInputValue(new Date(editingEvent.end)),
        tagId: editingEvent.tagId,
        calendarId: editingEvent.calendarId,
        recurrenceEnabled: editingEvent.recurrence !== null,
        recurrenceFrequency: editingEvent.recurrence?.frequency ?? "none",
        recurrenceInterval: String(editingEvent.recurrence?.interval ?? 1),
        recurrenceUntil: toLocalDateValue(editingEvent.recurrence?.until ?? null)
      };
    }

    const start = defaultStart;
    const end = new Date(defaultStart.getTime() + 60 * 60 * 1000);

    return {
      title: "",
      description: "",
      start: toLocalInputValue(start),
      end: toLocalInputValue(end),
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
  const isBusy = isSaving || isDeleting;

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setSubmitError(null);
      setIsSaving(false);
      setIsDeleting(false);
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

    if (new Date(draft.start).getTime() >= new Date(draft.end).getTime()) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!top-3 !bottom-3 flex min-h-0 flex-col overflow-hidden sm:!top-6 sm:!bottom-6 sm:max-w-[42rem]">
        <DialogHeader className="shrink-0 border-b border-border/70 px-5 pb-3.5 pt-5 pr-14 sm:px-6 sm:pt-6">
          <DialogTitle>{mode === "create" ? "새 일정 추가" : "일정 수정"}</DialogTitle>
          <DialogDescription>제목, 시간, 설명, 태그를 설정하고 저장하세요.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3.5 sm:px-6 sm:py-4">
          <div className="space-y-4 pb-1">
            <div className="space-y-1.5">
              <label htmlFor="event-title" className="text-sm font-medium">
                제목
              </label>
              <Input
                id="event-title"
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="예: 스프린트 회고"
                disabled={isBusy}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="event-start" className="text-sm font-medium">
                  시작
                </label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={draft.start}
                  onChange={(e) => update("start", e.target.value)}
                  disabled={isBusy}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="event-end" className="text-sm font-medium">
                  종료
                </label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={draft.end}
                  onChange={(e) => update("end", e.target.value)}
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="space-y-1.5">
                <label htmlFor="event-calendar" className="text-sm font-medium">
                  캘린더
                </label>
                <select
                  id="event-calendar"
                  value={draft.calendarId}
                  onChange={(e) => update("calendarId", e.target.value)}
                  disabled={isBusy}
                  className={selectClassName}
                >
                  {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium">태그 색상</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => update("tagId", tag.id)}
                      aria-pressed={draft.tagId === tag.id}
                      disabled={isBusy}
                      className="h-9 w-9 rounded-full border border-border/70 transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: tag.color,
                        boxShadow:
                          draft.tagId === tag.id
                            ? "0 0 0 2px hsl(var(--card)), 0 0 0 4px hsl(var(--foreground) / 0.9)"
                            : undefined
                      }}
                      aria-label={tag.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-border/70 bg-background/60 p-3 sm:p-3.5">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">반복</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      정기 회의처럼 같은 요일에 반복되는 일정을 한 번에 관리합니다.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={draft.recurrenceEnabled}
                      onChange={(event) => update("recurrenceEnabled", event.target.checked)}
                      disabled={isBusy}
                      className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    반복 사용
                  </label>
                </div>

                {draft.recurrenceEnabled ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)]">
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium">주기</span>
                      <select
                        value={draft.recurrenceFrequency}
                        onChange={(event) => update("recurrenceFrequency", event.target.value as EventDraft["recurrenceFrequency"])}
                        disabled={isBusy}
                        className={selectClassName}
                      >
                        <option value="weekly">매주 반복</option>
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium">간격</span>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        inputMode="numeric"
                        value={draft.recurrenceInterval}
                        onChange={(event) => update("recurrenceInterval", event.target.value)}
                        disabled={isBusy}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium">반복 종료일</span>
                      <Input
                        type="date"
                        value={draft.recurrenceUntil}
                        onChange={(event) => update("recurrenceUntil", event.target.value)}
                        disabled={isBusy}
                      />
                    </label>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">이번 일정만 한 번 저장됩니다.</p>
                )}

                {editingEvent?.recurrence ? (
                  <p className="text-xs text-muted-foreground">반복 일정 수정은 현재 시리즈 전체에 적용됩니다.</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-description" className="text-sm font-medium">
                설명
              </label>
              <Textarea
                id="event-description"
                value={draft.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="참여자, 준비물, 체크사항 등을 적어주세요."
                disabled={isBusy}
                className="min-h-[112px] sm:min-h-[136px]"
              />
            </div>

            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/70 bg-card/98 px-5 py-3 sm:justify-between sm:px-6">
          {mode === "edit" && editingEvent ? (
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={isBusy}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          ) : (
            <div />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
              취소
            </Button>
            <Button onClick={() => void submit()} disabled={isBusy || !draft.title.trim()}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
