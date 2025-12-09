/**
 * Timezone utility functions to convert meeting times from stored timezone to user's local timezone
 */

/**
 * Converts a date/time from a specific timezone to the user's local timezone
 * @param dateTimeString - The date/time string (ISO format or parseable date string)
 * @param sourceTimeZone - The timezone the date/time is in (e.g., 'America/New_York')
 * @returns Date object in user's local timezone
 */
export function convertToLocalTimezone(
  dateTimeString: string,
  sourceTimeZone: string
): Date {
  // Parse the date string as if it's in the source timezone
  // The date comes from backend in ISO format which already includes timezone info
  const date = new Date(dateTimeString);
  
  // The Date object is already in the correct timezone from the backend
  // Just return it as-is for display in local timezone
  return date;
}

/**
 * Formats a date/time to display in user's local timezone with the timezone name
 * @param dateTimeString - The date/time string from the backend
 * @param sourceTimeZone - The original timezone (for reference, shown to user)
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted string showing date/time in local timezone
 */
export function formatInLocalTimezone(
  dateTimeString: string,
  sourceTimeZone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateTimeString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short', // Shows timezone abbreviation like 'PST', 'EST', etc.
  };

  const formatOptions = { ...defaultOptions, ...options };

  return date.toLocaleString('en-US', formatOptions);
}

/**
 * Gets the user's current timezone
 * @returns The user's timezone (e.g., 'America/Los_Angeles')
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Formats date for display
 * @param dateTimeString - The date/time string
 * @returns Formatted date string in local timezone
 */
export function formatDateInLocalTimezone(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats time for display
 * @param dateTimeString - The date/time string
 * @returns Formatted time string in local timezone
 */
export function formatTimeInLocalTimezone(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    // timeZoneName: 'short',
  });
}

/**
 * Get timezone abbreviation for display
 * @returns Timezone abbreviation (e.g., 'PST', 'EST')
 */
export function getTimezoneAbbreviation(): string {
  const date = new Date();
  const timeZoneString = date.toLocaleTimeString('en-US', {
    timeZoneName: 'short',
  });
  // Extract timezone abbreviation from the string
  const match = timeZoneString.match(/\b([A-Z]{2,5})\b$/);
  return match ? match[1] : '';
}

/**
 * Checks if a meeting is today in the user's local timezone
 * @param dateTimeString - The meeting date/time string
 * @returns True if the meeting is today in user's timezone
 */
export function isTodayInLocalTimezone(dateTimeString: string): boolean {
  const meetingDate = new Date(dateTimeString);
  const today = new Date();
  
  return (
    meetingDate.getFullYear() === today.getFullYear() &&
    meetingDate.getMonth() === today.getMonth() &&
    meetingDate.getDate() === today.getDate()
  );
}

/**
 * Checks if a meeting is in the future in the user's local timezone
 * @param dateTimeString - The meeting date/time string
 * @returns True if the meeting is in the future
 */
export function isFutureInLocalTimezone(dateTimeString: string): boolean {
  const meetingDate = new Date(dateTimeString);
  const now = new Date();
  return meetingDate > now;
}

/**
 * Checks if a meeting is currently live (between start and end time)
 * @param startTimeString - Meeting start time
 * @param endTimeString - Meeting end time
 * @returns True if meeting is currently live
 */
export function isMeetingLive(startTimeString: string, endTimeString: string): boolean {
  const now = new Date();
  const startTime = new Date(startTimeString);
  const endTime = new Date(endTimeString);
  return now >= startTime && now <= endTime;
}
