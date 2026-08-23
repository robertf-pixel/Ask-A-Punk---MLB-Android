import cron, { type ScheduledTask } from "node-cron";
import { syncEvents, syncIfStale } from "./event-sync";
import { LOCALES } from "../types/locale";

let scheduledTask: ScheduledTask | null = null;

export async function initScheduler(): Promise<void> {
  console.log("[Scheduler] Initializing event sync scheduler...");

  // On startup, sync each locale only if its data is stale
  for (const locale of LOCALES) {
    try {
      await syncIfStale(locale);
    } catch (error) {
      console.error(
        `[Scheduler] Startup sync failed for ${locale}:`,
        error
      );
    }
  }

  // Run every 12 hours
  scheduledTask = cron.schedule("0 0,12 * * *", async () => {
    console.log("[Scheduler] Running scheduled event sync...");

    for (const locale of LOCALES) {
      try {
        await syncEvents(locale);
      } catch (error) {
        console.error(
          `[Scheduler] Scheduled sync failed for ${locale}:`,
          error
        );
      }
    }
  });

  console.log(
    "[Scheduler] All locales scheduled to sync every 12 hours"
  );
}

export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log("[Scheduler] Event sync scheduler stopped");
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