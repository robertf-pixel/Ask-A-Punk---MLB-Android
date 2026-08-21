import { prisma } from "../db";
import { fetch } from 'undici';

// Gancio API types based on actual response
interface GancioMedia {
  url: string;
  height: number;
  width: number;
  name: string;
  size: number;
  focalpoint: [number, number];
}

interface GancioPlace {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface GancioEvent {
  id: number;
  title: string;
  slug: string;
  start_datetime: number; // Unix timestamp
  end_datetime: number; // Unix timestamp
  media: GancioMedia[];
  online_locations: string[] | string;
  tags: string[];
  place: GancioPlace;
}

type Locale = 'melbourne' | 'sydney';

const GANCIO_API_URL = "https://melbourne.askapunk.net/api/events";
const GANCIO_BASE_URLS: Record<Locale, string> = {
  melbourne: 'https://melbourne.askapunk.net',
  sydney: 'https://sydney.askapunk.au',
};

/**
 * Fetches events from the Gancio API (both upcoming and past)
 */
async function fetchEventsFromGancio(locale: Locale): Promise<GancioEvent[]> {
  const baseUrl = GANCIO_BASE_URLS[locale];
  const apiUrl = `${baseUrl}/api/events`;
  // Fetch upcoming events (default behavior, no params)
  const upcomingResponse = await fetch(apiUrl);
  if (!upcomingResponse.ok) {
    throw new Error(`Failed to fetch upcoming events: ${upcomingResponse.status} ${upcomingResponse.statusText}`);
  }
  const upcomingEvents = (await upcomingResponse.json()) as GancioEvent[];

  // Fetch past events using start=0 and end=current unix timestamp
  const nowUnix = Math.floor(Date.now() / 1000);
  const pastUrl = `${apiUrl}?start=0&end=${nowUnix}`;
  const pastResponse = await fetch(pastUrl);
  if (!pastResponse.ok) {
    throw new Error(`Failed to fetch past events: ${pastResponse.status} ${pastResponse.statusText}`);
  }
  const pastEvents = (await pastResponse.json()) as GancioEvent[];

  // Combine and deduplicate by event id
  const eventMap = new Map<number, GancioEvent>();
  for (const event of pastEvents) {
    eventMap.set(event.id, event);
  }
  for (const event of upcomingEvents) {
    eventMap.set(event.id, event);
  }

  const allEvents = Array.from(eventMap.values());
  console.log(
    `[EventSync] Fetched ${upcomingEvents.length} upcoming + ${pastEvents.length} past = ${allEvents.length} unique events`
  );

  return allEvents;
}

/**
 * Extracts the ticket URL from online_locations
 */
function extractTicketUrl(onlineLocations: string[] | string): string | null {
  if (Array.isArray(onlineLocations) && onlineLocations.length > 0) {
    return onlineLocations[0] ?? null;
  }
  if (typeof onlineLocations === "string" && onlineLocations.length > 0) {
    return onlineLocations;
  }
  return null;
}

/**
 * Constructs the full image URL from media data
 */
function getImageUrl(
  media: GancioMedia[],
  baseUrl: string
): string | null {
  const firstMedia = media[0];
  if (media.length > 0 && firstMedia && firstMedia.url) {
    return `${baseUrl}/media/thumb/${firstMedia.url}`;
  }
  return null;
}

/**
 * Syncs events from the Gancio API to the local database
 */
export async function syncEvents(
  locale: Locale
): Promise<{ success: boolean; eventCount: number; error?: string }> {
  // Create a sync status entry to mark sync in progress
  const syncStatus = await prisma.syncStatus.create({
    data: {
      lastSyncedAt: new Date(),
      status: "in_progress",
      eventCount: 0,
    },
  });

  try {
    // Fetch events from Gancio API
    const gancioEvents = await fetchEventsFromGancio(locale);
    const gancioEventIds = gancioEvents.map((e) => e.id);

    // Upsert each event
    for (const event of gancioEvents) {
      await prisma.event.upsert({
        where: {
          locale_gancioId: {
            locale,
            gancioId: event.id,
          },
        },
        update: {
          title: event.title,
          slug: event.slug,
          description: null, // Gancio list endpoint doesn't include description
          startDatetime: new Date(event.start_datetime * 1000),
          endDatetime: event.end_datetime ? new Date(event.end_datetime * 1000) : null,
          placeName: event.place?.name || null,
          placeAddress: event.place?.address || null,
          imageUrl: getImageUrl(event.media, GANCIO_BASE_URLS[locale]),
          tags: JSON.stringify(event.tags),
          ticketUrl: extractTicketUrl(event.online_locations),
          updatedAt: new Date(),
          locale,
        },
        create: {
          gancioId: event.id,
          locale,
          title: event.title,
          slug: event.slug,
          description: null,
          startDatetime: new Date(event.start_datetime * 1000),
          endDatetime: event.end_datetime ? new Date(event.end_datetime * 1000) : null,
          placeName: event.place?.name || null,
          placeAddress: event.place?.address || null,
          imageUrl: getImageUrl(event.media, GANCIO_BASE_URLS[locale]),
          tags: JSON.stringify(event.tags),
          ticketUrl: extractTicketUrl(event.online_locations),
        },
      });
    }

    // Delete events that are no longer in the API (cleanup old events)
    const deletedCount = await prisma.event.deleteMany({
      where: {
        locale,
        gancioId: {
          notIn: gancioEventIds,
        },
      },
    });

    // Update sync status to success
    await prisma.syncStatus.update({
      where: { id: syncStatus.id },
      data: {
        status: "success",
        eventCount: gancioEvents.length,
        lastSyncedAt: new Date(),
      },
    });

    console.log(
      `[EventSync] Successfully synced ${gancioEvents.length} events (deleted ${deletedCount.count} old events)`
    );
    return { success: true, eventCount: gancioEvents.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Update sync status to failed
    await prisma.syncStatus.update({
      where: { id: syncStatus.id },
      data: {
        status: "failed",
        errorMessage,
        lastSyncedAt: new Date(),
      },
    });

    console.error(`[EventSync] Failed to sync events: ${errorMessage}`);
    return { success: false, eventCount: 0, error: errorMessage };
  }
}

/**
 * Gets the last sync status
 */
export async function getLastSyncStatus() {
  return prisma.syncStatus.findFirst({
    orderBy: { lastSyncedAt: "desc" },
  });
}

/**
 * Checks if data is stale (older than specified hours)
 */
export async function isDataStale(hours: number = 12): Promise<boolean> {
  const lastSync = await getLastSyncStatus();

  if (!lastSync || lastSync.status !== "success") {
    return true;
  }

  const staleThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
  return lastSync.lastSyncedAt < staleThreshold;
}

/**
 * Syncs events if data is stale
 */
export async function syncIfStale(locale: Locale): Promise<void> {
  const stale = await isDataStale(12);

  if (stale) {
    console.log("[EventSync] Data is stale, starting sync...");
    await syncEvents(locale);
  } else {
    console.log("[EventSync] Data is fresh, skipping sync");
  }
}
