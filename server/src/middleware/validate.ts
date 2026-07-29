import { NextFunction, Request, Response } from "express";
import { z, ZodSchema } from "zod";

export const newTestimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  content: z
    .string()
    .trim()
    .min(10, "Testimonial should be at least 10 characters")
    .max(2000, "Testimonial is too long (max 2000 characters)"),
  rating: z.coerce.number().int().min(1).max(5),
  photo_url: z.string().trim().url().optional().or(z.literal("")),
});

export const moderationUpdateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const settingsUpdateSchema = z.object({
  business_name: z.string().trim().min(1).max(120).optional(),
  accent_color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "accent_color must be a hex color")
    .optional(),
  layout: z.enum(["grid", "list"]).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

/**
 * Validates req.body against `schema`, replacing it with the parsed
 * (and coerced/trimmed) result so downstream handlers get clean data.
 * On failure, responds 400 with the first Zod issue — enough for a
 * frontend form to point at a field, without leaking internals.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      res.status(400).json({
        error: firstIssue?.message ?? "Invalid request body",
        field: firstIssue?.path?.join("."),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }
    // Express 5 makes req.query read-only; stash parsed value separately
    // instead of reassigning, so this middleware also works on Express 4/5.
    (req as Request & { validatedQuery: unknown }).validatedQuery = result.data;
    next();
  };
}
