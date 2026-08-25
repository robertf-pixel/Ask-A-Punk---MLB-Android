
import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { sampleRouter } from "./routes/sample";
import { eventsRouter } from "./routes/events";
import { logger } from "hono/logger";
import { initScheduler } from "./services/scheduler";

const app = new Hono();

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    credentials: true,
  })
);

// App version endpoint
app.get("/api/app-version", (c) => {
  return c.json({
    data: {
      android: {
        latestVersion: "1.13",
        latestBuild: "12",
        minimumBuild: "12",
        downloadUrl: null,
      },

      ios: {
        latestVersion: "1.13",
        latestBuild: "12",
        minimumBuild: "12",
        downloadUrl: null,
      },
    },
  });
});

// Logging
app.use("*", logger());

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/api/sample", sampleRouter);
app.route("/api/events", eventsRouter);

// Initialize the scheduler for event syncing
initScheduler().catch((err) => {
  console.error("[Startup] Failed to initialize scheduler:", err);
});

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
