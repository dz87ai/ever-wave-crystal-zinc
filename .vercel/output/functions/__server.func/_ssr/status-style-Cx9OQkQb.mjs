import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { I as cn } from "./router-MkaizW1V.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		"data-slot": "textarea",
		className: cn("flex min-h-24 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm text-foreground shadow-panel transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function rocStatusVariant(status) {
	switch (status) {
		case "released": return "complete";
		case "in_progress": return "progress";
		case "ready_for_review": return "review";
		case "follow_up":
		case "requires_revision": return "high";
		case "on_hold": return "hold";
		case "discussed": return "secondary";
		default: return "muted";
	}
}
function deptCellTone(status) {
	switch (status) {
		case "high_action": return "bg-status-high/12 text-status-high ring-status-high/25";
		case "low_action": return "bg-status-low/12 text-status-low ring-status-low/25";
		case "complete": return "bg-status-complete/12 text-status-complete ring-status-complete/25";
		case "in_progress": return "bg-status-progress/12 text-status-progress ring-status-progress/25";
		case "follow_up": return "bg-status-low/10 text-status-low ring-status-low/20";
		case "ready_for_review": return "bg-status-review/12 text-status-review ring-status-review/25";
		case "discussed": return "bg-muted text-muted-foreground ring-border";
		case "na": return "bg-transparent text-status-na ring-border/60";
		default: return "bg-card text-muted-foreground ring-border";
	}
}
function deptDotClass(status) {
	switch (status) {
		case "high_action": return "bg-status-high";
		case "low_action": return "bg-status-low";
		case "complete": return "bg-status-complete";
		case "in_progress": return "bg-status-progress";
		case "follow_up": return "bg-status-low";
		case "ready_for_review": return "bg-status-review";
		case "discussed": return "bg-status-discussed";
		case "na": return "bg-transparent ring-1 ring-status-na";
		default: return "bg-border";
	}
}
function deptCellMark(status) {
	switch (status) {
		case "high_action": return "H";
		case "low_action": return "L";
		case "complete": return "C";
		case "in_progress": return "P";
		case "follow_up": return "F";
		case "ready_for_review": return "R";
		case "discussed": return "D";
		case "na": return "—";
		default: return "·";
	}
}
function deptCellDisplay(cell) {
	if (cell.allComplete) return {
		kind: "done",
		mark: "✓",
		tone: "bg-status-complete/18 text-status-complete ring-status-complete/30"
	};
	if (cell.waiting) return {
		kind: "waiting",
		mark: "W",
		tone: "bg-status-wait text-white ring-status-wait/40"
	};
	if (cell.lateCount > 0) return {
		kind: "late",
		mark: "LATE",
		tone: "bg-status-high text-white ring-status-high/40"
	};
	return {
		kind: "status",
		mark: deptCellMark(cell.status),
		tone: deptCellTone(cell.status)
	};
}
//#endregion
export { rocStatusVariant as a, deptDotClass as i, deptCellDisplay as n, deptCellTone as r, Textarea as t };
