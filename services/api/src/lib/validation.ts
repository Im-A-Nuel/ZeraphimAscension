export const isValidAddress = (value: string): boolean =>
  /^0x[a-fA-F0-9]{4,}$/.test(value);

export const parseLimit = (
  raw: unknown,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (typeof raw !== "string" && typeof raw !== "number") {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(Math.trunc(parsed), min), max);
};

export const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};
