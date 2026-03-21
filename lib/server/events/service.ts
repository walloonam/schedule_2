import { forbidden, notFound } from "@/lib/server/errors";
import {
  CreateEventRecord,
  EventListFilters,
  EventRecord,
  EventRepository,
  ReplaceEventRecord,
  getEventRepository
} from "@/lib/server/events/repository";
import { CreateEventInput, EventListQuery, ReplaceEventInput } from "@/lib/server/events/schema";

export type RequestActor = {
  userId: string;
  role: "admin" | "member";
};

export function getRequestActor(request: Request): RequestActor {
  const userId = request.headers.get("x-user-id")?.trim() || "demo-user";
  const rawRole = request.headers.get("x-user-role")?.trim().toLowerCase();

  return {
    userId,
    role: rawRole === "admin" ? "admin" : "member"
  };
}

function assertCanMutate(actor: RequestActor, event: EventRecord) {
  if (actor.role === "admin" || actor.userId === event.createdBy) {
    return;
  }

  throw forbidden("Only the event owner or an admin can modify this event.");
}

export class EventService {
  constructor(private readonly repository: EventRepository) {}

  async list(query: EventListQuery) {
    const filters: EventListFilters = {
      calendarId: query.calendarId,
      tagId: query.tagId,
      q: query.q,
      startsFrom: query.startsFrom,
      endsUntil: query.endsUntil,
      limit: query.limit,
      offset: query.offset
    };

    return this.repository.list(filters);
  }

  async getById(id: string) {
    const event = await this.repository.getById(id);
    if (!event) {
      throw notFound("Event not found.");
    }

    return event;
  }

  async create(input: CreateEventInput, actor: RequestActor) {
    const timestamp = new Date().toISOString();
    const record: CreateEventRecord = {
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: actor.userId,
      updatedBy: actor.userId
    };

    return this.repository.create(record);
  }

  async replace(id: string, input: ReplaceEventInput, actor: RequestActor) {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw notFound("Event not found.");
    }

    assertCanMutate(actor, existing);

    const replacement: ReplaceEventRecord = {
      ...input,
      id,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.userId
    };

    const event = await this.repository.replace(id, replacement);
    if (!event) {
      throw notFound("Event not found.");
    }

    return event;
  }

  async delete(id: string, actor: RequestActor) {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw notFound("Event not found.");
    }

    assertCanMutate(actor, existing);

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw notFound("Event not found.");
    }
  }
}

export function getEventService() {
  return new EventService(getEventRepository());
}
