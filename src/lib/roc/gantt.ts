import { DEPARTMENTS, type DepartmentKey } from "./constants";
import {
  addIsoDays,
  enumerateIsoDays,
  isoDay,
  maxIsoDay,
  minIsoDay,
  todayIsoDate,
} from "./format";

export type GanttTask = {
  id: number;
  title: string;
  department: DepartmentKey;
  kind?: string;
  due_date: string | null;
  status: string;
  priority: string;
  predecessor_id: number | null;
  created_at: string;
};

export type GanttBar = {
  id: number;
  title: string;
  department: DepartmentKey;
  start: string;
  end: string;
  due: string | null;
  complete: boolean;
  high: boolean;
  overdue: boolean;
  predecessorId: number | null;
};

export function wouldCreateCycle(
  items: Array<{ id: number; predecessor_id: number | null }>,
  itemId: number,
  predecessorId: number,
): boolean {
  if (itemId === predecessorId) return true;
  const byId = new Map(items.map((item) => [item.id, item]));
  const seen = new Set<number>([itemId]);
  let walk: number | null = predecessorId;
  while (walk) {
    if (seen.has(walk)) return true;
    seen.add(walk);
    walk = byId.get(walk)?.predecessor_id ?? null;
  }
  return false;
}

function resolveSpan(
  item: GanttTask,
  byId: Map<number, GanttTask>,
  memo: Map<number, { start: string; end: string }>,
  stack: Set<number>,
): { start: string; end: string } {
  const cached = memo.get(item.id);
  if (cached) return cached;
  if (stack.has(item.id)) {
    const created = isoDay(item.created_at) ?? todayIsoDate();
    return { start: created, end: item.due_date && item.due_date > created ? item.due_date : addIsoDays(created, 4) };
  }
  stack.add(item.id);
  const created = isoDay(item.created_at) ?? todayIsoDate();
  let start = created;
  if (item.predecessor_id) {
    const pred = byId.get(item.predecessor_id);
    if (pred) {
      const predSpan = resolveSpan(pred, byId, memo, stack);
      start = addIsoDays(predSpan.end, 1);
    }
  } else if (item.due_date) {
    const lead = addIsoDays(item.due_date, -4);
    start = lead < created ? lead : created;
    if (start > item.due_date) start = item.due_date;
  }
  let end = item.due_date && item.due_date >= start ? item.due_date : addIsoDays(start, 4);
  if (end < start) end = start;
  const span = { start, end };
  memo.set(item.id, span);
  stack.delete(item.id);
  return span;
}

export function buildGantt(
  items: GanttTask[],
  deadline: string | null,
): {
  bars: GanttBar[];
  rangeStart: string;
  rangeEnd: string;
  days: string[];
  today: string;
} {
  const tasks = items.filter((item) => item.kind !== "note");
  const byId = new Map(tasks.map((item) => [item.id, item]));
  const memo = new Map<number, { start: string; end: string }>();
  const today = todayIsoDate();
  const bars: GanttBar[] = tasks.map((item) => {
    const span = resolveSpan(item, byId, memo, new Set());
    const complete = item.status === "complete";
    return {
      id: item.id,
      title: item.title,
      department: item.department,
      start: span.start,
      end: span.end,
      due: item.due_date,
      complete,
      high: item.priority === "high",
      overdue: Boolean(item.due_date && item.due_date < today && !complete),
      predecessorId: item.predecessor_id,
    };
  });

  const rangeStart =
    minIsoDay(
      ...bars.map((bar) => bar.start),
      today,
      deadline,
    ) ?? today;
  const rangeEnd =
    maxIsoDay(
      ...bars.map((bar) => bar.end),
      today,
      deadline,
    ) ?? addIsoDays(today, 14);

  const paddedStart = addIsoDays(rangeStart, -1);
  const paddedEnd = addIsoDays(rangeEnd, 2);

  return {
    bars,
    rangeStart: paddedStart,
    rangeEnd: paddedEnd,
    days: enumerateIsoDays(paddedStart, paddedEnd),
    today,
  };
}

function compareSchedule(a: GanttBar, b: GanttBar): number {
  if (a.start !== b.start) return a.start.localeCompare(b.start);
  if (a.end !== b.end) return a.end.localeCompare(b.end);
  return a.id - b.id;
}

