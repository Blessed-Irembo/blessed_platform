export function checkIfPharmacyIsOpen(hours?: any): boolean {
  if (!hours) return true; // Legacy fallback

  if (hours.is24Hours) return true;
  
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayStr = DAYS_MAP[currentDayIndex];

  // If the modern 'days' array is defined, verify the current day is included.
  if (Array.isArray(hours.days) && hours.days.length > 0) {
    if (!hours.days.includes(currentDayStr)) {
      return false; // Pharmacy is closed today
    }
  } else if (typeof hours.days === 'string') {
    // Legacy support for string definition e.g., "Monday - Friday"
    if (hours.days === 'Monday - Friday' && (currentDayIndex === 0 || currentDayIndex === 6)) return false;
    if (hours.days === 'Monday - Saturday' && currentDayIndex === 0) return false;
  }

  // Check the exact times
  if (!hours.openTime || !hours.closeTime) return true;

  const currentTotal = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = hours.openTime.split(':').map(Number);
  const [closeH, closeM] = hours.closeTime.split(':').map(Number);
  const openTotal = openH * 60 + (openM || 0);
  const closeTotal = closeH * 60 + (closeM || 0);

  // If closeTotal is less than openTotal (e.g. opens at 20:00 and closes at 02:00), we need special handling over midnight.
  if (closeTotal < openTotal) {
      if (currentTotal >= openTotal || currentTotal <= closeTotal) return true;
      return false;
  }

  return currentTotal >= openTotal && currentTotal <= closeTotal;
}

export function formatOperatingHours(hours?: any, legacyHoursStr?: string): string {
  if (hours && typeof hours.is24Hours !== 'undefined') {
    if (hours.is24Hours) return 'Open 24/7';
    // Handle array of days dynamically
    let daysDisplay = hours.days || 'N/A';
    if (Array.isArray(hours.days)) {
      if (hours.days.length === 7) daysDisplay = 'Everyday';
      else if (hours.days.length > 1) {
          // If consecutive, we could do first - last. But since they can be random (e.g., ['Monday', 'Wednesday']), let's just use the first and last as a summary if there's more than 3, else join them.
          if (hours.days.length <= 3) {
            daysDisplay = hours.days.join(', ');
          } else {
            daysDisplay = `${hours.days[0]} - ${hours.days[hours.days.length - 1]}`;
          }
      }
      else if (hours.days.length === 1) daysDisplay = hours.days[0];
    }
    return `${daysDisplay} • ${hours.openTime || 'N/A'} - ${hours.closeTime || 'N/A'}`;
  }
  return legacyHoursStr || 'Hours not specified';
}
