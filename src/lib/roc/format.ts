import { DEPT_STATUSES, ROC_STATUSES, type DeptStatusKey } from "./constants";

export function rocStatusLabel(status: string): string {
  return ROC_STATUSES.find((s) => s.key === status)?.label ?? status;
}

export function deptStatusLabel(status: string): string {
  return DEPT_STATUSES.find((s) => s.key === status)?.label ?? status;
}

function asDateString(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const text = String(value);
  if (!text || text === "undefined" || text === "null") return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return text;
}

export function isoDay(value: string | Date | null | undefined): string | null {
  return asDateString(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  const day = asDateString(value);
  if (!day) return "TBD";
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const [y, m, d] = day.split("-");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const month = months[Number(m) - 1];
    return month ? `${Number(d)} ${month} ${y}` : day;
  }
  return day;
}

export function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromParts(year: number, monthIndex: number, day: number): string {
  const date = new Date(year, monthIndex, day);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addIsoDays(day: string, amount: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return fromParts(y, (m ?? 1) - 1, (d ?? 1) + amount);
}

export function enumerateIsoDays(start: string, end: string): string[] {
  const days: string[] = [];
  let current = start;
  while (current <= end) {
    days.push(current);
    current = addIsoDays(current, 1);
    if (days.length > 400) break;
  }
  return days;
}

export function minIsoDay(
  ...values: Array<string | Date | null | undefined>
): string | null {
  const days = values.map(isoDay).filter((day): day is string => Boolean(day));
  if (!days.length) return null;
  return days.reduce((a, b) => (a < b ? a : b));
}

export function maxIsoDay(
  ...values: Array<string | Date | null | undefined>
): string | null {
  const days = values.map(isoDay).filter((day): day is string => Boolean(day));
  if (!days.length) return null;
  return days.reduce((a, b) => (a > b ? a : b));
}

export function isDueOverdue(
  dueDate: string | Date | null | undefined,
  complete = false,
): boolean {
  if (complete) return false;
  const day = asDateString(dueDate);
  if (!day) return false;
  return day < todayIsoDate();
}

export function isActionRequired(status: DeptStatusKey | string): boolean {
  return (
    status === "high_action" ||
    status === "low_action" ||
    status === "follow_up" ||
    status === "in_progress" ||
    status === "ready_for_review"
  );
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "TBD";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function nextRocNumber(existing: string[]): string {
  let max = 0;
  for (const value of existing) {
    const match = String(value).trim().match(/(\d+)\s*$/);
    if (!match) continue;
    const n = Number(match[1]);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `ROC-${String(max + 1).padStart(3, "0")}`;
}
