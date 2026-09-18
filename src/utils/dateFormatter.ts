/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Robust, production-grade localized date formatter for Uzbekistan (uz-UZ)
 * Prevents any "Invalid Date" UI defects across transaction ledgers, order history, and audit logs.
 */

export function parseSafeDate(input: string | number | Date | null | undefined): Date | null {
  if (input === null || input === undefined || input === "") {
    return null;
  }
  
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  // If numeric timestamp (seconds vs milliseconds)
  if (typeof input === "number") {
    const ts = input < 10000000000 ? input * 1000 : input;
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }

  // String parsing
  try {
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    // Handle specific formats like "DD.MM.YYYY"
    if (typeof input === "string" && input.includes(".")) {
      const parts = input.split(".");
      if (parts.length === 3) {
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(d.getTime())) return d;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function formatUzbekDate(
  input: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseSafeDate(input);
  if (!d) return "—";

  try {
    const formatter = new Intl.DateTimeFormat("uz-UZ", options || {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return formatter.format(d);
  } catch {
    // Fallback if uz-UZ is not supported in the host environment
    return d.toISOString().split("T")[0];
  }
}

export function formatUzbekDateTime(
  input: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseSafeDate(input);
  if (!d) return "—";

  try {
    const formatter = new Intl.DateTimeFormat("uz-UZ", options || {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return formatter.format(d);
  } catch {
    return d.toLocaleString();
  }
}

export function formatUzbekTime(
  input: string | number | Date | null | undefined
): string {
  const d = parseSafeDate(input);
  if (!d) return "—";

  try {
    const formatter = new Intl.DateTimeFormat("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return formatter.format(d);
  } catch {
    return d.toTimeString().split(" ")[0];
  }
}
