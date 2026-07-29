import rateLimit from "express-rate-limit";

/**
 * Coarse per-IP throttle on the public submission endpoint. This is a
 * blunt instrument on purpose — it's not trying to be a fraud system,
 * just to stop a form being hammered by a script. Duplicate *content*
 * (same person re-submitting the same testimonial) is handled
 * separately in routes/testimonials.ts, since that needs to look at
 * the actual row data, not just request counts.
 */
export const submissionRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions from this network. Please try again later." },
});

/** Looser limit for read-heavy public endpoints (wall, widget). */
export const publicReadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
