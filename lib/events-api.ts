import {
  ApiErrorDetail,
  EventDraft,
  EventItem,
  EventListResult,
  EventMutationInput,
  EventRecord
} from "@/lib/types";

const EVENTS_API_URL = "/api/events";
const EVENTS_API_HEADERS = {
  "Content-Type": "application/json",
  "x-user-id": "demo-user",
  "x-user-role": "admin"
} as const;

type ApiSuccess<T> = {
  data: T;
};

type ApiFailure = {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
};

export class EventsApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "EventsApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getErrorMessage(error: ApiFailure) {
  if (!error.details?.length) {
    return error.message;
  }

  return error.details.map((detail) => detail.message).join(" ");
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;

  if (!response.ok) {
    const error = payload as ApiFailure | null;
    throw new EventsApiError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error ? getErrorMessage(error) : "일정 요청을 처리하지 못했습니다.",
      error?.details
    );
  }

  if (!payload || !("data" in payload)) {
    throw new EventsApiError(500, "INVALID_RESPONSE", "일정 응답 형식이 올바르지 않습니다.");
  }

  return payload.data;
}

async function eventsRequest<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...EVENTS_API_HEADERS,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  return parseResponse<T>(response);
}

export function mapEventRecordToItem(
  record: EventRecord,
  options: { availableTagIds: string[]; fallbackTagId: string }
): EventItem {
  const tagId =
    record.tagIds.find((candidate) => options.availableTagIds.includes(candidate)) ??
    record.tagIds[0] ??
    options.fallbackTagId;

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    start: record.startAt,
    end: record.endAt,
    tagId,
    calendarId: record.calendarId
  };
}

export function mapEventDraftToMutationInput(draft: EventDraft): EventMutationInput {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    startAt: new Date(draft.start).toISOString(),
    endAt: new Date(draft.end).toISOString(),
    calendarId: draft.calendarId,
    tagIds: draft.tagId ? [draft.tagId] : [],
    status: "confirmed"
  };
}

export async function listEvents() {
  return eventsRequest<EventListResult>(EVENTS_API_URL, { method: "GET" });
}

export async function createEvent(input: EventMutationInput) {
  return eventsRequest<EventRecord>(EVENTS_API_URL, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateEvent(eventId: string, input: EventMutationInput) {
  return eventsRequest<EventRecord>(`${EVENTS_API_URL}/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function deleteEvent(eventId: string) {
  return eventsRequest<{ id: string; deleted: true }>(`${EVENTS_API_URL}/${eventId}`, {
    method: "DELETE"
  });
}

export function toUserErrorMessage(error: unknown) {
  if (error instanceof EventsApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "일정 요청 중 알 수 없는 오류가 발생했습니다.";
}

