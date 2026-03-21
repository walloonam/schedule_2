export type EventRecord = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  calendarId: string;
  tagIds: string[];
  status: "confirmed" | "tentative" | "cancelled";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

export type EventListFilters = {
  calendarId?: string;
  tagId?: string;
  q?: string;
  startsFrom?: string;
  endsUntil?: string;
  limit: number;
  offset: number;
};

export type CreateEventRecord = Omit<EventRecord, "id"> & { id?: string };

export type ReplaceEventRecord = Omit<
  EventRecord,
  "createdAt" | "createdBy" | "updatedAt" | "updatedBy"
> & {
  updatedAt: string;
  updatedBy: string;
};

export type EventListResult = {
  items: EventRecord[];
  total: number;
  limit: number;
  offset: number;
};

export interface EventRepository {
  list(filters: EventListFilters): Promise<EventListResult>;
  getById(id: string): Promise<EventRecord | null>;
  create(input: CreateEventRecord): Promise<EventRecord>;
  replace(id: string, input: ReplaceEventRecord): Promise<EventRecord | null>;
  delete(id: string): Promise<boolean>;
}

const seedEvents: EventRecord[] = [
  {
    id: "evt_demo_001",
    title: "Sprint planning",
    description: "Scope the next iteration and assign owners.",
    startAt: "2026-03-23T01:00:00.000Z",
    endAt: "2026-03-23T02:00:00.000Z",
    calendarId: "team",
    tagIds: ["planning"],
    status: "confirmed",
    createdAt: "2026-03-21T00:00:00.000Z",
    updatedAt: "2026-03-21T00:00:00.000Z",
    createdBy: "demo-user",
    updatedBy: "demo-user"
  },
  {
    id: "evt_demo_002",
    title: "API review",
    description: "Review schedule API contracts with frontend.",
    startAt: "2026-03-24T06:00:00.000Z",
    endAt: "2026-03-24T07:00:00.000Z",
    calendarId: "team",
    tagIds: ["review", "backend"],
    status: "tentative",
    createdAt: "2026-03-21T00:00:00.000Z",
    updatedAt: "2026-03-21T00:00:00.000Z",
    createdBy: "demo-user",
    updatedBy: "demo-user"
  }
];

export class InMemoryEventRepository implements EventRepository {
  private readonly events = new Map<string, EventRecord>();

  constructor(seed: EventRecord[] = seedEvents) {
    seed.forEach((event) => {
      this.events.set(event.id, { ...event, tagIds: [...event.tagIds] });
    });
  }

  async list(filters: EventListFilters): Promise<EventListResult> {
    const query = filters.q?.toLowerCase();
    const items = Array.from(this.events.values())
      .filter((event) => {
        if (filters.calendarId && event.calendarId !== filters.calendarId) {
          return false;
        }

        if (filters.tagId && !event.tagIds.includes(filters.tagId)) {
          return false;
        }

        if (query) {
          const haystack = `${event.title} ${event.description}`.toLowerCase();
          if (!haystack.includes(query)) {
            return false;
          }
        }

        if (filters.startsFrom && new Date(event.endAt).getTime() < new Date(filters.startsFrom).getTime()) {
          return false;
        }

        if (filters.endsUntil && new Date(event.startAt).getTime() > new Date(filters.endsUntil).getTime()) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const startDiff = new Date(left.startAt).getTime() - new Date(right.startAt).getTime();
        if (startDiff !== 0) {
          return startDiff;
        }

        return left.id.localeCompare(right.id);
      });

    return {
      items: items
        .slice(filters.offset, filters.offset + filters.limit)
        .map((event) => ({ ...event, tagIds: [...event.tagIds] })),
      total: items.length,
      limit: filters.limit,
      offset: filters.offset
    };
  }

  async getById(id: string): Promise<EventRecord | null> {
    const event = this.events.get(id);
    return event ? { ...event, tagIds: [...event.tagIds] } : null;
  }

  async create(input: CreateEventRecord): Promise<EventRecord> {
    const id = input.id ?? crypto.randomUUID();
    const record: EventRecord = { ...input, id, tagIds: [...input.tagIds] };
    this.events.set(id, record);
    return { ...record, tagIds: [...record.tagIds] };
  }

  async replace(id: string, input: ReplaceEventRecord): Promise<EventRecord | null> {
    const existing = this.events.get(id);
    if (!existing) {
      return null;
    }

    const record: EventRecord = {
      ...existing,
      ...input,
      id,
      tagIds: [...input.tagIds]
    };

    this.events.set(id, record);
    return { ...record, tagIds: [...record.tagIds] };
  }

  async delete(id: string): Promise<boolean> {
    return this.events.delete(id);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __scheduleEventRepository__: EventRepository | undefined;
}

export function getEventRepository() {
  if (!globalThis.__scheduleEventRepository__) {
    globalThis.__scheduleEventRepository__ = new InMemoryEventRepository();
  }

  return globalThis.__scheduleEventRepository__;
}

export function setEventRepository(repository: EventRepository) {
  globalThis.__scheduleEventRepository__ = repository;
}
