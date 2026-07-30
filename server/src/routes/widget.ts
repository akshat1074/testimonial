import { Router } from "express";
import { supabase } from "../lib/supabase";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { publicReadRateLimit } from "../middleware/rateLimit";

export const widgetRouter = Router();


widgetRouter.get(
  "/testimonials",
  publicReadRateLimit,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 12, 24);

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, company, content, rating, photo_url, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new ApiError(500, "Could not load testimonials");
    res.json({ data: data ?? [] });
  })
);

/**
 * GET /api/widget/settings
 * Lets the widget theme itself (accent color, business name, layout)
 * without the embedding site having to pass anything except which
 * business it belongs to — which, in this single-business version of
 * the app, is implicit.
 */
widgetRouter.get(
  "/settings",
  publicReadRateLimit,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from("settings")
      .select("business_name, accent_color, layout")
      .eq("id", 1)
      .single();

    if (error) throw new ApiError(500, "Could not load widget settings");
    res.json({ data });
  })
);
