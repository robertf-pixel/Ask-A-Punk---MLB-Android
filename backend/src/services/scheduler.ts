import cron, { type ScheduledTask } from "node-cron";
import { syncEvents, syncIfStale } from "./event-sync";

let scheduledTask: ScheduledTask | null = null;

/**
 * Initialize the scheduler
 * - Runs sync on startup if data is stale
 * - Schedules sync to run every 12 hours
 */
export async function initScheduler(): Promise<void> {
  console.log("[Scheduler] Initializing event sync scheduler...");

  // Run sync on startup if data is stale
  await syncIfStale('melbourne');

  // Schedule sync every 12 hours (at 00:00 and 12:00)
  // Cron expression: "0 0,12 * * *" means at minute 0 of hours 0 and 12
  scheduledTask = cron.schedule("0 0,12 * * *", async () => {
    console.log("[Scheduler] Running scheduled event sync...");
    await syncEvents('melbourne');
  });

  console.log("[Scheduler] Event sync scheduled to run every 12 hours");
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log("[Scheduler] Scheduler stopped");
  }
}

/**
 * Manually trigger a sync
 */
export async function triggerManualSync(
  locale: 'melbourne' | 'sydney' | 'wollongong' | 'canberra'
): Promise<{
  success: boolean;
  eventCount: number;
  error?: string;
}> {
  console.log(`[Scheduler] Manual sync triggered for ${locale}`);
  return syncEvents(locale);
}