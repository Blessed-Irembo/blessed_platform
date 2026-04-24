export function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // Remove leading 0 if the user typed 078...
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Add +250 prefix
  if (cleaned.startsWith('250')) {
    return '+' + cleaned;
  }
  return '+250' + cleaned;
}
