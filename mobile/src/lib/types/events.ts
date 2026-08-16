// Event Types
// Backend API endpoint: /api/events

// Backend Event type (from Prisma model)
export interface BackendEvent {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  startDatetime: string; // ISO date string
  endDatetime: string | null; // ISO date string
  placeName: string | null;
  placeAddress: string | null;
  imageUrl: string | null;
  tags: string[]; // Parsed from JSON
  ticketUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Sync status from backend
export interface SyncStatus {
  lastSyncedAt: string | null; // ISO date string
  status: 'success' | 'failed' | 'in_progress' | 'never_synced';
  eventCount: number;
  errorMessage?: string | null;
}

// Sync trigger response
export interface SyncTriggerResponse {
  message: string;
  eventCount: number;
}

// Helper type for formatted event display
export interface FormattedEvent {
  id: number;
  title: string;
  description: string;
  formattedDate: string; // e.g., "Sat, Feb 22"
  formattedTime: string; // e.g., "7:00 PM"
  venueName: string;
  venueAddress: string;
  imageUrl: string | null;
  tags: string[];
  ticketUrl: string | null;
  startTimestamp: number;
  endTimestamp: number;
}

// Legacy types kept for compatibility during migration
export interface GancioPlace {
  name: string;
  address: string;
}

export interface GancioMedia {
  url: string;
  name: string;
  focalpoint?: [number, number];
}

export interface GancioOnlineLocation {
  url: string;
}

export interface GancioEvent {
  id: number;
  title: string;
  description: string; // HTML content
  start_datetime: number; // Unix timestamp
  end_datetime: number; // Unix timestamp
  place: GancioPlace;
  media: GancioMedia[];
  tags: string[]; // Tags are simple strings
  online_locations: string | GancioOnlineLocation[]; // Can be string or array
}

// Base URL for media assets (still needed for image URLs)
export const GANCIO_BASE_URL = 'https://melbourne.askapunk.net';
export const GANCIO_MEDIA_URL = `${GANCIO_BASE_URL}/media`;
export const GANCIO_API_URL = `${GANCIO_BASE_URL}/api/events`;
