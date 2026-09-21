import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { listActivity } from "@/lib/roc/api";
import { isDepartmentKey, type DepartmentKey } from "@/lib/roc/constants";
import { useOpenTabs } from "@/lib/roc/open-tabs";
import {
  ACTIVITY_RANGES,
  ActivityList,
  type ActivityRangeKey,
} from "@/components/activity-list";
import { Skeleton } from "@/components/ui/skeleton";

type Search = {
  range: ActivityRangeKey;
  dept?: DepartmentKey;
  roc?: number;
};

function asRange(value: unknown): ActivityRangeKey {
  return ACTIVITY_RANGES.some((s) => s.key === value)
    ? (value as ActivityRangeKey)
    : "week";
}

function asRocId(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : undefined;
}

export const Route = createFileRoute("/activity")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const dept = typeof search.dept === "string" ? search.dept : undefined;
    return {
      range: asRange(search.range),
      dept: dept && isDepartmentKey(dept) ? dept : undefined,
      roc: asRocId(search.roc),
    };
  },
  loader: () => listActivity(),
  component: ActivityPage,
});

function ActivityPage() {
  const { range, dept, roc } = Route.useSearch();
  const navigate = Route.useNavigate();
  const openActivity = useOpenTabs((s) => s.openActivity);
  const initial = Route.useLoaderData();

  useEffect(() => {
    openActivity();
  }, [openActivity]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["activity"],
    queryFn: () => listActivity(),
    initialData: initial,
  });

  const items = data ?? [];

  const setSearch = (next: {
    range?: ActivityRangeKey;
    dept?: DepartmentKey;
    roc?: number;
  }) => {
    const nextRange = next.range ?? range;
    const nextDept = "dept" in next ? next.dept : dept;
    const nextRoc = "roc" in next ? next.roc : roc;
    void navigate({
      search: {
        range: nextRange,
        ...(nextDept ? { dept: nextDept } : {}),
        ...(nextRoc ? { roc: nextRoc } : {}),
      },
      replace: true,
    });
  };

  return (
    <div className="grid gap-5">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tracker
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Recent activity</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          New projects, new actions, completions, and follow-ups. Filter by
          timeframe, project, or department.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <p className="font-medium">Could not load activity</p>
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
      ) : (
        <ActivityList
          items={items}
          range={range}
          department={dept}
          rocId={roc}
          onRange={(next) => setSearch({ range: next })}
          onDepartment={(next) => setSearch({ dept: next })}
          onRoc={(next) => setSearch({ roc: next })}
        />
      )}
    </div>
  );
}
