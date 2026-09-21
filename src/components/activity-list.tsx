import { Link } from "@tanstack/react-router";
import { DEPARTMENTS, departmentLabel, isDepartmentKey, type DepartmentKey } from "@/lib/roc/constants";
import type { ActivityEvent, ActivityKind } from "@/lib/roc/types";
import { formatDateTime } from "@/lib/roc/format";
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

export const ACTIVITY_RANGES = [
  { key: "day", label: "Last day" },
  { key: "week", label: "Last week" },
  { key: "month", label: "Last month" },
] as const;

export type ActivityRangeKey = (typeof ACTIVITY_RANGES)[number]["key"];

const KIND_LABEL: Record<ActivityKind, string> = {
  roc_created: "Project created",
  action_created: "Action added",
  note_created: "Note added",
  action_completed: "Marked complete",
  action_reopened: "Reopened",
  follow_up: "Follow-up posted",
};

const KIND_VARIANT: Record<ActivityKind, "complete" | "high" | "low" | "progress" | "muted" | "outline"> = {
  roc_created: "progress",
  action_created: "low",
  note_created: "muted",
  action_completed: "complete",
  action_reopened: "high",
  follow_up: "outline",
};

export function inActivityRange(occurredAt: string, range: ActivityRangeKey): boolean {
  const at = new Date(occurredAt).getTime();
  if (Number.isNaN(at)) return false;
  const hours = range === "day" ? 24 : range === "week" ? 24 * 7 : 24 * 30;
  return Date.now() - at <= hours * 60 * 60 * 1000;
}

export function ActivityList({
  items,
  range,
  department,
  rocId,
  onRange,
  onDepartment,
  onRoc,
}: {
  items: ActivityEvent[];
  range: ActivityRangeKey;
  department?: DepartmentKey;
  rocId?: number;
  onRange: (next: ActivityRangeKey) => void;
  onDepartment: (next?: DepartmentKey) => void;
  onRoc: (next?: number) => void;
}) {
  const scoped = items.filter((item) => inActivityRange(item.occurred_at, range));
  const byRoc = rocId ? scoped.filter((item) => item.roc_id === rocId) : scoped;
  const visible = department
    ? byRoc.filter((item) => item.department === department)
    : byRoc;

  const projects = [...new Map(scoped.map((item) => [item.roc_id, item])).values()]
    .map((item) => ({
      id: item.roc_id,
      number: item.roc_number,
      title: item.roc_title,
      count: scoped.filter((row) => row.roc_id === item.roc_id).length,
    }))
    .sort((a, b) => a.number.localeCompare(b.number));

  const counts = new Map<string, number>();
  for (const item of byRoc) {
    if (!item.department) continue;
    counts.set(item.department, (counts.get(item.department) ?? 0) + 1);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_RANGES.map((option) => (
            <Button
              key={option.key}
              type="button"
              size="sm"
              variant={range === option.key ? "secondary" : "outline"}
              onClick={() => onRange(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
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
              <SelectItem value="all">All projects ({scoped.length})</SelectItem>
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
            <SelectTrigger className="h-10 w-full sm:w-60" aria-label="Filter by department">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent className="max-h-[min(24rem,70vh)]">
              <SelectItem value="all">All departments ({byRoc.length})</SelectItem>
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
          <p className="font-medium">No activity in this window</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a longer timeframe, or another project or department.
          </p>
        </div>
      ) : (
        <ol className="grid gap-3">
          {visible.map((item) => (
            <li key={item.id}>
              <ActivityRow item={item} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityEvent }) {
  const addTab = useOpenTabs((s) => s.add);
  const openItem = () =>
    addTab({
      id: item.roc_id,
      rocNumber: item.roc_number,
      title: item.roc_title,
    });

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={KIND_VARIANT[item.kind]}>{KIND_LABEL[item.kind]}</Badge>
        {item.department && isDepartmentKey(item.department) ? (
          <Badge variant="muted">{departmentLabel(item.department)}</Badge>
        ) : null}
        <h3 className="min-w-0 flex-1 text-sm font-medium">
          {item.action_item_id ? (
            <Link
              to="/roc/$id"
              params={{ id: String(item.roc_id) }}
              search={{
                dept: item.department && isDepartmentKey(item.department)
                  ? item.department
                  : undefined,
                item: item.action_item_id,
              }}
              onClick={openItem}
              className="text-primary no-underline hover:underline"
            >
              {item.title}
            </Link>
          ) : (
            <Link
              to="/roc/$id"
              params={{ id: String(item.roc_id) }}
              onClick={openItem}
              className="text-primary no-underline hover:underline"
            >
              {item.title}
            </Link>
          )}
        </h3>
      </div>
      {item.details && item.kind === "follow_up" ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.details}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <Link
          to="/roc/$id"
          params={{ id: String(item.roc_id) }}
          search={
            item.action_item_id
              ? {
                  dept:
                    item.department && isDepartmentKey(item.department)
                      ? item.department
                      : undefined,
                  item: item.action_item_id,
                }
              : undefined
          }
          onClick={openItem}
          className="font-medium text-foreground no-underline hover:underline"
        >
          {item.roc_number} · {item.roc_title}
        </Link>
        <span>{item.posted_as}</span>
        <span className="font-mono text-[0.65rem]">{formatDateTime(item.occurred_at)}</span>
      </div>
    </article>
  );
}
