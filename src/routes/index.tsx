import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { listActivity, listRocs } from "@/lib/roc/api";
import { DEPARTMENTS, ROC_STATUSES } from "@/lib/roc/constants";
import { isActionRequired } from "@/lib/roc/format";
import { useOpenTabs } from "@/lib/roc/open-tabs";
import { inActivityRange } from "@/components/activity-list";
import { AddRocDialog } from "@/components/add-roc-dialog";
import { TrackerGrid } from "@/components/tracker-grid";
import { StatusLegend } from "@/components/status-legend";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => Promise.all([listRocs(), listActivity()]),
  component: Home,
});

function Home() {
  const [initialRocs, initialActivity] = Route.useLoaderData();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["rocs"],
    queryFn: () => listRocs(),
    initialData: initialRocs,
  });
  const { data: activity } = useQuery({
    queryKey: ["activity"],
    queryFn: () => listActivity(),
    initialData: initialActivity,
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const navigate = useNavigate();
  const openActions = useOpenTabs((s) => s.openActions);
  const openActivity = useOpenTabs((s) => s.openActivity);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    const q = query.trim().toLowerCase();
    return rows.filter((roc) => {
      if (statusFilter === "action") {
        if (!roc.departments.some((d) => isActionRequired(d.status))) return false;
      } else if (statusFilter !== "all" && roc.overall_status !== statusFilter) {
        return false;
      }
      if (deptFilter !== "all") {
        const cell = roc.departments.find((d) => d.department === deptFilter);
        if (!cell || cell.status === "na" || cell.status === "not_started") return false;
      }
      if (!q) return true;
      const hay = `${roc.roc_number} ${roc.title} ${roc.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [data, query, statusFilter, deptFilter]);

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      action: rows.reduce((sum, r) => sum + r.openActions, 0),
      recent: (activity ?? []).filter((event) => inActivityRange(event.occurred_at, "week"))
        .length,
    };
  }, [data, activity]);

  return (
    <main className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
        <div className="grid max-w-md flex-1 grid-cols-2 gap-3">
          <Stat
            label="Need action"
            value={stats.action}
            onClick={() => {
              openActions();
              void navigate({ to: "/actions", search: { sort: "importance" } });
            }}
          />
          <Stat
            label="Recent activity"
            value={stats.recent}
            onClick={() => {
              openActivity();
              void navigate({ to: "/activity", search: { range: "week" } });
            }}
          />
        </div>
        <div className="flex items-end sm:justify-end">
          <AddRocDialog />
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ROC number or title"
            className="pl-9"
            aria-label="Search ROCs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="lg:w-52" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="action">Action required</SelectItem>
            {ROC_STATUSES.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="lg:w-52" aria-label="Filter by department">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d.key} value={d.key}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <p className="font-medium">Could not load the tracker</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Try again."}
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/70 px-6 py-16 text-center shadow-panel">
          <p className="font-medium">No ROCs match these filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a design change to start the tracker, or clear the search.
          </p>
          <div className="mt-4 flex justify-center">
            <AddRocDialog />
          </div>
        </div>
      ) : (
        <TrackerGrid rocs={filtered} />
      )}

      <StatusLegend />
    </main>
  );
}

function Stat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const body = (
    <>
      <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{value}</dd>
    </>
  );

  if (!onClick) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-panel">
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value}. Open list`}
      className={cn(
        "min-h-11 rounded-lg border border-border bg-card px-4 py-3 text-left shadow-panel transition-colors",
        "hover:border-primary/40 hover:bg-accent",
      )}
    >
      {body}
    </button>
  );
}

