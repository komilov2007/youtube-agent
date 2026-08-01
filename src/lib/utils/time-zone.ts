type WallTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const wallTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function parseWallTime(value: string): WallTime | null {
  const match = wallTimePattern.exec(value);
  if (!match) return null;

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue] = match;
  const wallTime = {
    year: Number(yearValue),
    month: Number(monthValue),
    day: Number(dayValue),
    hour: Number(hourValue),
    minute: Number(minuteValue),
  };
  const check = new Date(
    Date.UTC(
      wallTime.year,
      wallTime.month - 1,
      wallTime.day,
      wallTime.hour,
      wallTime.minute,
    ),
  );

  if (
    check.getUTCFullYear() !== wallTime.year ||
    check.getUTCMonth() + 1 !== wallTime.month ||
    check.getUTCDate() !== wallTime.day ||
    check.getUTCHours() !== wallTime.hour ||
    check.getUTCMinutes() !== wallTime.minute
  ) {
    return null;
  }

  return wallTime;
}

function getWallTimeAtInstant(instant: Date, timeZone: string): WallTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
}

function matchesWallTime(left: WallTime, right: WallTime): boolean {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute
  );
}

/** Converts a timezone-less datetime-local value into an exact UTC instant. */
export function wallTimeToIso(value: string, timeZone: string): string | null {
  const requested = parseWallTime(value);
  if (!requested) return null;

  const wallTimeAsUtc = Date.UTC(
    requested.year,
    requested.month - 1,
    requested.day,
    requested.hour,
    requested.minute,
  );

  try {
    let candidate = wallTimeAsUtc;

    // Recalculate because the offset can change near a daylight-saving boundary.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const observed = getWallTimeAtInstant(new Date(candidate), timeZone);
      const observedAsUtc = Date.UTC(
        observed.year,
        observed.month - 1,
        observed.day,
        observed.hour,
        observed.minute,
      );
      candidate = wallTimeAsUtc - (observedAsUtc - candidate);
    }

    const result = new Date(candidate);
    return matchesWallTime(getWallTimeAtInstant(result, timeZone), requested)
      ? result.toISOString()
      : null;
  } catch {
    return null;
  }
}
