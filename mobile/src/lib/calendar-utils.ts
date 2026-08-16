import { FormattedEvent, BackendEvent, GANCIO_BASE_URL } from '@/lib/types/events';

function formatDateForGCal(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function buildGoogleCalendarUrl(
  formatted: FormattedEvent,
  raw: BackendEvent
): string {
  const startFormatted = formatDateForGCal(raw.startDatetime);

  let endFormatted: string;
  if (raw.endDatetime) {
    endFormatted = formatDateForGCal(raw.endDatetime);
  } else {
    const startMs = new Date(raw.startDatetime).getTime();
    const endMs = startMs + 3 * 60 * 60 * 1000;
    endFormatted = formatDateForGCal(new Date(endMs).toISOString());
  }

  const location = formatted.venueAddress
    ? `${formatted.venueName}, ${formatted.venueAddress}`
    : formatted.venueName;

  const details = `${GANCIO_BASE_URL}/event/${raw.id}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: formatted.title,
    dates: `${startFormatted}/${endFormatted}`,
    location,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
