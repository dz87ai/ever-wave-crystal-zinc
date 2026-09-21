export type NoticeMode = "immediate" | "daily" | "weekly" | "off";

export type NoticeSettings = {
  mode: NoticeMode;
  remindEveryHours: number;
  dailyTime: string;
  weeklyDay: number;
  weeklyTime: string;
  timezone: string;
};

export const DEFAULT_NOTICE_SETTINGS: NoticeSettings = {
  mode: "immediate",
  remindEveryHours: 24,
  dailyTime: "17:00",
  weeklyDay: 1,
  weeklyTime: "09:00",
  timezone: "America/New_York",
};

export const NOTICE_MODES: {
  key: NoticeMode;
  title: string;
  body: string;
}[] = [
  {
    key: "immediate",
    title: "Send right away",
    body: "Email as soon as a task is past due, then remind on the cadence below. Several late tasks for the same department go in one email.",
  },
  {
    key: "daily",
    title: "End of day",
    body: "One combined email per department at the time you set — all of that team’s late tasks together.",
  },
  {
    key: "weekly",
    title: "Weekly reminder",
    body: "One combined email per department on the day and time you set — all of that team’s late tasks together.",
  },
  {
    key: "off",
    title: "Don’t send email reminders",
    body: "No automatic late-task emails. You can still send overdue notices once with the button above.",
  },
];

export const NOTICE_TIMEZONES: { value: string; label: string }[] = [
  { value: "America/New_York", label: "Eastern" },
  { value: "America/Chicago", label: "Central" },
  { value: "America/Denver", label: "Mountain" },
  { value: "America/Los_Angeles", label: "Pacific" },
  { value: "America/Phoenix", label: "Arizona" },
  { value: "UTC", label: "UTC" },
];

export const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export const REMIND_OPTIONS: { hours: number; label: string }[] = [
  { hours: 0, label: "Once only — no follow-up" },
  { hours: 4, label: "Every 4 hours" },
  { hours: 8, label: "Every 8 hours" },
  { hours: 12, label: "Every 12 hours" },
  { hours: 24, label: "Every day" },
  { hours: 48, label: "Every 2 days" },
  { hours: 72, label: "Every 3 days" },
  { hours: 168, label: "Every week" },
];

const WEEKDAY_SHORT: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const MODE_SET = new Set<NoticeMode>(["immediate", "daily", "weekly", "off"]);
const TZ_SET = new Set(NOTICE_TIMEZONES.map((z) => z.value));
const REMIND_SET = new Set(REMIND_OPTIONS.map((o) => o.hours));

export function asNoticeMode(value: string | null | undefined): NoticeMode {
  return MODE_SET.has(value as NoticeMode) ? (value as NoticeMode) : "immediate";
}

