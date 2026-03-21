import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorResponse = {
  code: string;
  message: string;
  details?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Authentication is required.") {
  return new ApiError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "You do not have permission to perform this action.") {
  return new ApiError(403, "FORBIDDEN", message);
}

export function notFound(message = "The requested resource was not found.") {
  return new ApiError(404, "NOT_FOUND", message);
}

export function conflict(message: string, details?: unknown) {
  return new ApiError(409, "CONFLICT", message, details);
}

export function internalServerError(message = "An unexpected error occurred.") {
  return new ApiError(500, "INTERNAL_SERVER_ERROR", message);
}

export function successJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function noContentJson(data: Record<string, unknown>, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

function zodDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code
  }));
}

export function toErrorResponse(error: unknown): { status: number; body: ErrorResponse } {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details })
      }
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: zodDetails(error)
      }
    };
  }

  return {
    status: 500,
    body: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred."
    }
  };
}

export function errorJson(error: unknown) {
  const { status, body } = toErrorResponse(error);
  return NextResponse.json(body, { status });
}
