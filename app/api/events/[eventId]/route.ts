import { errorJson, successJson } from "@/lib/server/errors";
import { eventIdParamSchema, replaceEventSchema } from "@/lib/server/events/schema";
import { getRequestActor, getEventService } from "@/lib/server/events/service";
import { parseJsonBody } from "@/lib/server/request";

type EventRouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

async function parseEventId(context: EventRouteContext) {
  return eventIdParamSchema.parse(await context.params).eventId;
}

export async function GET(_request: Request, context: EventRouteContext) {
  try {
    const eventId = await parseEventId(context);
    const service = getEventService();
    const event = await service.getById(eventId);

    return successJson(event);
  } catch (error) {
    return errorJson(error);
  }
}

export async function PUT(request: Request, context: EventRouteContext) {
  try {
    const eventId = await parseEventId(context);
    const body = replaceEventSchema.parse(await parseJsonBody(request));
    const actor = getRequestActor(request);
    const service = getEventService();
    const event = await service.replace(eventId, body, actor);

    return successJson(event);
  } catch (error) {
    return errorJson(error);
  }
}

export async function DELETE(request: Request, context: EventRouteContext) {
  try {
    const eventId = await parseEventId(context);
    const actor = getRequestActor(request);
    const service = getEventService();

    await service.delete(eventId, actor);

    return successJson({ id: eventId, deleted: true });
  } catch (error) {
    return errorJson(error);
  }
}