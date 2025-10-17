// Utility helpers for parsing and validating DOB strings
export function parseDob(value: string): Date | null {
  if (!value) return null;

  // Accept ISO (YYYY-MM-DD)
  const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (isoMatch) {
    const d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  // Accept DD/MM/YYYY
  const parts = value.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
    if (!dd || !mm || !yyyy) return null;
    // Months are 0-based in JS Date
    const d = new Date(yyyy, mm - 1, dd);
    // Validate that the components match (to avoid JS autoadjust)
    if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
    return d;
  }

  return null;
}

export function isFuture(date: Date): boolean {
  const today = new Date();
  // zero time part for comparison
  today.setHours(0, 0, 0, 0);
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d.getTime() > today.getTime();
}

export function calcAge(date: Date): number {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

export function formatDobToDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Format a user's freeform input into DD/MM/YYYY where possible.
 * Examples:
 *  - "09061984" -> "09/06/1984"
 *  - "9/6/1984" -> "09/06/1984"
 *  - "1984-06-09" -> "09/06/1984"
 */
export function formatInputDob(input: string): string {
  if (!input) return '';
  const digits = input.replace(/[^0-9]/g, '');

  // If user typed 8 digits like DDMMYYYY
  if (/^\d{8}$/.test(digits)) {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    return `${dd}/${mm}/${yyyy}`;
  }

  // If user typed 6 digits like DDMMYY -> assume 19xx or 20xx heuristics (not applied here)
  // Try to parse known separators
  const parts = input.split(/[-/\.]/).map(p => p.trim());
  if (parts.length === 3) {
    // detect order: if first part length is 4 it's YYYY-MM-DD
    if (parts[0].length === 4) {
      const yyyy = parts[0];
      const mm = parts[1].padStart(2, '0');
      const dd = parts[2].padStart(2, '0');
      return `${dd}/${mm}/${yyyy}`;
    }
    // else assume DD/MM/YYYY
    const dd = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    const yyyy = parts[2].length === 2 ? `19${parts[2]}` : parts[2];
    return `${dd}/${mm}/${yyyy}`;
  }

  // If input already matches DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return input;

  return input;
}

export function toIsoDate(ddmmyyyy: string): string | null {
  const d = parseDob(ddmmyyyy);
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
