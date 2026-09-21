import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import {
  ACTION_STATUSES,
  DEPARTMENTS,
  departmentLabel,
  type DepartmentKey,
} from "@/lib/roc/constants";
import type { OpenActionItem } from "@/lib/roc/types";
import { formatDate, isDueOverdue } from "@/lib/roc/format";
import { useOpenTabs } from "@/lib/roc/open-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ACTION_SORTS = [
  { key: "importance", label: "Importance" },
  { key: "due", label: "Due date" },
] as const;

export type ActionSortKey = (typeof ACTION_SORTS)[number]["key"];

function compareDue(a: OpenActionItem, b: OpenActionItem): number {
  if (!a.due_date && !b.due_date) return 0;
  if (!a.due_date) return 1;
  if (!b.due_date) return -1;
  return a.due_date.localeCompare(b.due_date);
}

function comparePriority(a: OpenActionItem, b: OpenActionItem): number {
  if (a.priority === b.priority) return 0;
  return a.priority === "high" ? -1 : 1;
}

function sortItems(items: OpenActionItem[], sort: ActionSortKey): OpenActionItem[] {
  const copy = [...items];
  copy.sort((a, b) => {
    if (sort === "due") {
      const overdueA = isDueOverdue(a.due_date) ? 0 : a.due_date ? 1 : 2;
      const overdueB = isDueOverdue(b.due_date) ? 0 : b.due_date ? 1 : 2;
      if (overdueA !== overdueB) return overdueA - overdueB;
      const due = compareDue(a, b);
      return due !== 0 ? due : comparePriority(a, b);
    }
    const p = comparePriority(a, b);
    return p !== 0 ? p : compareDue(a, b);
  });
  return copy;
}

type Group = { key: string; label: string; items: OpenActionItem[] };

function groupItems(items: OpenActionItem[], sort: ActionSortKey): Group[] {
  const sorted = sortItems(items, sort);
  if (sort === "due") {
    return [
      {
        key: "overdue",
        label: "Overdue",
        items: sorted.filter((i) => isDueOverdue(i.due_date)),
      },
      {
        key: "upcoming",
        label: "Upcoming",
        items: sorted.filter((i) => i.due_date && !isDueOverdue(i.due_date)),
      },
      {
        key: "none",
        label: "No due date",
        items: sorted.filter((i) => !i.due_date),
      },
    ].filter((g) => g.items.length > 0);
  }
  return [
    {
      key: "high",
      label: "High importance",
      items: sorted.filter((i) => i.priority === "high"),
    },
    {
      key: "low",
      label: "Low importance",
      items: sorted.filter((i) => i.priority === "low"),
    },
  ].filter((g) => g.items.length > 0);
}

function deptCounts(items: OpenActionItem[]): Map<DepartmentKey, number> {
  const counts = new Map<DepartmentKey, number>();
  for (const item of items) {
    counts.set(item.department, (counts.get(item.department) ?? 0) + 1);
  }
  return counts;
}

function projectOptions(items: OpenActionItem[]) {
  const map = new Map<
    number,
    { id: number; number: string; title: string; count: number }
  >();
  for (const item of items) {
    const existing = map.get(item.roc_id);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(item.roc_id, {
        id: item.roc_id,
        number: item.roc_number,
        title: item.roc_title,
        count: 1,
      });
    }
  }
  return [...map.values()].sort(
    (a, b) => a.number.localeCompare(b.number) || a.id - b.id,
  );
}

