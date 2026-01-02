/**
 * Format bytes to human-readable size
 */
export function formatSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get relative time string
 */
export function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

/**
 * Format revalidate time to human-readable string
 */
export function formatRevalidate(seconds) {
  if (seconds === undefined || seconds === null) return '-';
  if (seconds === false) return 'never';
  if (seconds === 0) return '0s';

  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const years = days / 365;

  // 1 year or more
  if (years >= 1) {
    return years === 1 ? '1 year' : `${Math.floor(years)} years`;
  }

  // Days
  if (days >= 1) {
    return days === 1 ? '1 day' : `${Math.floor(days)} days`;
  }

  // Hours
  if (hours >= 1) {
    return hours === 1 ? '1 hour' : `${Math.floor(hours)} hours`;
  }

  // Minutes
  if (minutes >= 1) {
    return minutes === 1 ? '1 min' : `${Math.floor(minutes)} mins`;
  }

  // Seconds
  return `${seconds}s`;
}
