import { Router } from "express";
import { supabase } from "../lib/supabase";
import { asyncHandler, ApiError, assertNoSupabaseError } from "../middleware/errorHandler";
import { settingsUpdateSchema, validateBody } from "../middleware/validate";

export const settingsRouter = Router();

/** GET /api/settings — used by the dashboard's settings panel. */
settingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
    assertNoSupabaseError(error, "Could not load settings");
    res.json({ data });
  })
);

/** PATCH /api/settings — updates business name / accent color / layout. */
settingsRouter.patch(
  "/",
  validateBody(settingsUpdateSchema),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from("settings")
      .update(req.body)
      .eq("id", 1)
      .select()
      .single();

    assertNoSupabaseError(error, "Could not update settings");
    res.json({ data });
  })
);