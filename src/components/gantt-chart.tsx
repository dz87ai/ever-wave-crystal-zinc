import { departmentLabel, DEPARTMENTS, type DepartmentKey } from "@/lib/roc/constants";
import { buildGantt, orderBarsInDepartment, orderDepartmentGroups } from "@/lib/roc/gantt";
import { formatDate } from "@/lib/roc/format";
import type { ActionItemWithUpdates } from "@/lib/roc/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAY_PX = 28;

export function GanttChart({
  items,
  deadline,
  onDeadlineChange,
  onFocusItem,
}: {
  items: ActionItemWithUpdates[];
  deadline: string | null;
  onDeadlineChange: (value: string | null) => void;
  onFocusItem: (id: number, department: DepartmentKey) => void;
}) {
  const { bars, days, today, rangeStart, rangeEnd } = buildGantt(items, deadline);
  const byDept = orderDepartmentGroups(
    DEPARTMENTS.map((dept) => ({
      ...dept,
      bars: orderBarsInDepartment(bars.filter((bar) => bar.department === dept.key)),
    })).filter((group) => group.bars.length > 0),
  );

  const width = Math.max(days.length * DAY_PX, 320);
  const todayIndex = days.indexOf(today);
  const deadlineIndex = deadline ? days.indexOf(deadline) : -1;

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          Bars run from when a task can start through its due date. Successor
          tasks begin the day after the task they follow.
        </p>
        <div className="grid gap-1.5">
          <Label htmlFor="project-deadline">Project deadline</Label>
          <Input
            id="project-deadline"
            type="date"
            value={deadline ?? ""}
            onChange={(e) => onDeadlineChange(e.target.value || null)}
            className="h-10 w-full sm:w-48"
          />
        </div>
      </div>

      {bars.length === 0 ? (
        <p className="rounded-md bg-secondary/60 px-3 py-6 text-sm text-muted-foreground">
          Add action items to see them on the schedule. Notes are omitted.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-secondary/30">
          <div className="min-w-full" style={{ minWidth: width + 192 }}>
            <div className="flex border-b border-border bg-card">
              <div className="sticky left-0 z-10 w-48 shrink-0 border-r border-border bg-card px-3 py-2 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Task
              </div>
              <div className="relative" style={{ width }}>
                <div className="flex">
                  {days.map((day, i) => {
                    const show = i === 0 || i % 7 === 0;
                    return (
                      <div
                        key={day}
                        className="shrink-0 border-r border-border/60 py-2 text-center"
                        style={{ width: DAY_PX }}
                      >
                        {show ? (
                          <span className="relative z-[2] block w-12 -translate-x-2 font-mono text-[0.6rem] text-muted-foreground">
                            {formatDate(day).replace(/ \d{4}$/, "")}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {todayIndex >= 0 ? (
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 z-[1] w-px bg-primary"
                    style={{ left: todayIndex * DAY_PX + DAY_PX / 2 }}
                    title={`Today ${formatDate(today)}`}
                  />
                ) : null}
                {deadlineIndex >= 0 ? (
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 z-[1] w-px bg-status-high"
                    style={{ left: deadlineIndex * DAY_PX + DAY_PX / 2 }}
                    title={`Deadline ${formatDate(deadline)}`}
                  />
                ) : null}
              </div>
            </div>

            {byDept.map((group) => (
              <section key={group.key}>
                <div className="flex border-b border-border bg-muted/40">
                  <div className="sticky left-0 z-10 w-48 shrink-0 border-r border-border bg-muted/80 px-3 py-1.5 font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                    {group.label}
                  </div>
                  <div style={{ width }} />
                </div>
                {group.bars.map((bar) => {
                  const startIdx = Math.max(0, days.indexOf(bar.start));
                  const endIdx = Math.max(startIdx, days.indexOf(bar.end));
                  const left = startIdx * DAY_PX;
                  const barWidth = Math.max(DAY_PX - 4, (endIdx - startIdx + 1) * DAY_PX - 6);
                  return (
                    <div key={bar.id} className="flex border-b border-border/70">
                      <button
                        type="button"
                        className="sticky left-0 z-10 w-48 shrink-0 truncate border-r border-border bg-card px-3 py-2 text-left text-xs hover:bg-secondary"
                        onClick={() => onFocusItem(bar.id, bar.department)}
                        title={bar.title}
                      >
                        {bar.title}
                      </button>
                      <div className="relative h-10" style={{ width }}>
                        {todayIndex >= 0 ? (
                          <div
                            className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/40"
                            style={{ left: todayIndex * DAY_PX + DAY_PX / 2 }}
                          />
                        ) : null}
                        {deadlineIndex >= 0 ? (
                          <div
                            className="pointer-events-none absolute top-0 bottom-0 w-px bg-status-high/50"
                            style={{ left: deadlineIndex * DAY_PX + DAY_PX / 2 }}
                          />
                        ) : null}
                        <button
                          type="button"
                          className={cn(
                            "absolute top-2 h-6 rounded-sm text-left",
                            bar.complete && "bg-status-complete/70",
                            !bar.complete && bar.overdue && "bg-status-high",
                            !bar.complete && !bar.overdue && bar.high && "bg-status-low",
                            !bar.complete && !bar.overdue && !bar.high && "bg-status-progress",
                          )}
                          style={{ left: left + 2, width: barWidth }}
                          onClick={() => onFocusItem(bar.id, bar.department)}
                          title={`${bar.title} · ${formatDate(bar.start)} – ${formatDate(bar.end)}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-[0.65rem] text-muted-foreground">
        {formatDate(rangeStart)} – {formatDate(rangeEnd)}
        {deadline ? ` · Deadline ${formatDate(deadline)}` : " · No deadline set"}
        {" · "}
        Today marker in steel, deadline in red.
      </p>
    </div>
  );
}
