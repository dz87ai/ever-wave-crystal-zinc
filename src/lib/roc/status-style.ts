import type { DeptStatusKey, RocStatus } from "./constants";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export function rocStatusVariant(status: RocStatus): BadgeVariant {
  switch (status) {
    case "released":
      return "complete";
    case "in_progress":
      return "progress";
    case "ready_for_review":
      return "review";
    case "follow_up":
    case "requires_revision":
      return "high";
    case "on_hold":
      return "hold";
    case "discussed":
      return "secondary";
    default:
      return "muted";
  }
}

export function deptStatusVariant(status: DeptStatusKey): BadgeVariant {
  switch (status) {
    case "complete":
      return "complete";
    case "high_action":
      return "high";
    case "low_action":
      return "low";
    case "in_progress":
      return "progress";
    case "follow_up":
      return "low";
    case "ready_for_review":
      return "review";
    case "discussed":
      return "secondary";
    case "na":
      return "muted";
    default:
      return "outline";
  }
}

export function deptCellTone(status: DeptStatusKey): string {
  switch (status) {
    case "high_action":
      return "bg-status-high/12 text-status-high ring-status-high/25";
    case "low_action":
      return "bg-status-low/12 text-status-low ring-status-low/25";
    case "complete":
      return "bg-status-complete/12 text-status-complete ring-status-complete/25";
    case "in_progress":
      return "bg-status-progress/12 text-status-progress ring-status-progress/25";
    case "follow_up":
      return "bg-status-low/10 text-status-low ring-status-low/20";
    case "ready_for_review":
      return "bg-status-review/12 text-status-review ring-status-review/25";
    case "discussed":
      return "bg-muted text-muted-foreground ring-border";
    case "na":
      return "bg-transparent text-status-na ring-border/60";
    default:
      return "bg-card text-muted-foreground ring-border";
  }
}

export function deptDotClass(status: DeptStatusKey): string {
  switch (status) {
    case "high_action":
      return "bg-status-high";
    case "low_action":
      return "bg-status-low";
    case "complete":
      return "bg-status-complete";
    case "in_progress":
      return "bg-status-progress";
    case "follow_up":
      return "bg-status-low";
    case "ready_for_review":
      return "bg-status-review";
    case "discussed":
      return "bg-status-discussed";
    case "na":
      return "bg-transparent ring-1 ring-status-na";
    default:
      return "bg-border";
  }
}

export function deptCellMark(status: DeptStatusKey): string {
  switch (status) {
    case "high_action":
      return "H";
    case "low_action":
      return "L";
    case "complete":
      return "C";
    case "in_progress":
      return "P";
    case "follow_up":
      return "F";
    case "ready_for_review":
      return "R";
    case "discussed":
      return "D";
    case "na":
      return "—";
    default:
      return "·";
  }
}

export function deptCellDisplay(cell: {
  status: DeptStatusKey;
  lateCount: number;
  allComplete: boolean;
  waiting: boolean;
}): { kind: "late" | "done" | "waiting" | "status"; mark: string; tone: string } {
  if (cell.allComplete) {
    return {
      kind: "done",
      mark: "✓",
      tone: "bg-status-complete/18 text-status-complete ring-status-complete/30",
    };
  }
  if (cell.waiting) {
    return {
      kind: "waiting",
      mark: "W",
      tone: "bg-status-wait text-white ring-status-wait/40",
    };
  }
  if (cell.lateCount > 0) {
    return {
      kind: "late",
      mark: "LATE",
      tone: "bg-status-high text-white ring-status-high/40",
    };
  }
  return {
    kind: "status",
    mark: deptCellMark(cell.status),
    tone: deptCellTone(cell.status),
  };
}
