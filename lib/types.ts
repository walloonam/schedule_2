export type CalendarItem = {
  id: string;
  name: string;
  color: string;
  checked: boolean;
};

export type TagItem = {
  id: string;
  name: string;
  color: string;
};

export type EventItem = {
  id: string;
  sourceEventId: string;
  title: string;
  description: string;
  start: string;
  end: string;
  tagId: string;
  calendarId: string;
  recurrence: EventRecurrence | null;
};

export type CalendarView = "day" | "week" | "month";

export type EventDraft = {
  title: string;
  description: string;
  start: string;
  end: string;
  tagId: string;
  calendarId: string;
  recurrenceEnabled: boolean;
  recurrenceFrequency: "none" | "weekly";
  recurrenceInterval: string;
  recurrenceUntil: string;
};

export type EventStatus = "confirmed" | "tentative" | "cancelled";

export type EventRecurrence = {
  frequency: "weekly";
  interval: number;
  until: string | null;
};

export type EventRecord = {
  id: string;
  sourceEventId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  calendarId: string;
  tagIds: string[];
  status: EventStatus;
  recurrence: EventRecurrence | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type EventListResult = {
  items: EventRecord[];
  total: number;
  limit: number;
  offset: number;
};

export type EventListQueryParams = {
  q?: string;
  startsFrom?: string;
  endsUntil?: string;
  calendarId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
};

export type EventMutationInput = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  calendarId: string;
  tagIds: string[];
  status: EventStatus;
  recurrence: EventRecurrence | null;
};

export type ApiErrorDetail = {
  path: string;
  message: string;
  code: string;
};

export type ParsedScheduleDraft = {
  title: string;
  startAt: string | null;
  endAt: string | null;
  durationMinutes: number | null;
  priorityTagId: string | null;
  calendarId: string | null;
  confidence: "high" | "medium" | "low";
  needsConfirmation: boolean;
  missingFields: Array<"title" | "startAt" | "endAt">;
  warnings: string[];
  originalText: string;
};
