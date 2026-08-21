import { api } from '@/lib/api/api';
import {
  BackendEvent,
  FormattedEvent,
  SyncStatus,
  SyncTriggerResponse,
} from '@/lib/types/events';
import type { Locale } from '@/lib/state/locale-store';

// Fetch all events from the backend API
export async function fetchEvents(locale: Locale): Promise<BackendEvent[]> {
  const events = await api.get<BackendEvent[]>(
    `/api/events?locale=${locale}`
  );

  return events || [];
}

// Fetch sync status from the backend
export async function fetchSyncStatus(): Promise<SyncStatus> {
  const status = await api.get<SyncStatus>('/api/events/status');
  return status || {
    lastSyncedAt: null,
    status: 'never_synced',
    eventCount: 0,
  };
}

// Trigger manual sync
export async function triggerSync(
  locale: Locale
): Promise<SyncTriggerResponse> {
  const response = await api.post<SyncTriggerResponse>(
    `/api/events/sync?locale=${locale}`,
    {}
  );

  return response;
}

// Format a date from ISO string
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Format time from ISO string
export function formatEventTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Strip HTML tags from description
export function stripHtml(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Convert backend event to formatted event for display
export function formatEvent(event: BackendEvent): FormattedEvent {
  const startDate = new Date(event.startDatetime);
  const endDate = event.endDatetime ? new Date(event.endDatetime) : startDate;

  return {
    id: event.id,
    title: event.title,
    description: stripHtml(event.description),
    formattedDate: formatEventDate(event.startDatetime),
    formattedTime: formatEventTime(event.startDatetime),
    venueName: event.placeName || 'TBA',
    venueAddress: event.placeAddress || '',
    imageUrl: event.imageUrl,
    tags: event.tags || [],
    ticketUrl: event.ticketUrl,
    startTimestamp: Math.floor(startDate.getTime() / 1000),
    endTimestamp: Math.floor(endDate.getTime() / 1000),
  };
}

// Sort events by date (upcoming first)
export function sortEventsByDate(events: BackendEvent[]): BackendEvent[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.startDatetime).getTime();
    const dateB = new Date(b.startDatetime).getTime();
    return dateA - dateB;
  });
}

// Filter events by search query
export function filterEvents(events: FormattedEvent[], query: string): FormattedEvent[] {
  if (!query.trim()) return events;

  const searchLower = query.toLowerCase().trim();
  // Strip # prefix for tag matching (tags are stored without #)
  const tagSearch = searchLower.startsWith('#') ? searchLower.slice(1) : searchLower;

  return events.filter((event) => {
    const titleMatch = event.title.toLowerCase().includes(searchLower);
    const venueMatch = event.venueName.toLowerCase().includes(searchLower);
    // Use tagSearch (without #) to match tags
    const tagMatch = tagSearch && event.tags.some((tag) => tag.toLowerCase().includes(tagSearch));

    return titleMatch || venueMatch || tagMatch;
  });
}

// Format sync date for display
export function formatSyncDate(dateString: string | null): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
