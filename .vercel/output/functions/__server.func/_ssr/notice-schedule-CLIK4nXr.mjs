//#region node_modules/.nitro/vite/services/ssr/assets/notice-schedule-CLIK4nXr.js
var DEPARTMENTS = [
	{
		key: "sales",
		label: "Sales",
		short: "Sales"
	},
	{
		key: "estimating",
		label: "Estimating",
		short: "Est."
	},
	{
		key: "pre_construction",
		label: "Pre-Construction",
		short: "Pre-Con"
	},
	{
		key: "project_management",
		label: "Project Management",
		short: "PM"
	},
	{
		key: "winporte",
		label: "Winporte",
		short: "Winporte"
	},
	{
		key: "design",
		label: "Design",
		short: "Design"
	},
	{
		key: "engineering",
		label: "Engineering",
		short: "Eng."
	},
	{
		key: "drafting",
		label: "Drafting (Clyde / Justin)",
		short: "Drafting"
	},
	{
		key: "breakdown",
		label: "Breakdown (Manish)",
		short: "Breakdown"
	},
	{
		key: "scheduling",
		label: "Scheduling (Dimble)",
		short: "Sched."
	},
	{
		key: "purchasing",
		label: "Purchasing (Amit)",
		short: "Purch."
	},
	{
		key: "cnc",
		label: "CNC",
		short: "CNC"
	},
	{
		key: "fabrication",
		label: "Fabrication",
		short: "Fab."
	},
	{
		key: "quality",
		label: "Quality",
		short: "Quality"
	},
	{
		key: "installation",
		label: "Installation",
		short: "Install"
	},
	{
		key: "service",
		label: "Service",
		short: "Service"
	}
];
var DEPT_KEY_SET = new Set(DEPARTMENTS.map((d) => d.key));
function isDepartmentKey(value) {
	return DEPT_KEY_SET.has(value);
}
function departmentLabel(key) {
	return DEPARTMENTS.find((d) => d.key === key)?.label ?? key;
}
var ROC_STATUSES = [
	{
		key: "not_started",
		label: "Not started"
	},
	{
		key: "discussed",
		label: "Discussed"
	},
	{
		key: "follow_up",
		label: "Follow-up required"
	},
	{
		key: "ready_for_review",
		label: "Ready for review"
	},
	{
		key: "in_progress",
		label: "In progress"
	},
	{
		key: "released",
		label: "ROC released"
	},
	{
		key: "requires_revision",
		label: "Requires revision"
	},
	{
		key: "on_hold",
		label: "On hold"
	}
];
var ROC_STATUS_SET = new Set(ROC_STATUSES.map((s) => s.key));
var DEPT_STATUSES = [
	{
		key: "na",
		label: "Not applicable"
	},
	{
		key: "not_started",
		label: "Not started"
	},
	{
		key: "discussed",
		label: "Discussed"
	},
	{
		key: "follow_up",
		label: "Follow-up required"
	},
	{
		key: "ready_for_review",
		label: "Ready for review"
	},
	{
		key: "in_progress",
		label: "In progress"
	},
	{
		key: "high_action",
		label: "High importance action"
	},
	{
		key: "low_action",
		label: "Low importance action"
	},
	{
		key: "complete",
		label: "Action completed"
	}
];
var DEPT_STATUS_SET = new Set(DEPT_STATUSES.map((s) => s.key));
var ACTION_PRIORITIES = [{
	key: "high",
	label: "High importance"
}, {
	key: "low",
	label: "Low importance"
}];
var ACTION_STATUSES = [
	{
		key: "open",
		label: "Open"
	},
	{
		key: "in_progress",
		label: "In progress"
	},
	{
		key: "follow_up",
		label: "Follow-up"
	},
	{
		key: "complete",
		label: "Completed"
	}
];
var ITEM_KINDS = [{
	key: "action",
	label: "Action"
}, {
	key: "note",
	label: "Note"
}];
var DOC_KINDS = [{
	key: "outstanding",
	label: "Outstanding"
}, {
	key: "released",
	label: "Released"
}];
function rocStatusLabel(status) {
	return ROC_STATUSES.find((s) => s.key === status)?.label ?? status;
}
function deptStatusLabel(status) {
	return DEPT_STATUSES.find((s) => s.key === status)?.label ?? status;
}
function asDateString(value) {
	if (!value) return null;
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
	const text = String(value);
	if (!text || text === "undefined" || text === "null") return null;
	if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
	const parsed = new Date(text);
	if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
	return text;
}
function isoDay(value) {
	return asDateString(value);
}
function formatDate(value) {
	const day = asDateString(value);
	if (!day) return "TBD";
	if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
		const [y, m, d] = day.split("-");
		const month = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		][Number(m) - 1];
		return month ? `${Number(d)} ${month} ${y}` : day;
	}
	return day;
}
function todayIsoDate() {
	const now = /* @__PURE__ */ new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function fromParts(year, monthIndex, day) {
	const date = new Date(year, monthIndex, day);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function addIsoDays(day, amount) {
	const [y, m, d] = day.split("-").map(Number);
	return fromParts(y, (m ?? 1) - 1, (d ?? 1) + amount);
}
function enumerateIsoDays(start, end) {
	const days = [];
	let current = start;
	while (current <= end) {
		days.push(current);
		current = addIsoDays(current, 1);
		if (days.length > 400) break;
	}
	return days;
}
function minIsoDay(...values) {
	const days = values.map(isoDay).filter((day) => Boolean(day));
	if (!days.length) return null;
	return days.reduce((a, b) => a < b ? a : b);
}
function maxIsoDay(...values) {
	const days = values.map(isoDay).filter((day) => Boolean(day));
	if (!days.length) return null;
	return days.reduce((a, b) => a > b ? a : b);
}
function isDueOverdue(dueDate, complete = false) {
	if (complete) return false;
	const day = asDateString(dueDate);
	if (!day) return false;
	return day < todayIsoDate();
}
function isActionRequired(status) {
	return status === "high_action" || status === "low_action" || status === "follow_up" || status === "in_progress" || status === "ready_for_review";
}
function formatDateTime(value) {
	if (!value) return "TBD";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return formatDate(value);
	return date.toLocaleString(void 0, {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function nextRocNumber(existing) {
	let max = 0;
	for (const value of existing) {
		const match = String(value).trim().match(/(\d+)\s*$/);
		if (!match) continue;
		const n = Number(match[1]);
		if (Number.isFinite(n) && n > max) max = n;
	}
	return `ROC-${String(max + 1).padStart(3, "0")}`;
}
var NOTICE_MODES = [
	{
		key: "immediate",
		title: "Send right away",
		body: "Email as soon as a task is past due, then remind on the cadence below. Several late tasks for the same department go in one email."
	},
	{
		key: "daily",
		title: "End of day",
		body: "One combined email per department at the time you set — all of that team’s late tasks together."
	},
	{
		key: "weekly",
		title: "Weekly reminder",
		body: "One combined email per department on the day and time you set — all of that team’s late tasks together."
	}
];
var NOTICE_TIMEZONES = [
	{
		value: "America/New_York",
		label: "Eastern"
	},
	{
		value: "America/Chicago",
		label: "Central"
	},
	{
		value: "America/Denver",
		label: "Mountain"
	},
	{
		value: "America/Los_Angeles",
		label: "Pacific"
	},
	{
		value: "America/Phoenix",
		label: "Arizona"
	},
	{
		value: "UTC",
		label: "UTC"
	}
];
var WEEKDAYS = [
	{
		value: 1,
		label: "Monday"
	},
	{
		value: 2,
		label: "Tuesday"
	},
	{
		value: 3,
		label: "Wednesday"
	},
	{
		value: 4,
		label: "Thursday"
	},
	{
		value: 5,
		label: "Friday"
	},
	{
		value: 6,
		label: "Saturday"
	},
	{
		value: 0,
		label: "Sunday"
	}
];
var REMIND_OPTIONS = [
	{
		hours: 0,
		label: "Once only — no follow-up"
	},
	{
		hours: 4,
		label: "Every 4 hours"
	},
	{
		hours: 8,
		label: "Every 8 hours"
	},
	{
		hours: 12,
		label: "Every 12 hours"
	},
	{
		hours: 24,
		label: "Every day"
	},
	{
		hours: 48,
		label: "Every 2 days"
	},
	{
		hours: 72,
		label: "Every 3 days"
	},
	{
		hours: 168,
		label: "Every week"
	}
];
var WEEKDAY_SHORT = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6
};
var MODE_SET = /* @__PURE__ */ new Set([
	"immediate",
	"daily",
	"weekly"
]);
var TZ_SET = new Set(NOTICE_TIMEZONES.map((z) => z.value));
var REMIND_SET = new Set(REMIND_OPTIONS.map((o) => o.hours));
function asNoticeMode(value) {
	return MODE_SET.has(value) ? value : "immediate";
}
function asClock(value, fallback = "17:00") {
	const match = String(value ?? "").trim().match(/^(\d{1,2}):(\d{2})/);
	if (!match) return fallback;
	const hour = Math.min(23, Math.max(0, Number(match[1])));
	const minute = Math.min(59, Math.max(0, Number(match[2])));
	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
function asWeekday(value) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return 1;
	const day = Math.trunc(n);
	return day >= 0 && day <= 6 ? day : 1;
}
function asTimezone(value) {
	const tz = (value ?? "").trim();
	return TZ_SET.has(tz) ? tz : "America/New_York";
}
function asRemindHours(value) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return 24;
	const hours = Math.max(0, Math.trunc(n));
	return REMIND_SET.has(hours) ? hours : 24;
}
function normalizeNoticeSettings(row) {
	return {
		mode: asNoticeMode(row?.mode),
		remindEveryHours: asRemindHours(row?.remindEveryHours),
		dailyTime: asClock(row?.dailyTime, "17:00"),
		weeklyDay: asWeekday(row?.weeklyDay),
		weeklyTime: asClock(row?.weeklyTime, "09:00"),
		timezone: asTimezone(row?.timezone)
	};
}
function zonedClock(timeZone, at = /* @__PURE__ */ new Date()) {
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone,
		weekday: "short",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	});
	const parts = Object.fromEntries(fmt.formatToParts(at).map((part) => [part.type, part.value]));
	const weekday = WEEKDAY_SHORT[parts.weekday ?? "Mon"] ?? 1;
	return {
		date: `${parts.year}-${parts.month}-${parts.day}`,
		time: `${(parts.hour ?? "00").padStart(2, "0")}:${(parts.minute ?? "00").padStart(2, "0")}`,
		weekday
	};
}
function addDaysToIso(day, amount) {
	const [y, m, d] = day.split("-").map(Number);
	const date = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + amount));
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
function mostRecentWeeklyDate(clock, weeklyDay, weeklyTime) {
	let back = (clock.weekday - weeklyDay + 7) % 7;
	if (back === 0 && clock.time < weeklyTime) back = 7;
	return addDaysToIso(clock.date, -back);
}
function digestPeriodKey(settings, at = /* @__PURE__ */ new Date()) {
	if (settings.mode === "immediate") return null;
	const clock = zonedClock(settings.timezone, at);
	if (settings.mode === "daily") return `d:${clock.date}`;
	return `w:${mostRecentWeeklyDate(clock, settings.weeklyDay, settings.weeklyTime)}`;
}
function isDigestSlotOpen(settings, at = /* @__PURE__ */ new Date()) {
	if (settings.mode === "immediate") return false;
	const clock = zonedClock(settings.timezone, at);
	if (settings.mode === "daily") return clock.time >= settings.dailyTime;
	return true;
}
function isReminderDue(lastSent, hours, at = /* @__PURE__ */ new Date()) {
	if (!lastSent) return true;
	if (hours <= 0) return false;
	const sent = lastSent instanceof Date ? lastSent : new Date(lastSent);
	if (Number.isNaN(sent.getTime())) return true;
	return at.getTime() - sent.getTime() >= hours * 36e5;
}
function formatClock12(hhmm) {
	const [hRaw, mRaw] = asClock(hhmm).split(":").map(Number);
	const hour24 = hRaw ?? 0;
	const minute = mRaw ?? 0;
	const hour = hour24 % 12 || 12;
	const suffix = hour24 < 12 ? "AM" : "PM";
	return `${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
}
function timezoneLabel(value) {
	return NOTICE_TIMEZONES.find((z) => z.value === value)?.label ?? value;
}
function weekdayLabel(value) {
	return WEEKDAYS.find((d) => d.value === value)?.label ?? "Monday";
}
function remindLabel(hours) {
	return REMIND_OPTIONS.find((o) => o.hours === hours)?.label ?? "Every day";
}
function formatNoticeSummary(settings) {
	const zone = timezoneLabel(settings.timezone);
	if (settings.mode === "immediate") {
		if (settings.remindEveryHours <= 0) return "Notices go out as soon as a task is past due, once. Several late tasks for the same department are combined.";
		return `Notices go out as soon as a task is past due, then ${remindLabel(settings.remindEveryHours).toLowerCase()}. Several late tasks for the same department are combined.`;
	}
	if (settings.mode === "daily") return `One combined email per department at ${formatClock12(settings.dailyTime)} ${zone}, once a day. Missed windows send the next time the tracker is open after that time.`;
	return `One combined email per department on ${weekdayLabel(settings.weeklyDay)}s at ${formatClock12(settings.weeklyTime)} ${zone}. Missed windows catch up the next time the tracker is open.`;
}
//#endregion
export { nextRocNumber as A, isDepartmentKey as C, isoDay as D, isReminderDue as E, rocStatusLabel as M, todayIsoDate as N, maxIsoDay as O, zonedClock as P, isActionRequired as S, isDueOverdue as T, digestPeriodKey as _, DEPT_STATUS_SET as a, formatDateTime as b, NOTICE_MODES as c, ROC_STATUSES as d, ROC_STATUS_SET as f, deptStatusLabel as g, departmentLabel as h, DEPT_STATUSES as i, normalizeNoticeSettings as j, minIsoDay as k, NOTICE_TIMEZONES as l, addIsoDays as m, ACTION_STATUSES as n, DOC_KINDS as o, WEEKDAYS as p, DEPARTMENTS as r, ITEM_KINDS as s, ACTION_PRIORITIES as t, REMIND_OPTIONS as u, enumerateIsoDays as v, isDigestSlotOpen as w, formatNoticeSummary as x, formatDate as y };
