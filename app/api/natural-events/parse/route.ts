import { z } from "zod";
import { errorJson, successJson } from "@/lib/server/errors";
import { parseNaturalSchedule } from "@/lib/server/natural-events/parse";
import { parseJsonBody } from "@/lib/server/request";

const parseNaturalScheduleSchema = z
  .object({
    text: z.string().trim().min(1).max(400),
    now: z.string().datetime({ offset: true }).optional()
  })
  .strict();

export async function POST(request: Request) {
  try {
    const body = parseNaturalScheduleSchema.parse(await parseJsonBody(request));
    const parsed = parseNaturalSchedule(body.text, body.now ?? new Date());
    return successJson(parsed);
  } catch (error) {
    return errorJson(error);
  }
}
