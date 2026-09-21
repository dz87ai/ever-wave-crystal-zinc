export const DEPARTMENTS = [
  { key: "sales", label: "Sales", short: "Sales" },
  { key: "estimating", label: "Estimating", short: "Est." },
  { key: "pre_construction", label: "Pre-Construction", short: "Pre-Con" },
  { key: "project_management", label: "Project Management", short: "PM" },
  { key: "winporte", label: "Winporte", short: "Winporte" },
  { key: "design", label: "Design", short: "Design" },
  { key: "engineering", label: "Engineering", short: "Eng." },
  { key: "drafting", label: "Drafting (Clyde / Justin)", short: "Drafting" },
  { key: "breakdown", label: "Breakdown (Manish)", short: "Breakdown" },
  { key: "scheduling", label: "Scheduling (Dimble)", short: "Sched." },
  { key: "purchasing", label: "Purchasing (Amit)", short: "Purch." },
  { key: "cnc", label: "CNC", short: "CNC" },
  { key: "fabrication", label: "Fabrication", short: "Fab." },
  { key: "quality", label: "Quality", short: "Quality" },
  { key: "installation", label: "Installation", short: "Install" },
  { key: "service", label: "Service", short: "Service" },
] as const;

export type DepartmentKey = (typeof DEPARTMENTS)[number]["key"];

export const DEPT_KEY_SET = new Set<string>(DEPARTMENTS.map((d) => d.key));

export function isDepartmentKey(value: string): value is DepartmentKey {
  return DEPT_KEY_SET.has(value);
}

export function departmentLabel(key: string): string {
  return DEPARTMENTS.find((d) => d.key === key)?.label ?? key;
}

export const ROC_STATUSES = [
  { key: "not_started", label: "Not started" },
  { key: "discussed", label: "Discussed" },
  { key: "follow_up", label: "Follow-up required" },
  { key: "ready_for_review", label: "Ready for review" },
  { key: "in_progress", label: "In progress" },
  { key: "released", label: "ROC released" },
  { key: "requires_revision", label: "Requires revision" },
  { key: "on_hold", label: "On hold" },
] as const;

export type RocStatus = (typeof ROC_STATUSES)[number]["key"];

export const ROC_STATUS_SET = new Set<string>(ROC_STATUSES.map((s) => s.key));

export const DEPT_STATUSES = [
  { key: "na", label: "Not applicable" },
  { key: "not_started", label: "Not started" },
  { key: "discussed", label: "Discussed" },
  { key: "follow_up", label: "Follow-up required" },
  { key: "ready_for_review", label: "Ready for review" },
  { key: "in_progress", label: "In progress" },
  { key: "high_action", label: "High importance action" },
  { key: "low_action", label: "Low importance action" },
  { key: "complete", label: "Action completed" },
] as const;

export type DeptStatusKey = (typeof DEPT_STATUSES)[number]["key"];

export const DEPT_STATUS_SET = new Set<string>(DEPT_STATUSES.map((s) => s.key));

export const ACTION_PRIORITIES = [
  { key: "high", label: "High importance" },
  { key: "low", label: "Low importance" },
] as const;

export type ActionPriority = (typeof ACTION_PRIORITIES)[number]["key"];

export const ACTION_STATUSES = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "follow_up", label: "Follow-up" },
  { key: "complete", label: "Completed" },
] as const;

export type ActionStatus = (typeof ACTION_STATUSES)[number]["key"];

export const ITEM_KINDS = [
  { key: "action", label: "Action" },
  { key: "note", label: "Note" },
] as const;

export type ItemKind = (typeof ITEM_KINDS)[number]["key"];

export const DOC_KINDS = [
  { key: "outstanding", label: "Outstanding" },
  { key: "released", label: "Released" },
] as const;

export type DocKind = (typeof DOC_KINDS)[number]["key"];
