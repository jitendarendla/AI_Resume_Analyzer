/**
 * Utility functions for syncing and formatting dates with the real-world local timezone.
 */

export function formatLocalDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return 'N/A';
  try {
    let str = typeof dateInput === 'string' ? dateInput.trim() : dateInput.toISOString();

    // If ISO string lacks timezone indicator ('Z' or offset), append 'Z' so JS parses as UTC
    if (!str.endsWith('Z') && !str.includes('+') && !/T\d{2}:\d{2}:\d{2}.*[-]\d{2}/.test(str)) {
      str += 'Z';
    }

    const d = new Date(str);
    if (isNaN(d.getTime())) return String(dateInput);

    // Formats into local real-world time in browser locale (e.g. 03/08/2026, 10:38:21 PM)
    return d.toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    return String(dateInput);
  }
}

export function formatLocalDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'N/A';
  try {
    let str = typeof dateInput === 'string' ? dateInput.trim() : dateInput.toISOString();
    if (!str.endsWith('Z') && !str.includes('+') && !/T\d{2}:\d{2}:\d{2}.*[-]\d{2}/.test(str)) {
      str += 'Z';
    }

    const d = new Date(str);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateInput);
  }
}
