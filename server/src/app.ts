import express from "express";
import cors from "cors";
import { testimonialsRouter } from "./routes/testimonials";
import { moderationRouter } from "./routes/moderation";
import { widgetRouter } from "./routes/widget";
import { settingsRouter } from "./routes/settings";
import { aiRouter } from "./routes/ai";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  const appOrigins = (process.env.APP_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());

  // App-facing CORS: locked to our own frontend's origin(s).
  const appCors = cors({ origin: appOrigins });

  // Widget-facing CORS: intentionally open. Any third-party site embedding
  // the widget calls these endpoints from an origin we can't allowlist in
  // advance — the data returned is public (approved testimonials only,
  // no emails), so this is a safe place to be permissive.
  const widgetCors = cors({ origin: true });

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/testimonials", appCors, testimonialsRouter);
  app.use("/api/moderation", appCors, moderationRouter);
  app.use("/api/settings", appCors, settingsRouter);
  app.use("/api/ai", appCors, aiRouter);
  app.use("/api/widget", widgetCors, widgetRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
