import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { listOpenActions } from "@/lib/roc/api";
import { isDepartmentKey, type DepartmentKey } from "@/lib/roc/constants";
import { useOpenTabs } from "@/lib/roc/open-tabs";
import {
  ACTION_SORTS,
  NeedActionList,
  type ActionSortKey,
} from "@/components/need-action-list";
import { Skeleton } from "@/components/ui/skeleton";

type Search = {
  sort: ActionSortKey;
  dept?: DepartmentKey;
  roc?: number;
  successors?: boolean;
};

function asSort(value: unknown): ActionSortKey {
  return ACTION_SORTS.some((s) => s.key === value)
    ? (value as ActionSortKey)
    : "importance";
}

function asRocId(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : undefined;
}

function asFlag(value: unknown): boolean | undefined {
  if (value === true || value === "1" || value === "true") return true;
  return undefined;
}

export const Route = createFileRoute("/actions")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const dept = typeof search.dept === "string" ? search.dept : undefined;
    return {
      sort: asSort(search.sort),
      dept: dept && isDepartmentKey(dept) ? dept : undefined,
      roc: asRocId(search.roc),
      successors: asFlag(search.successors),
    };
  },
  loader: () => listOpenActions(),
  component: ActionsPage,
});

function ActionsPage() {
  const { sort, dept, roc, successors } = Route.useSearch();
  const navigate = Route.useNavigate();
  const openActions = useOpenTabs((s) => s.openActions);
  const initial = Route.useLoaderData();
  const showSuccessors = Boolean(successors);

  useEffect(() => {
    openActions();
  }, [openActions]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["open-actions"],
    queryFn: () => listOpenActions(),
    initialData: initial,
  });

  const items = data ?? [];

  const setSearch = (next: {
    sort?: ActionSortKey;
    dept?: DepartmentKey;
    roc?: number;
    successors?: boolean;
  }) => {
    const nextSort = next.sort ?? sort;
    const nextDept = "dept" in next ? next.dept : dept;
    const nextRoc = "roc" in next ? next.roc : roc;
    const nextSuccessors = "successors" in next ? next.successors : showSuccessors;
    void navigate({
      search: {
        sort: nextSort,
        ...(nextDept ? { dept: nextDept } : {}),
        ...(nextRoc ? { roc: nextRoc } : {}),
        ...(nextSuccessors ? { successors: true } : {}),
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

      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Need action</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Work that can start now, across every ROC. Successor tasks stay
            hidden until you show them. Filter by project or department.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <p className="font-medium">Could not load action items</p>
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
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/70 px-6 py-16 text-center shadow-panel">
          <p className="font-medium">Nothing needs action</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Open items will show up here as departments add them.
          </p>
        </div>
      ) : (
        <NeedActionList
          items={items}
          sort={sort}
          department={dept}
          rocId={roc}
          showSuccessors={showSuccessors}
          onSort={(next) => setSearch({ sort: next })}
          onDepartment={(next) => setSearch({ dept: next })}
          onRoc={(next) => setSearch({ roc: next })}
          onShowSuccessors={(next) => setSearch({ successors: next })}
        />
      )}
    </div>
  );
}