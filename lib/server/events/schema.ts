import { z } from "zod";

const eventTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .max(120, "Title must be 120 characters or fewer.");

const eventDescriptionSchema = z
  .string()
  .trim()
  .max(2000, "Description must be 2000 characters or fewer.")
  .default("");

const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true, message: "Expected an ISO 8601 date-time string with timezone offset." });

const idSchema = z
  .string()
  .trim()
  .min(1, "Identifier is required.")
  .max(64, "Identifier must be 64 characters or fewer.");

const tagIdsSchema = z.array(idSchema).max(10, "Up to 10 tags are allowed.").default([]);

const eventStatusSchema = z.enum(["confirmed", "tentative", "cancelled"]).default("confirmed");

const eventBaseSchema = z
  .object({
    title: eventTitleSchema,
    description: eventDescriptionSchema,
    startAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
    calendarId: idSchema,
    tagIds: tagIdsSchema,
    status: eventStatusSchema
  })
  .strict();

function validateDateRange<T extends { startAt?: string; endAt?: string }>(value: T, ctx: z.RefinementCtx) {
  if (!value.startAt || !value.endAt) {
    return;
  }

  if (new Date(value.startAt).getTime() >= new Date(value.endAt).getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endAt"],
      message: "endAt must be later than startAt."
    });
  }
}

export const createEventSchema = eventBaseSchema.superRefine(validateDateRange);

export const replaceEventSchema = eventBaseSchema.superRefine(validateDateRange);

export const eventListQuerySchema = z.object({
  calendarId: idSchema.optional(),
  tagId: idSchema.optional(),
  q: z.string().trim().min(1).max(120).optional(),
  startsFrom: isoDateTimeSchema.optional(),
  endsUntil: isoDateTimeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const eventIdParamSchema = z.object({
  eventId: idSchema
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type ReplaceEventInput = z.infer<typeof replaceEventSchema>;
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
