import { randomUUID } from "node:crypto";
import { addWeeks } from "date-fns";
import { Pool } from "pg";
import { getDbPool } from "@/lib/server/db";

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
  status: "confirmed" | "tentative" | "cancelled";
  recurrence: EventRecurrence | null;
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

export type CreateEventRecord = Omit<EventRecord, "id" | "sourceEventId"> & { id?: string };

export type ReplaceEventRecord = Omit<
  EventRecord,
  "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "sourceEventId"
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

type EventRow = {
  id: string;
  title: string;
  description: string;
  start_at: Date | string;
  end_at: Date | string;
  calendar_id: string;
  tag_ids: string[];
  status: EventRecord["status"];
  recurrence_frequency: EventRecurrence["frequency"] | null;
  recurrence_interval: number | null;
  recurrence_until: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  created_by: string;
  updated_by: string;
};

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function mapRecurrence(row: Pick<EventRow, "recurrence_frequency" | "recurrence_interval" | "recurrence_until">) {
  if (!row.recurrence_frequency) {
    return null;
  }

  return {
    frequency: row.recurrence_frequency,
    interval: row.recurrence_interval ?? 1,
    until: row.recurrence_until ? toIsoString(row.recurrence_until) : null
  } satisfies EventRecurrence;
}

function mapRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    sourceEventId: row.id,
    title: row.title,
    description: row.description,
    startAt: toIsoString(row.start_at),
    endAt: toIsoString(row.end_at),
    calendarId: row.calendar_id,
    tagIds: [...row.tag_ids],
    status: row.status,
    recurrence: mapRecurrence(row),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    createdBy: row.created_by,
    updatedBy: row.updated_by
  };
}

function overlapsWindow(startAt: Date, endAt: Date, rangeStart?: Date, rangeEnd?: Date) {
  if (rangeStart && endAt < rangeStart) {
    return false;
  }

  if (rangeEnd && startAt > rangeEnd) {
    return false;
  }

  return true;
}

function buildOccurrenceId(sourceEventId: string, startAt: Date) {
  return `${sourceEventId}::${startAt.toISOString()}`;
}

function expandRecurringEvent(event: EventRecord, filters: EventListFilters) {
  if (!event.recurrence) {
    const startAt = new Date(event.startAt);
    const endAt = new Date(event.endAt);
    return overlapsWindow(
      startAt,
      endAt,
      filters.startsFrom ? new Date(filters.startsFrom) : undefined,
      filters.endsUntil ? new Date(filters.endsUntil) : undefined
    )
      ? [event]
      : [];
  }

  const recurrence = event.recurrence;
  const durationMs = new Date(event.endAt).getTime() - new Date(event.startAt).getTime();
  const baseStart = new Date(event.startAt);
  const rangeStart = filters.startsFrom ? new Date(filters.startsFrom) : baseStart;
  const fallbackEnd = addWeeks(baseStart, 16);
  const rawRangeEnd = filters.endsUntil ? new Date(filters.endsUntil) : recurrence.until ? new Date(recurrence.until) : fallbackEnd;
  const rangeEnd = recurrence.until ? new Date(Math.min(rawRangeEnd.getTime(), new Date(recurrence.until).getTime())) : rawRangeEnd;
  const interval = recurrence.interval;
  const occurrences: EventRecord[] = [];
  let cursor = new Date(baseStart);

  while (cursor <= rangeEnd) {
    const occurrenceEnd = new Date(cursor.getTime() + durationMs);

    if (overlapsWindow(cursor, occurrenceEnd, rangeStart, rangeEnd)) {
      occurrences.push({
        ...event,
        id: buildOccurrenceId(event.id, cursor),
        sourceEventId: event.id,
        startAt: cursor.toISOString(),
        endAt: occurrenceEnd.toISOString()
      });
    }

    cursor = addWeeks(cursor, interval);
  }

  return occurrences;
}

export class PostgresEventRepository implements EventRepository {
  constructor(private readonly pool: Pool) {}

