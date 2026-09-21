import { DEPT_STATUSES, ROC_STATUSES } from "@/lib/roc/constants";
import { deptDotClass } from "@/lib/roc/status-style";
import type { DeptStatusKey } from "@/lib/roc/constants";

const ROC_SWATCH: Record<string, string> = {
  not_started: "bg-border",
  discussed: "bg-status-discussed",
  follow_up: "bg-status-low",
  ready_for_review: "bg-status-review",
  in_progress: "bg-status-progress",
  released: "bg-status-complete",
  requires_revision: "bg-status-high",
  on_hold: "bg-status-hold",
};

export function StatusLegend() {
  return (
    <details className="rounded-lg border border-border bg-card px-4 py-3 shadow-panel">
      <summary className="cursor-pointer text-sm font-medium text-foreground">
        Status legend
      </summary>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
            ROC release
          </p>
          <ul className="grid gap-1.5">
            {ROC_STATUSES.map((status) => (
              <li key={status.key} className="flex items-center gap-2 text-sm">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${ROC_SWATCH[status.key]}`}
                />
                {status.label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
            Department cell
          </p>
          <ul className="grid gap-1.5">
            {DEPT_STATUSES.map((status) => (
              <li key={status.key} className="flex items-center gap-2 text-sm">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${deptDotClass(status.key as DeptStatusKey)}`}
                />
                {status.label}
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm">
              <span className="flex size-5 items-center justify-center rounded-xs bg-status-complete/18 font-bold text-status-complete ring-1 ring-status-complete/30">
                ✓
              </span>
              All tasks complete
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="flex size-5 items-center justify-center rounded-xs bg-status-wait font-mono text-[0.7rem] font-semibold text-white">
                W
              </span>
              Waiting on predecessor
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="flex h-5 min-w-8 items-center justify-center rounded-xs bg-status-high px-1 font-mono text-[0.5rem] font-semibold tracking-wide text-white">
                LATE
              </span>
              Task past due date
            </li>
          </ul>
        </div>
      </div>
    </details>
  );
}
