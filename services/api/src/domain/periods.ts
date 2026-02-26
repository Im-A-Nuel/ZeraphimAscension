const MS_PER_DAY = 86_400_000;

export const getIsoWeekPeriod = (date = new Date()): string => {
  const workingDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = (workingDate.getUTCDay() + 6) % 7;
  workingDate.setUTCDate(workingDate.getUTCDate() - day + 3);

  const firstThursday = new Date(Date.UTC(workingDate.getUTCFullYear(), 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);

  const week =
    1 + Math.round((workingDate.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY));

  return `${workingDate.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

export const resolvePeriod = (period: string | undefined): string =>
  !period || period === "current" ? getIsoWeekPeriod() : period;
