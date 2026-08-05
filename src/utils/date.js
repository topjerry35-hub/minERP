/**
 * Date utility for Indian Standard Format (DD-MM-YYYY)
 */

export function formatDate(dateInput) {
  if (!dateInput) return '';

  const str = String(dateInput).trim();

  // Already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str;
  }

  // Handle YYYY-MM-DD or YYYY-MM-DD HH:mm:ss / ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [datePart] = str.split(' ');
    const parts = datePart.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
  }

  // Fallback to JS Date object parsing
  const d = new Date(dateInput);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return str;
}

export function getTodayFormatted() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function isDateInRange(targetDateStr, fromDateStr, toDateStr) {
  if (!targetDateStr) return true;
  if (!fromDateStr && !toDateStr) return true;

  const parseToTimestamp = (str) => {
    if (!str) return null;
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      const [d, m, y] = str.split('-');
      return new Date(`${y}-${m}-${d}`).getTime();
    }
    return new Date(str).getTime();
  };

  const targetTs = parseToTimestamp(targetDateStr);
  const fromTs = parseToTimestamp(fromDateStr);
  const toTs = parseToTimestamp(toDateStr);

  if (isNaN(targetTs)) return true;

  if (fromTs && targetTs < fromTs) return false;
  if (toTs && targetTs > toTs + 86400000) return false;

  return true;
}
