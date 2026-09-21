import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DEPARTMENTS } from "@/lib/roc/constants";
import type { DeptCell, RocSummary } from "@/lib/roc/types";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { deptCellDisplay, rocStatusVariant } from "@/lib/roc/status-style";
import { deptStatusLabel, formatDate, rocStatusLabel } from "@/lib/roc/format";
import { useOpenTabs } from "@/lib/roc/open-tabs";

function isDeptIdle(cell: DeptCell): boolean {
  if (
    cell.actionCount > 0 ||
    cell.openCount > 0 ||
    cell.lateCount > 0 ||
    cell.allComplete ||
    cell.waiting
  ) {
    return false;
  }
  return cell.status === "na" || cell.status === "not_started";
}

function CellMark({ cell, compact = false }: { cell: DeptCell; compact?: boolean }) {
  const display = deptCellDisplay(cell);
  const idle = isDeptIdle(cell);
  return (
    <span
      className={cn(
        "mx-auto flex items-center justify-center rounded-sm px-1 ring-1 no-underline",
        compact
          ? idle
            ? "h-4 min-w-4"
            : "h-6 min-w-6"
          : idle
            ? "h-9 min-w-9"
            : "h-10 min-w-10",
        display.tone,
      )}
    >
      {display.kind === "done" ? (
        <Check
          className={compact ? (idle ? "size-2.5" : "size-3.5") : idle ? "size-3.5" : "size-5"}
          strokeWidth={3}
          aria-hidden
        />
      ) : (
        <span
          className={cn(
            "font-mono font-semibold",
            display.kind === "late"
              ? compact
                ? idle
                  ? "text-[0.35rem] tracking-wide"
                  : "text-[0.45rem] tracking-wide"
                : idle
                  ? "text-[0.45rem] tracking-wide"
                  : "text-[0.55rem] tracking-wide"
              : compact
                ? idle
                  ? "text-[0.5rem]"
                  : "text-[0.6rem]"
                : idle
                  ? "text-[0.65rem]"
                  : "text-xs",
          )}
        >
          {display.mark}
        </span>
      )}
    </span>
  );
}

export function TrackerGrid({ rocs }: { rocs: RocSummary[] }) {
  const addTab = useOpenTabs((s) => s.add);

  function openRoc(roc: RocSummary) {
    addTab({ id: roc.id, rocNumber: roc.roc_number, title: roc.title });
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-panel lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[64rem] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[8.5%]" />
              <col className="w-[17.5%]" />
              {DEPARTMENTS.map((dept) => (
                <col key={dept.key} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="sticky left-0 z-20 bg-secondary px-3 py-3 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  ROC
                </th>
                <th className="sticky left-[8.5%] z-20 bg-secondary px-3 py-3 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Project
                </th>
                {DEPARTMENTS.map((dept) => (
                  <th
                    key={dept.key}
                    title={dept.label}
                    className="truncate px-0.5 py-3 text-center font-mono text-[0.65rem] font-medium tracking-wide text-muted-foreground"
                  >
                    {dept.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rocs.map((roc) => (
                <tr
                  key={roc.id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/40"
                >
                  <td className="sticky left-0 z-10 bg-card px-3 py-3 align-top">
                    <Link
                      to="/roc/$id"
                      params={{ id: String(roc.id) }}
                      onClick={() => openRoc(roc)}
                      className="font-mono text-xs font-semibold text-primary no-underline hover:underline"
                    >
                      {roc.roc_number}
                    </Link>
                    <div className="mt-1.5">
                      <Badge variant={rocStatusVariant(roc.overall_status)}>
                        {rocStatusLabel(roc.overall_status)}
                      </Badge>
                    </div>
                    {roc.single_project ? (
                      <div className="mt-1.5">
                        <Badge variant="high">Project</Badge>
                      </div>
                    ) : null}
                  </td>
                  <td className="sticky left-[8.5%] z-10 bg-card px-3 py-3 align-top">
                    <Link
                      to="/roc/$id"
                      params={{ id: String(roc.id) }}
                      onClick={() => openRoc(roc)}
                      className="font-medium text-foreground no-underline hover:underline"
                    >
                      {roc.title}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {roc.description}
                    </p>
                    <p className="mt-2 font-mono text-[0.65rem] text-muted-foreground">
                      Start {formatDate(roc.actual_release_date)}
                      {roc.highOpen ? ` · ${roc.highOpen} high` : ""}
                    </p>
                  </td>
                  {roc.departments.map((cell) => (
                    <td key={cell.department} className="px-0.5 py-2 align-middle">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to="/roc/$id"
                            params={{ id: String(roc.id) }}
                            search={{ dept: cell.department }}
                            onClick={() => openRoc(roc)}
                            className="block no-underline"
                            aria-label={`${DEPARTMENTS.find((d) => d.key === cell.department)?.label}: ${
                              cell.waiting
                                ? "waiting on predecessor"
                                : cell.lateCount
                                ? `${cell.lateCount} late`
                                : cell.allComplete
                                  ? "all tasks complete"
                                  : deptStatusLabel(cell.status)
                            }`}
                          >
                            <CellMark cell={cell} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">
                            {DEPARTMENTS.find((d) => d.key === cell.department)?.label}
                          </p>
                          <p>{deptStatusLabel(cell.status)}</p>
                          {cell.waiting ? (
                            <p>Waiting on predecessor</p>
                          ) : cell.lateCount ? (
                            <p>{cell.lateCount} late</p>
                          ) : cell.allComplete ? (
                            <p>All tasks complete</p>
                          ) : null}
                          {cell.openCount ? (
                            <p>
                              {cell.openCount} open
                              {cell.highOpen ? ` · ${cell.highOpen} high` : ""}
                            </p>
                          ) : null}
                          {cell.notes ? (
                            <p className="mt-1 max-w-xs text-background/80">
                              {cell.notes}
                            </p>
                          ) : null}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="grid gap-3 lg:hidden">
        {rocs.map((roc) => (
          <li key={roc.id}>
            <Link
              to="/roc/$id"
              params={{ id: String(roc.id) }}
              onClick={() => openRoc(roc)}
              className="block rounded-xl border border-border bg-card p-4 text-foreground no-underline shadow-panel"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs font-semibold text-primary">
                  {roc.roc_number}
                </span>
                <Badge variant={rocStatusVariant(roc.overall_status)}>
                  {rocStatusLabel(roc.overall_status)}
                </Badge>
              </div>
              {roc.single_project ? (
                <div className="mt-1.5">
                  <Badge variant="high">Project</Badge>
                </div>
              ) : null}
              <p className="mt-2 font-medium">{roc.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {roc.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {roc.departments.map((cell) => (
                  <span
                    key={cell.department}
                    title={`${DEPARTMENTS.find((d) => d.key === cell.department)?.short}: ${
                      cell.waiting
                        ? "waiting"
                        : cell.lateCount
                        ? `${cell.lateCount} late`
                        : cell.allComplete
                          ? "all complete"
                          : deptStatusLabel(cell.status)
                    }`}
                  >
                    <CellMark cell={cell} compact />
                  </span>
                ))}
              </div>
              {roc.highOpen ? (
                <p className="mt-2 text-xs text-status-high">
                  {roc.highOpen} high-importance action
                  {roc.highOpen === 1 ? "" : "s"} open
                </p>
              ) : roc.openActions ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {roc.openActions} open action{roc.openActions === 1 ? "" : "s"}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
