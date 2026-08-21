import { Hono } from "hono";
import { prisma } from "../db";
import { getLastSyncStatus } from "../services/event-sync";
import { triggerManualSync } from "../services/scheduler";

const eventsRouter = new Hono();

/**
 * GET /api/events - Return all events (upcoming and past)
 */
eventsRouter.get("/", async (c) => {
  const locale = c.req.query("locale") ?? "melbourne";

  console.log("EVENTS REQUESTED FOR:", locale);

  const events = await prisma.event.findMany({
    where: { locale },
    orderBy: { startDatetime: "asc" },
  });

  const eventsWithParsedTags = events.map((event) => ({
    ...event,
    tags: JSON.parse(event.tags) as string[],
  }));

  return c.json({ data: eventsWithParsedTags });
});

/**
 * GET /api/events/status - Return last sync status
 */
eventsRouter.get("/status", async (c) => {
  const status = await getLastSyncStatus();

  if (!status) {
    return c.json({
      data: {
        lastSyncedAt: null,
        status: "never_synced",
        eventCount: 0,
      },
    });
  }

  return c.json({
    data: {
      lastSyncedAt: status.lastSyncedAt,
      status: status.status,
      eventCount: status.eventCount,
      errorMessage: status.errorMessage,
    },
  });
});

/**
 * POST /api/events/sync - Manually trigger sync
 */
eventsRouter.post("/sync", async (c) => {
  const result = await triggerManualSync();

  if (result.success) {
    return c.json({
      data: {
        message: "Sync completed successfully",
        eventCount: result.eventCount,
      },
    });
  }

  return c.json(
    {
      error: {
        message: result.error || "Sync failed",
        code: "SYNC_FAILED",
      },
    },
    500
  );
});

/**
 * GET /api/events/:id - Return single event
 */
eventsRouter.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);

  if (isNaN(id)) {
    return c.json(
      {
        error: {
          message: "Invalid event ID",
          code: "INVALID_ID",
        },
      },
      400
    );
  }

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return c.json(
      {
        error: {
          message: "Event not found",
          code: "NOT_FOUND",
        },
      },
      404
    );
  }

  // Parse tags JSON
  const eventWithParsedTags = {
    ...event,
    tags: JSON.parse(event.tags) as string[],
  };

  return c.json({ data: eventWithParsedTags });
});

export { eventsRouter };
