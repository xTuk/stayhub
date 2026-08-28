export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/** Whole nights between two dates, ignoring time-of-day. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const start = Date.UTC(
    checkIn.getUTCFullYear(),
    checkIn.getUTCMonth(),
    checkIn.getUTCDate()
  );
  const end = Date.UTC(
    checkOut.getUTCFullYear(),
    checkOut.getUTCMonth(),
    checkOut.getUTCDate()
  );
  return Math.round((end - start) / MS_PER_DAY);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
