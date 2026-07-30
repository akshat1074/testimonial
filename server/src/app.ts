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

  // Render (and most PaaS hosts) sit behind a reverse proxy, so every
  // request arrives with an X-Forwarded-For header already set. Without
  // this, express-rate-limit refuses to trust that header (correctly —
  // it could be spoofed by a client talking directly to the app) and
  // throws, which was crashing the whole process, not just the rate-
  // limited route. `1` means "trust exactly one hop" (Render's own
  // proxy) rather than `true`, which would trust an arbitrary chain of
  // proxies and let a client fake its own IP via the header.
  app.set("trust proxy", 1);

  app.use(express.json({ limit: "1mb" }));

  const appOrigins = (process.env.APP_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, "")); // strip trailing slash — exact-match CORS is picky about it

  // App-facing CORS: locked to our own frontend's origin(s). Using a
  // function (not a bare array) so a mismatch gets logged server-side
  // instead of failing silently — this is the #1 thing to check if you
  // deploy and suddenly get CORS errors: does the Origin the browser
  // actually sent match what's configured in APP_ORIGIN, exactly?
  const appCors = cors({
    origin(origin, callback) {
      // No Origin header = same-origin request (curl, server-to-server,
      // Postman) — always allow, nothing to check against.
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, "");
      if (appOrigins.includes(normalized)) {
        callback(null, true);
      } else {
        console.error(
          `CORS rejected origin "${origin}". Allowed: ${appOrigins.join(", ")}. ` +
          `If this should be allowed, check APP_ORIGIN on the server for a trailing slash, ` +
          `http vs https, or a stale preview-deployment URL.`
        );
        callback(new Error("Not allowed by CORS"));
      }
    },
  });

  // Widget-facing CORS: intentionally open. Any third-party site embedding
  // the widget calls these endpoints from an origin we can't allowlist in
  // advance — the data returned is public (approved testimonials only,
  // no emails), so this is a safe place to be permissive.
  const widgetCors = cors({ origin: true });

  app.get("/health", (req, res) => res.json({ ok: true, allowedOrigins: appOrigins }));

  app.use("/api/testimonials", appCors, testimonialsRouter);
  app.use("/api/moderation", appCors, moderationRouter);
  app.use("/api/settings", appCors, settingsRouter);
  app.use("/api/ai", appCors, aiRouter);
  app.use("/api/widget", widgetCors, widgetRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}