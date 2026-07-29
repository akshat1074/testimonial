import { Router } from "express";
import { supabase } from "../lib/supabase";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { moderationUpdateSchema, validateBody } from "../middleware/validate";
import type { TestimonialStatus } from "../types/testimonial";

export const moderationRouter = Router();

// NOTE: per the assignment's non-goals, this router is intentionally
// unauthenticated — it's reachable at /api/moderation/* with no login.
// In a real product this is exactly where an auth middleware would go.

const VALID_STATUSES: TestimonialStatus[] = ["pending", "approved", "rejected"];

/**
 * GET /api/moderation/testimonials?status=pending
 * Lists everything for the dashboard table. `status` filter is optional;
 * omit it to see all submissions across every status.
 */
moderationRouter.get(
  "/testimonials",
  asyncHandler(async (req, res) => {
    const statusFilter = req.query.status as string | undefined;

    let query = supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter) {
      if (!VALID_STATUSES.includes(statusFilter as TestimonialStatus)) {
        throw new ApiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
      }
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw new ApiError(500, "Could not load submissions");
    res.json({ data });
  })
);

/**
 * PATCH /api/moderation/testimonials/:id
 * The core moderation action: approve or reject. Deliberately only
 * accepts those two values (not "pending") — you can't un-decide back
 * to pending through this route, only forward to a decision.
 */
moderationRouter.patch(
  "/testimonials/:id",
  validateBody(moderationUpdateSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status: "approved" | "rejected" };

    const { data, error } = await supabase
      .from("testimonials")
      .update({ status })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw new ApiError(500, "Could not update submission");
    if (!data) throw new ApiError(404, "Submission not found");

    res.json({ data });
  })
);

/**
 * DELETE /api/moderation/testimonials/:id
 * Hard delete — for clearing obvious spam out of the dashboard entirely,
 * distinct from "reject" which keeps the row (and the customer's record
 * of having submitted) around.
 */
moderationRouter.delete(
  "/testimonials/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error, count } = await supabase
      .from("testimonials")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw new ApiError(500, "Could not delete submission");
    if (!count) throw new ApiError(404, "Submission not found");

    res.status(204).send();
  })
);