export function asClock(value: string | null | undefined, fallback = "17:00"): string {
  const match = String(value ?? "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  const hour = Math.min(23, Math.max(0, Number(match[1])));
  const minute = Math.min(59, Math.max(0, Number(match[2])));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function asWeekday(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  const day = Math.trunc(n);
  return day >= 0 && day <= 6 ? day : 1;
}

export function asTimezone(value: string | null | undefined): string {
  const tz = (value ?? "").trim();
  return TZ_SET.has(tz) ? tz : "America/New_York";
}

export function asRemindHours(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 24;
  const hours = Math.max(0, Math.trunc(n));
  return REMIND_SET.has(hours) ? hours : 24;
}

export function normalizeNoticeSettings(
  row: {
    mode?: string | null;
    remindEveryHours?: number | null;
    dailyTime?: string | null;
    weeklyDay?: number | null;
    weeklyTime?: string | null;
    timezone?: string | null;
  } | null | undefined,
): NoticeSettings {
  return {
    mode: asNoticeMode(row?.mode),
    remindEveryHours: asRemindHours(row?.remindEveryHours),
    dailyTime: asClock(row?.dailyTime, "17:00"),
    weeklyDay: asWeekday(row?.weeklyDay),
    weeklyTime: asClock(row?.weeklyTime, "09:00"),
    timezone: asTimezone(row?.timezone),
  };
}

export type ZonedClock = {
  date: string;
  time: string;
  weekday: number;
};

export function zonedClock(timeZone: string, at = new Date()): ZonedClock {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(at).map((part) => [part.type, part.value]),
  );
  const weekday = WEEKDAY_SHORT[parts.weekday ?? "Mon"] ?? 1;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${(parts.hour ?? "00").padStart(2, "0")}:${(parts.minute ?? "00").padStart(2, "0")}`,
    weekday,
  };
}

function addDaysToIso(day: string, amount: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + amount));
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dateNum = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${dateNum}`;
}

export function mostRecentWeeklyDate(clock: ZonedClock, weeklyDay: number, weeklyTime: string): string {
  let back = (clock.weekday - weeklyDay + 7) % 7;
  if (back === 0 && clock.time < weeklyTime) back = 7;
  return addDaysToIso(clock.date, -back);
}

export function digestPeriodKey(settings: NoticeSettings, at = new Date()): string | null {
  if (settings.mode === "immediate" || settings.mode === "off") return null;
  const clock = zonedClock(settings.timezone, at);
  if (settings.mode === "daily") return `d:${clock.date}`;
  return `w:${mostRecentWeeklyDate(clock, settings.weeklyDay, settings.weeklyTime)}`;
}

export function isDigestSlotOpen(settings: NoticeSettings, at = new Date()): boolean {
  if (settings.mode === "immediate" || settings.mode === "off") return false;
  const clock = zonedClock(settings.timezone, at);
  if (settings.mode === "daily") return clock.time >= settings.dailyTime;
  return true;
}

export function isReminderDue(
  lastSent: string | Date | null | undefined,
  hours: number,
  at = new Date(),
): boolean {
  if (!lastSent) return true;
  if (hours <= 0) return false;
  const sent = lastSent instanceof Date ? lastSent : new Date(lastSent);
  if (Number.isNaN(sent.getTime())) return true;
  return at.getTime() - sent.getTime() >= hours * 3_600_000;
}

export function formatClock12(hhmm: string): string {
  const [hRaw, mRaw] = asClock(hhmm).split(":").map(Number);
  const hour24 = hRaw ?? 0;
  const minute = mRaw ?? 0;
  const hour = hour24 % 12 || 12;
  const suffix = hour24 < 12 ? "AM" : "PM";
  return `${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function timezoneLabel(value: string): string {
  return NOTICE_TIMEZONES.find((z) => z.value === value)?.label ?? value;
}

export function weekdayLabel(value: number): string {
  return WEEKDAYS.find((d) => d.value === value)?.label ?? "Monday";
}

export function remindLabel(hours: number): string {
  return REMIND_OPTIONS.find((o) => o.hours === hours)?.label ?? "Every day";
}

export function formatNoticeSummary(settings: NoticeSettings): string {
  const zone = timezoneLabel(settings.timezone);
  if (settings.mode === "off") {
    return "Automatic late-task emails are off. Use “Send overdue notices now” if you want a one-time email.";
  }
  if (settings.mode === "immediate") {
    if (settings.remindEveryHours <= 0) {
      return "Notices go out as soon as a task is past due, once. Several late tasks for the same department are combined.";
    }
    return `Notices go out as soon as a task is past due, then ${remindLabel(settings.remindEveryHours).toLowerCase()}. Several late tasks for the same department are combined.`;
  }
  if (settings.mode === "daily") {
    return `One combined email per department at ${formatClock12(settings.dailyTime)} ${zone}, once a day. Missed windows send the next time the tracker is open after that time.`;
  }
  return `One combined email per department on ${weekdayLabel(settings.weeklyDay)}s at ${formatClock12(settings.weeklyTime)} ${zone}. Missed windows catch up the next time the tracker is open.`;
}
