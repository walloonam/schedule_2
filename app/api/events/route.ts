import { errorJson, successJson } from "@/lib/server/errors";
import { createEventSchema, eventListQuerySchema } from "@/lib/server/events/schema";
import { getRequestActor, getEventService } from "@/lib/server/events/service";
import { parseJsonBody } from "@/lib/server/request";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = eventListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const service = getEventService();
    const result = await service.list(query);

    return successJson(result);
  } catch (error) {
    return errorJson(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createEventSchema.parse(await parseJsonBody(request));
    const actor = getRequestActor(request);
    const service = getEventService();
    const event = await service.create(body, actor);

    return successJson(event, { status: 201 });
  } catch (error) {
    return errorJson(error);
  }
}
