/**
 * Date/time formatters that always show the year when the date is from a
 * different year than today. This avoids confusion like showing "23 abr."
 * for a date that is actually 23/04/2027.
 */

const CURRENT_YEAR = new Date().getFullYear();

function toDate(input: Date | string | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return input;
  // Accept "YYYY-MM-DD" as a local date (not UTC)
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(input + "T00:00:00");
  }
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/** "23/04/2026" — full date, always with year */
export function formatDateBR(input: Date | string | null | undefined): string {
  const d = toDate(input);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR");
}

/**
 * "23 abr." (current year) or "23 abr. 2027" (different year).
 * Use for compact date displays like list cells, badges.
 */
export function formatDateShort(input: Date | string | null | undefined): string {
  const d = toDate(input);
  if (!d) return "—";
  const sameYear = d.getFullYear() === CURRENT_YEAR;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
}

/**
 * "23/04 14:30" (current year) or "23/04/2027 14:30" (different year).
 * Use for date+time displays like message history rows.
 */
export function formatDateTime(input: Date | string | null | undefined): string {
  const d = toDate(input);
  if (!d) return "—";
  const sameYear = d.getFullYear() === CURRENT_YEAR;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: sameYear ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Full date+time with year always shown — use in expanded views/details. */
export function formatDateTimeFull(input: Date | string | null | undefined): string {
  const d = toDate(input);
  if (!d) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