export function NeedActionList({
  items,
  sort,
  department,
  rocId,
  showSuccessors,
  onSort,
  onDepartment,
  onRoc,
  onShowSuccessors,
}: {
  items: OpenActionItem[];
  sort: ActionSortKey;
  department?: DepartmentKey;
  rocId?: number;
  showSuccessors: boolean;
  onSort: (sort: ActionSortKey) => void;
  onDepartment: (department?: DepartmentKey) => void;
  onRoc: (rocId?: number) => void;
  onShowSuccessors: (show: boolean) => void;
}) {
  const unblocked = showSuccessors ? items : items.filter((item) => !item.blocked);
  const blockedCount = items.filter((item) => item.blocked).length;
  const projects = projectOptions(unblocked);
  const scoped = rocId ? unblocked.filter((item) => item.roc_id === rocId) : unblocked;
  const counts = deptCounts(scoped);
  const visible = department
    ? scoped.filter((item) => item.department === department)
    : scoped;
  const groups = groupItems(visible, sort);
  const projectLabel = rocId
    ? projects.find((p) => p.id === rocId) ??
      projectOptions(items).find((p) => p.id === rocId)
    : null;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {visible.length} {showSuccessors ? "open" : "ready"}{" "}
          {visible.length === 1 ? "item" : "items"}
          {projectLabel ? ` on ${projectLabel.number}` : ""}
          {department ? ` in ${departmentLabel(department)}` : ""}
          {!showSuccessors && blockedCount
            ? ` · ${blockedCount} successor${blockedCount === 1 ? "" : "s"} waiting`
            : ""}
          .
        </p>
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
          <Tabs value={sort} onValueChange={(value) => onSort(value as ActionSortKey)}>
            <TabsList className="h-10 w-full sm:w-auto" aria-label="Sort items">
              {ACTION_SORTS.map((option) => (
                <TabsTrigger
                  key={option.key}
                  value={option.key}
                  className="min-h-8 flex-1 sm:flex-none"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button
            type="button"
            size="sm"
            variant={showSuccessors ? "secondary" : "outline"}
            className="h-10"
            aria-pressed={showSuccessors}
            onClick={() => onShowSuccessors(!showSuccessors)}
          >
            {showSuccessors ? "Hide successors" : "Show successors"}
          </Button>
          <Select
            value={rocId != null ? String(rocId) : "all"}
            onValueChange={(value) =>
              onRoc(value === "all" ? undefined : Number(value))
            }
          >
            <SelectTrigger className="h-10 w-full sm:w-64" aria-label="Filter by project">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(24rem,70vh)]">
              <SelectItem value="all">All projects ({unblocked.length})</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.number} · {project.title} ({project.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={department ?? "all"}
            onValueChange={(value) =>
              onDepartment(value === "all" ? undefined : (value as DepartmentKey))
            }
          >
            <SelectTrigger
              className="h-10 w-full sm:w-60"
              aria-label="Filter by department"
            >
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(24rem,70vh)]">
              <SelectItem value="all">All departments ({scoped.length})</SelectItem>
              {DEPARTMENTS.map((dept) => {
                const count = counts.get(dept.key) ?? 0;
                return (
                  <SelectItem key={dept.key} value={dept.key}>
                    {dept.label}
                    {count ? ` (${count})` : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/70 px-6 py-12 text-center shadow-panel">
          <p className="font-medium">
            {items.length === 0
              ? "Nothing needs action"
              : !showSuccessors && blockedCount && scoped.length === 0
                ? "Remaining items are successors"
                : "No open items for this filter"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {!showSuccessors && blockedCount
              ? "Turn on Show successors to see work waiting on a predecessor, or pick another project."
              : "Pick another project or department, or switch back to all."}
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="grid gap-3">
            <h2 className="flex items-baseline gap-2 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {group.label}
              <span className="tabular-nums">{group.items.length}</span>
            </h2>
            <ul className="grid gap-3">
              {group.items.map((item) => (
                <li key={item.id}>
                  <NeedActionRow item={item} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function NeedActionRow({ item }: { item: OpenActionItem }) {
  const addTab = useOpenTabs((s) => s.add);
  const overdue = isDueOverdue(item.due_date);
  const statusLabel =
    ACTION_STATUSES.find((s) => s.key === item.status)?.label ?? item.status;

  const openItem = () =>
    addTab({
      id: item.roc_id,
      rocNumber: item.roc_number,
      title: item.roc_title,
    });

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={item.priority === "high" ? "high" : "low"}>
          {item.priority === "high" ? "High" : "Low"}
        </Badge>
        <Badge variant="outline">{statusLabel}</Badge>
        <Badge variant="muted">{departmentLabel(item.department)}</Badge>
        {item.blocked ? <Badge variant="muted">Successor</Badge> : null}
        <h3 className="min-w-0 flex-1 text-sm font-medium">
          <Link
            to="/roc/$id"
            params={{ id: String(item.roc_id) }}
            search={{ dept: item.department, item: item.id }}
            onClick={openItem}
            className="text-primary no-underline hover:underline"
          >
            {item.title}
          </Link>
        </h3>
      </div>
      {item.details ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.details}</p>
      ) : null}
      {item.blocked && item.predecessor_title ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Waiting on {item.predecessor_title}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <Link
          to="/roc/$id"
          params={{ id: String(item.roc_id) }}
          search={{ dept: item.department, item: item.id }}
          onClick={openItem}
          className="font-medium text-foreground no-underline hover:underline"
        >
          {item.roc_number} · {item.roc_title}
        </Link>
        {item.due_date ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-[0.65rem]",
              overdue ? "text-status-high" : "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-3.5" />
            {overdue ? "Overdue" : "Due"} {formatDate(item.due_date)}
          </span>
        ) : (
          <span className="font-mono text-[0.65rem] text-muted-foreground">No due date</span>
        )}
      </div>
    </article>
  );
}