/** Row order inside a department: earliest start first, successors after their predecessor. */
export function orderBarsInDepartment(bars: GanttBar[]): GanttBar[] {
  if (bars.length < 2) return bars;
  const ids = new Set(bars.map((bar) => bar.id));
  const remaining = new Map(bars.map((bar) => [bar.id, bar]));
  const indegree = new Map<number, number>();
  const children = new Map<number, number[]>();
  for (const bar of bars) {
    indegree.set(bar.id, 0);
    children.set(bar.id, []);
  }
  for (const bar of bars) {
    const pred = bar.predecessorId;
    if (pred && ids.has(pred) && pred !== bar.id) {
      indegree.set(bar.id, (indegree.get(bar.id) ?? 0) + 1);
      children.get(pred)?.push(bar.id);
    }
  }

  const ready = bars
    .filter((bar) => (indegree.get(bar.id) ?? 0) === 0)
    .sort(compareSchedule);
  const ordered: GanttBar[] = [];
  while (ready.length) {
    const next = ready.shift()!;
    if (!remaining.has(next.id)) continue;
    remaining.delete(next.id);
    ordered.push(next);
    for (const childId of children.get(next.id) ?? []) {
      const deg = (indegree.get(childId) ?? 1) - 1;
      indegree.set(childId, deg);
      if (deg === 0) {
        const child = remaining.get(childId);
        if (child) {
          ready.push(child);
          ready.sort(compareSchedule);
        }
      }
    }
  }
  return ordered.concat([...remaining.values()].sort(compareSchedule));
}

/** Department sections follow predecessor chains, then earliest start. */
export function orderDepartmentGroups<T extends { key: DepartmentKey; bars: GanttBar[] }>(
  groups: T[],
): T[] {
  if (groups.length < 2) return groups;
  const byKey = new Map(groups.map((group) => [group.key, group]));
  const keys = groups.map((group) => group.key);
  const present = new Set(keys);
  const indegree = new Map<DepartmentKey, number>();
  const children = new Map<DepartmentKey, DepartmentKey[]>();
  for (const key of keys) {
    indegree.set(key, 0);
    children.set(key, []);
  }

  const barById = new Map<number, GanttBar>();
  for (const group of groups) {
    for (const bar of group.bars) barById.set(bar.id, bar);
  }

  const edges = new Set<string>();
  for (const group of groups) {
    for (const bar of group.bars) {
      if (!bar.predecessorId) continue;
      const pred = barById.get(bar.predecessorId);
      if (!pred || pred.department === bar.department) continue;
      if (!present.has(pred.department)) continue;
      const edge = `${pred.department}->${bar.department}`;
      if (edges.has(edge)) continue;
      edges.add(edge);
      indegree.set(bar.department, (indegree.get(bar.department) ?? 0) + 1);
      children.get(pred.department)?.push(bar.department);
    }
  }

  const deptIndex = new Map(DEPARTMENTS.map((dept, index) => [dept.key, index]));
  const earliest = (key: DepartmentKey) => {
    let min = "9999-99-99";
    for (const bar of byKey.get(key)?.bars ?? []) {
      if (bar.start < min) min = bar.start;
    }
    return min;
  };
  const compareDept = (a: DepartmentKey, b: DepartmentKey) => {
    const start = earliest(a).localeCompare(earliest(b));
    if (start !== 0) return start;
    return (deptIndex.get(a) ?? 99) - (deptIndex.get(b) ?? 99);
  };

  const ready = keys.filter((key) => (indegree.get(key) ?? 0) === 0).sort(compareDept);
  const ordered: T[] = [];
  const seen = new Set<DepartmentKey>();
  while (ready.length) {
    const next = ready.shift()!;
    if (seen.has(next)) continue;
    seen.add(next);
    const group = byKey.get(next);
    if (group) ordered.push(group);
    for (const child of children.get(next) ?? []) {
      const deg = (indegree.get(child) ?? 1) - 1;
      indegree.set(child, deg);
      if (deg === 0) {
        ready.push(child);
        ready.sort(compareDept);
      }
    }
  }
  const leftover = keys.filter((key) => !seen.has(key)).sort(compareDept);
  for (const key of leftover) {
    const group = byKey.get(key);
    if (group) ordered.push(group);
  }
  return ordered;
}
