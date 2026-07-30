import "dotenv/config";
import { createApp } from "./app";

// Since Node 15+, an unhandled promise rejection crashes the process by
// default — which is what turned the express-rate-limit "trust proxy"
// error into "the entire server is down", not just the one route that
// triggered it. Logging here won't prevent a crash on a truly fatal
// error, but it means the *next* one shows up clearly in the deploy
// logs instead of as an opaque restart with no visible cause.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

const port = Number(process.env.PORT) || 4000;
const app = createApp();

app.listen(port, () => {
  console.log(`Testimonial API listening on http://localhost:${port}`);
});