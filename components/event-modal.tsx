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
  const initial = useMemo<EventDraft>(() => {
    if (editingEvent) {
      return {
        title: editingEvent.title,
        description: editingEvent.description,
        start: toLocalInputValue(new Date(editingEvent.start)),
        end: toLocalInputValue(new Date(editingEvent.end)),
        tagId: editingEvent.tagId,
        calendarId: editingEvent.calendarId
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
      calendarId: calendars[0]?.id ?? ""
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
      await onSave(draft, editingEvent?.id);
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
      await onDelete(editingEvent.id);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "일정을 삭제하지 못했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "새 일정 추가" : "일정 수정"}</DialogTitle>
          <DialogDescription>제목, 시간, 설명, 태그를 설정하고 저장하세요.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
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
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="event-calendar" className="text-sm font-medium">
                캘린더
              </label>
              <select
                id="event-calendar"
                value={draft.calendarId}
                onChange={(e) => update("calendarId", e.target.value)}
                disabled={isBusy}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {calendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">태그 색상</p>
              <div className="flex gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => update("tagId", tag.id)}
                    aria-pressed={draft.tagId === tag.id}
                    disabled={isBusy}
                    className="h-8 w-8 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: tag.color,
                      borderColor: draft.tagId === tag.id ? "hsl(var(--foreground))" : "transparent"
                    }}
                    aria-label={tag.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="event-description" className="text-sm font-medium">
              설명
            </label>
            <Textarea
              id="event-description"
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="참여자, 준비물, 체크사항 등을 적어주세요."
              disabled={isBusy}
            />
          </div>

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </div>

        <DialogFooter>
          {mode === "edit" && editingEvent ? (
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={isBusy}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
            취소
          </Button>
          <Button onClick={() => void submit()} disabled={isBusy || !draft.title.trim()}>
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

