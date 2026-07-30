import { Router } from "express";
import { supabase } from "../lib/supabase";
import { asyncHandler, ApiError, assertNoSupabaseError } from "../middleware/errorHandler";
import type { Sentiment } from "../types/testimonial";

export const aiRouter = Router();

const VALID_SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];

/**
 * POST /api/ai/testimonials/:id/tag-sentiment
 * P2 stretch feature. Sends the testimonial text to an LLM, asks for a
 * one-word sentiment label, and stores it on the row. This runs on
 * demand from a dashboard button rather than automatically on every
 * submission — keeps the P0 submit path fast and free of a third-party
 * API dependency, and keeps API spend opt-in.
 *
 * Uses the Anthropic Messages API directly (any model works — swap
 * ANTHROPIC_MODEL below). If ANTHROPIC_API_KEY isn't set, this fails
 * with a clear 501 instead of crashing the server, since it's a stretch
 * feature and the rest of the app must work without it.
 */
aiRouter.post(
  "/testimonials/:id/tag-sentiment",
  asyncHandler(async (req, res) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new ApiError(501, "AI sentiment tagging isn't configured (missing ANTHROPIC_API_KEY).");
    }

    const { id } = req.params;
    const { data: testimonial, error: fetchError } = await supabase
      .from("testimonials")
      .select("id, content")
      .eq("id", id)
      .maybeSingle();

    assertNoSupabaseError(fetchError, "Could not load testimonial");
    if (!testimonial) throw new ApiError(404, "Testimonial not found");

    const sentiment = await classifySentiment(testimonial.content, apiKey);

    const { data, error } = await supabase
      .from("testimonials")
      .update({ sentiment })
      .eq("id", id)
      .select()
      .single();

    assertNoSupabaseError(error, "Could not save sentiment");
    res.json({ data });
  })
);

async function classifySentiment(content: string, apiKey: string): Promise<Sentiment> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 8,
      system:
        "Classify the sentiment of a customer testimonial. Respond with exactly one word: positive, neutral, or negative. No punctuation, no explanation.",
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    throw new ApiError(502, "Sentiment classification failed");
  }

  const json = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  const raw = json.content?.find((b) => b.type === "text")?.text?.trim().toLowerCase() ?? "";
  const match = VALID_SENTIMENTS.find((s) => raw.includes(s));

  return match ?? "neutral"; // safe default if the model returns something unexpected
}