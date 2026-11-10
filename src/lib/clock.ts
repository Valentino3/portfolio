// One formatter, reused: constructing an Intl.DateTimeFormat is the costly part.
const buenosAires = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/Argentina/Buenos_Aires',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** "HH:MM" on a 24 hour clock in Buenos Aires (UTC-3, no daylight saving). */
export function formatLocalTime(date: Date): string {
  return buenosAires.format(date);
}