  async list(filters: EventListFilters): Promise<EventListResult> {
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (filters.calendarId) {
      values.push(filters.calendarId);
      conditions.push(`calendar_id = $${values.length}`);
    }

    if (filters.tagId) {
      values.push(filters.tagId);
      conditions.push(`$${values.length} = ANY(tag_ids)`);
    }

    if (filters.q) {
      values.push(`%${escapeLikePattern(filters.q)}%`);
      conditions.push(`(title ILIKE $${values.length} ESCAPE '\\' OR description ILIKE $${values.length} ESCAPE '\\')`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.pool.query<EventRow>(
      `
        SELECT
          id,
          title,
          description,
          start_at,
          end_at,
          calendar_id,
          tag_ids,
          status,
          recurrence_frequency,
          recurrence_interval,
          recurrence_until,
          created_at,
          updated_at,
          created_by,
          updated_by
        FROM events
        ${whereClause}
        ORDER BY start_at ASC, id ASC
      `,
      values
    );

    const expanded = result.rows
      .map(mapRow)
      .flatMap((event) => expandRecurringEvent(event, filters))
      .sort((left, right) => {
        const startDiff = new Date(left.startAt).getTime() - new Date(right.startAt).getTime();
        return startDiff !== 0 ? startDiff : left.id.localeCompare(right.id);
      });

    return {
      items: expanded.slice(filters.offset, filters.offset + filters.limit),
      total: expanded.length,
      limit: filters.limit,
      offset: filters.offset
    };
  }

  async getById(id: string): Promise<EventRecord | null> {
    const result = await this.pool.query<EventRow>(
      `
        SELECT
          id,
          title,
          description,
          start_at,
          end_at,
          calendar_id,
          tag_ids,
          status,
          recurrence_frequency,
          recurrence_interval,
          recurrence_until,
          created_at,
          updated_at,
          created_by,
          updated_by
        FROM events
        WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(input: CreateEventRecord): Promise<EventRecord> {
    const id = input.id ?? randomUUID();
    const result = await this.pool.query<EventRow>(
      `
        INSERT INTO events (
          id,
          title,
          description,
          start_at,
          end_at,
          calendar_id,
          tag_ids,
          status,
          recurrence_frequency,
          recurrence_interval,
          recurrence_until,
          created_at,
          updated_at,
          created_by,
          updated_by
        )
        VALUES (
          $1,
          $2,
          $3,
          $4::timestamptz,
          $5::timestamptz,
          $6,
          $7::text[],
          $8,
          $9,
          $10,
          $11::timestamptz,
          $12::timestamptz,
          $13::timestamptz,
          $14,
          $15
        )
        RETURNING
          id,
          title,
          description,
          start_at,
          end_at,
          calendar_id,
          tag_ids,
          status,
          recurrence_frequency,
          recurrence_interval,
          recurrence_until,
          created_at,
          updated_at,
          created_by,
          updated_by
      `,
      [
        id,
        input.title,
        input.description,
        input.startAt,
        input.endAt,
        input.calendarId,
        input.tagIds,
        input.status,
        input.recurrence?.frequency ?? null,
        input.recurrence?.interval ?? null,
        input.recurrence?.until ?? null,
        input.createdAt,
        input.updatedAt,
        input.createdBy,
        input.updatedBy
      ]
    );

    return mapRow(result.rows[0]);
  }

  async replace(id: string, input: ReplaceEventRecord): Promise<EventRecord | null> {
    const result = await this.pool.query<EventRow>(
      `
        UPDATE events
        SET
          title = $2,
          description = $3,
          start_at = $4::timestamptz,
          end_at = $5::timestamptz,
          calendar_id = $6,
          tag_ids = $7::text[],
          status = $8,
          recurrence_frequency = $9,
          recurrence_interval = $10,
          recurrence_until = $11::timestamptz,
          updated_at = $12::timestamptz,
          updated_by = $13
        WHERE id = $1
        RETURNING
          id,
          title,
          description,
          start_at,
          end_at,
          calendar_id,
          tag_ids,
          status,
          recurrence_frequency,
          recurrence_interval,
          recurrence_until,
          created_at,
          updated_at,
          created_by,
          updated_by
      `,
      [
        id,
        input.title,
        input.description,
        input.startAt,
        input.endAt,
        input.calendarId,
        input.tagIds,
        input.status,
        input.recurrence?.frequency ?? null,
        input.recurrence?.interval ?? null,
        input.recurrence?.until ?? null,
        input.updatedAt,
        input.updatedBy
      ]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query("DELETE FROM events WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

declare global {
  var __scheduleEventRepository__: EventRepository | undefined;
}

export function getEventRepository() {
  if (!globalThis.__scheduleEventRepository__) {
    globalThis.__scheduleEventRepository__ = new PostgresEventRepository(getDbPool());
  }

  return globalThis.__scheduleEventRepository__;
}

export function setEventRepository(repository: EventRepository) {
  globalThis.__scheduleEventRepository__ = repository;
}
