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
  title: string;
  description: string;
  start: string;
  end: string;
  tagId: string;
  calendarId: string;
};

export type CalendarView = "day" | "week" | "month";

export type EventDraft = {
  title: string;
  description: string;
  start: string;
  end: string;
  tagId: string;
  calendarId: string;
};

export type EventStatus = "confirmed" | "tentative" | "cancelled";

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  calendarId: string;
  tagIds: string[];
  status: EventStatus;
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

export type EventMutationInput = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  calendarId: string;
  tagIds: string[];
  status: EventStatus;
};

export type ApiErrorDetail = {
  path: string;
  message: string;
  code: string;
};

