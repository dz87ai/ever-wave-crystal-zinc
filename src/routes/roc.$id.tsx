import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getRoc } from "@/lib/roc/api";
import { isDepartmentKey, type DepartmentKey } from "@/lib/roc/constants";
import { RocDetail } from "@/components/roc-detail";
import { Skeleton } from "@/components/ui/skeleton";

type Search = {
  dept?: DepartmentKey;
  item?: number;
};

export const Route = createFileRoute("/roc/$id")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const dept = typeof search.dept === "string" ? search.dept : undefined;
    const rawItem = search.item;
    const item =
      typeof rawItem === "number"
        ? rawItem
        : typeof rawItem === "string"
          ? Number(rawItem)
          : NaN;
    return {
      dept: dept && isDepartmentKey(dept) ? dept : undefined,
      item: Number.isFinite(item) && item > 0 ? item : undefined,
    };
  },
  loader: ({ params }) => getRoc({ data: { id: Number(params.id) } }),
  component: RocPage,
});

function RocPage() {
  const { id } = Route.useParams();
  const { dept, item: focusItemId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const rocId = Number(id);
  const initial = Route.useLoaderData();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["roc", rocId],
    queryFn: () => getRoc({ data: { id: rocId } }),
    enabled: Number.isFinite(rocId),
    initialData: Number.isFinite(rocId) ? initial : undefined,
  });

  const focusedItem = data?.actionItems.find((row) => row.id === focusItemId);
  const selected: DepartmentKey =
    focusedItem?.department ??
    dept ??
    data?.actionItems.find(
      (item) => item.kind !== "note" && item.status !== "complete",
    )?.department ??
    data?.departments.find(
      (row) => row.status !== "na" && row.status !== "not_started",
    )?.department ??
    "engineering";

  if (!Number.isFinite(rocId)) {
    return <Missing />;
  }

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
        <p className="font-medium">Could not open this ROC</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "It may have been removed."}
        </p>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
          <Link to="/" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
            Back to tracker
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tracker
      </Link>
      <RocDetail
        data={data}
        selectedDept={selected}
        focusItemId={focusedItem?.id}
        onSelectDept={(key) => {
          void navigate({
            search: { dept: key },
            replace: true,
          });
        }}
        onFocusItem={(id, dept) => {
          void navigate({
            search: { dept, item: id },
            replace: true,
          });
        }}
      />
    </div>
  );
}

function Missing() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
      <p className="font-medium">Invalid ROC</p>
      <Link to="/" className="mt-2 inline-block text-sm text-primary">
        Back to tracker
      </Link>
    </div>
  );
}

