const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;

const MILLISECONDS_IN_MINUTE = MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE;
const MILLISECONDS_IN_HOUR = MILLISECONDS_IN_MINUTE * MINUTES_IN_HOUR;
const MILLISECONDS_IN_DAY = MILLISECONDS_IN_HOUR * HOURS_IN_DAY;
const MILLISECONDS_IN_WEEK = MILLISECONDS_IN_DAY * DAYS_IN_WEEK;
const MILLISECONDS_IN_MONTH = MILLISECONDS_IN_DAY * DAYS_IN_MONTH;
const MILLISECONDS_IN_YEAR = MILLISECONDS_IN_DAY * DAYS_IN_YEAR;

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Date.now() - date.getTime();

  if (diff < MILLISECONDS_IN_MINUTE) {
    const seconds = Math.floor(diff / MILLISECONDS_IN_SECOND);
    return `${seconds}s`;
  }

  if (diff < MILLISECONDS_IN_HOUR) {
    const minutes = Math.floor(diff / MILLISECONDS_IN_MINUTE);
    return `${minutes}m`;
  }

  if (diff < MILLISECONDS_IN_DAY) {
    const hours = Math.floor(diff / MILLISECONDS_IN_HOUR);
    return `${hours}h`;
  }

  if (diff < MILLISECONDS_IN_WEEK) {
    const days = Math.floor(diff / MILLISECONDS_IN_DAY);
    return `${days}d`;
  }

  if (diff < MILLISECONDS_IN_MONTH) {
    const weeks = Math.floor(diff / MILLISECONDS_IN_WEEK);
    return `${weeks}w`;
  }

  if (diff < MILLISECONDS_IN_YEAR) {
    const months = Math.floor(diff / MILLISECONDS_IN_MONTH);
    return `${months}mo`;
  }

  const years = Math.floor(diff / MILLISECONDS_IN_YEAR);
  return `${years}y`;
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
