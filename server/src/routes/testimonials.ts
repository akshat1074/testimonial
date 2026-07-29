import { Router } from "express";
import { supabase } from "../lib/supabase";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import {
  newTestimonialSchema,
  paginationSchema,
  validateBody,
  validateQuery,
} from "../middleware/validate";
import { submissionRateLimit, publicReadRateLimit } from "../middleware/rateLimit";
import type { NewTestimonialInput, PublicTestimonial, Paginated } from "../types/testimonial";

export const testimonialsRouter = Router();

const DUPLICATE_WINDOW_MINUTES = 5;

/**
 * POST /api/testimonials
 * Public submission endpoint. Anyone with the link can post here, so this
 * is the one route that gets both rate limiting and a duplicate check.
 */
testimonialsRouter.post(
  "/",
  submissionRateLimit,
  validateBody(newTestimonialSchema),
  asyncHandler(async (req, res) => {
    const input = req.body as NewTestimonialInput;

    // P1 — junk/duplicate guard: same email + same content submitted again
    // within a short window is almost always a double-click or a retry,
    // not two distinct testimonials. We reject it with a clear message
    // rather than silently deduping, so the user isn't confused about
    // whether their submission went through.
    const since = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { data: recentDupes, error: dupeError } = await supabase
      .from("testimonials")
      .select("id")
      .eq("email", input.email)
      .eq("content", input.content)
      .gte("created_at", since)
      .limit(1);

    if (dupeError) throw new ApiError(500, "Could not validate submission");
    if (recentDupes && recentDupes.length > 0) {
      throw new ApiError(409, "You already submitted this testimonial. Thanks — it's in review!");
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        name: input.name,
        email: input.email,
        company: input.company || null,
        content: input.content,
        rating: input.rating,
        photo_url: input.photo_url || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new ApiError(500, "Could not save your testimonial");
    res.status(201).json({ data });
  })
);

/**
 * GET /api/testimonials/approved
 * Powers the in-app public wall. Approved-only, paginated (P1).
 * Origin is restricted to APP_ORIGIN by the CORS config in app.ts —
 * for the version any site can call, see routes/widget.ts.
 */
testimonialsRouter.get(
  "/approved",
  publicReadRateLimit,
  validateQuery(paginationSchema),
  asyncHandler(async (req, res) => {
    const { page, limit } = (req as any).validatedQuery as { page: number; limit: number };
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("testimonials")
      .select("id, name, company, content, rating, photo_url, status, sentiment, created_at, updated_at", {
        count: "exact",
      })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, "Could not load testimonials");

    const total = count ?? 0;
    const response: Paginated<PublicTestimonial> = {
      data: (data ?? []) as PublicTestimonial[],
      page,
      limit,
      total,
      hasMore: from + (data?.length ?? 0) < total,
    };
    res.json(response);
  })
);
