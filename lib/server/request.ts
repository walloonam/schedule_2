import { badRequest } from "@/lib/server/errors";

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
}
