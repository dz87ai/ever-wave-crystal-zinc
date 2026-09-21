import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { D as isoDay, M as rocStatusLabel, N as todayIsoDate, O as maxIsoDay, T as isDueOverdue, d as ROC_STATUSES, g as deptStatusLabel, h as departmentLabel, i as DEPT_STATUSES, k as minIsoDay, m as addIsoDays, n as ACTION_STATUSES, r as DEPARTMENTS, t as ACTION_PRIORITIES, v as enumerateIsoDays, y as formatDate } from "./notice-schedule-CLIK4nXr.mjs";
import { _ as ChartGantt, c as Paperclip, d as LoaderCircle, f as FileUp, g as Check, h as ChevronDown, l as MessageSquare, o as RotateCcw, p as Download, r as Trash2, s as Pencil, v as CalendarDays, y as ArrowLeft } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as setDepartmentStatus, A as SelectItem, D as Button, E as Badge, F as addAttachment, I as cn, M as SelectValue, N as addActionItem, O as Select, P as addActionUpdate, R as deleteActionItem, S as Tabs, T as TabsTrigger, U as getRoc, V as getAttachment, c as Label, d as DialogDescription, et as updateActionItem, f as DialogFooter, g as useIdentity, j as SelectTrigger, k as SelectContent, l as Dialog, m as DialogTitle, n as Route, nt as useOpenTabs, p as DialogHeader, tt as updateRoc, u as DialogContent, w as TabsList, z as deleteAttachment } from "./router-MkaizW1V.mjs";
import { t as Skeleton } from "./skeleton-BSVtkruh.mjs";
import { i as fileToBase64, n as downloadBase64, r as extractFileText, t as Input } from "./input-lZCACGe0.mjs";
import { a as rocStatusVariant, i as deptDotClass, r as deptCellTone, t as Textarea } from "./status-style-Cx9OQkQb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roc._id-D75dgLiZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function wouldCreateCycle(items, itemId, predecessorId) {
	if (itemId === predecessorId) return true;
	const byId = new Map(items.map((item) => [item.id, item]));
	const seen = /* @__PURE__ */ new Set([itemId]);
	let walk = predecessorId;
	while (walk) {
		if (seen.has(walk)) return true;
		seen.add(walk);
		walk = byId.get(walk)?.predecessor_id ?? null;
	}
	return false;
}
function resolveSpan(item, byId, memo, stack) {
	const cached = memo.get(item.id);
	if (cached) return cached;
	if (stack.has(item.id)) {
		const created = isoDay(item.created_at) ?? todayIsoDate();
		return {
			start: created,
			end: item.due_date && item.due_date > created ? item.due_date : addIsoDays(created, 4)
		};
	}
	stack.add(item.id);
	const created = isoDay(item.created_at) ?? todayIsoDate();
	let start = created;
	if (item.predecessor_id) {
		const pred = byId.get(item.predecessor_id);
		if (pred) {
			const predSpan = resolveSpan(pred, byId, memo, stack);
			start = addIsoDays(predSpan.end, 1);
		}
	} else if (item.due_date) {
		const lead = addIsoDays(item.due_date, -4);
		start = lead < created ? lead : created;
		if (start > item.due_date) start = item.due_date;
	}
	let end = item.due_date && item.due_date >= start ? item.due_date : addIsoDays(start, 4);
	if (end < start) end = start;
	const span = {
		start,
		end
	};
	memo.set(item.id, span);
	stack.delete(item.id);
	return span;
}
function buildGantt(items, deadline) {
	const tasks = items.filter((item) => item.kind !== "note");
	const byId = new Map(tasks.map((item) => [item.id, item]));
	const memo = /* @__PURE__ */ new Map();
	const today = todayIsoDate();
	const bars = tasks.map((item) => {
		const span = resolveSpan(item, byId, memo, /* @__PURE__ */ new Set());
		const complete = item.status === "complete";
		return {
			id: item.id,
			title: item.title,
			department: item.department,
			start: span.start,
			end: span.end,
			due: item.due_date,
			complete,
			high: item.priority === "high",
			overdue: Boolean(item.due_date && item.due_date < today && !complete),
			predecessorId: item.predecessor_id
		};
	});
	const rangeStart = minIsoDay(...bars.map((bar) => bar.start), today, deadline) ?? today;
	const rangeEnd = maxIsoDay(...bars.map((bar) => bar.end), today, deadline) ?? addIsoDays(today, 14);
	const paddedStart = addIsoDays(rangeStart, -1);
	const paddedEnd = addIsoDays(rangeEnd, 2);
	return {
		bars,
		rangeStart: paddedStart,
		rangeEnd: paddedEnd,
		days: enumerateIsoDays(paddedStart, paddedEnd),
		today
	};
}
function compareSchedule(a, b) {
	if (a.start !== b.start) return a.start.localeCompare(b.start);
	if (a.end !== b.end) return a.end.localeCompare(b.end);
	return a.id - b.id;
}
/** Row order inside a department: earliest start first, successors after their predecessor. */
function orderBarsInDepartment(bars) {
	if (bars.length < 2) return bars;
	const ids = new Set(bars.map((bar) => bar.id));
	const remaining = new Map(bars.map((bar) => [bar.id, bar]));
	const indegree = /* @__PURE__ */ new Map();
	const children = /* @__PURE__ */ new Map();
	for (const bar of bars) {
		indegree.set(bar.id, 0);
		children.set(bar.id, []);
	}
	for (const bar of bars) {
		const pred = bar.predecessorId;
		if (pred && ids.has(pred) && pred !== bar.id) {
			indegree.set(bar.id, (indegree.get(bar.id) ?? 0) + 1);
			children.get(pred)?.push(bar.id);
		}
	}
	const ready = bars.filter((bar) => (indegree.get(bar.id) ?? 0) === 0).sort(compareSchedule);
	const ordered = [];
	while (ready.length) {
		const next = ready.shift();
		if (!remaining.has(next.id)) continue;
		remaining.delete(next.id);
		ordered.push(next);
		for (const childId of children.get(next.id) ?? []) {
			const deg = (indegree.get(childId) ?? 1) - 1;
			indegree.set(childId, deg);
			if (deg === 0) {
				const child = remaining.get(childId);
				if (child) {
					ready.push(child);
					ready.sort(compareSchedule);
				}
			}
		}
	}
	return ordered.concat([...remaining.values()].sort(compareSchedule));
}
/** Department sections follow predecessor chains, then earliest start. */
function orderDepartmentGroups(groups) {
	if (groups.length < 2) return groups;
	const byKey = new Map(groups.map((group) => [group.key, group]));
	const keys = groups.map((group) => group.key);
	const present = new Set(keys);
	const indegree = /* @__PURE__ */ new Map();
	const children = /* @__PURE__ */ new Map();
	for (const key of keys) {
		indegree.set(key, 0);
		children.set(key, []);
	}
	const barById = /* @__PURE__ */ new Map();
	for (const group of groups) for (const bar of group.bars) barById.set(bar.id, bar);
	const edges = /* @__PURE__ */ new Set();
	for (const group of groups) for (const bar of group.bars) {
		if (!bar.predecessorId) continue;
		const pred = barById.get(bar.predecessorId);
		if (!pred || pred.department === bar.department) continue;
		if (!present.has(pred.department)) continue;
		const edge = `${pred.department}->${bar.department}`;
		if (edges.has(edge)) continue;
		edges.add(edge);
		indegree.set(bar.department, (indegree.get(bar.department) ?? 0) + 1);
		children.get(pred.department)?.push(bar.department);
	}
	const deptIndex = new Map(DEPARTMENTS.map((dept, index) => [dept.key, index]));
	const earliest = (key) => {
		let min = "9999-99-99";
		for (const bar of byKey.get(key)?.bars ?? []) if (bar.start < min) min = bar.start;
		return min;
	};
	const compareDept = (a, b) => {
		const start = earliest(a).localeCompare(earliest(b));
		if (start !== 0) return start;
		return (deptIndex.get(a) ?? 99) - (deptIndex.get(b) ?? 99);
	};
	const ready = keys.filter((key) => (indegree.get(key) ?? 0) === 0).sort(compareDept);
	const ordered = [];
	const seen = /* @__PURE__ */ new Set();
	while (ready.length) {
		const next = ready.shift();
		if (seen.has(next)) continue;
		seen.add(next);
		const group = byKey.get(next);
		if (group) ordered.push(group);
		for (const child of children.get(next) ?? []) {
			const deg = (indegree.get(child) ?? 1) - 1;
			indegree.set(child, deg);
			if (deg === 0) {
				ready.push(child);
				ready.sort(compareDept);
			}
		}
	}
	const leftover = keys.filter((key) => !seen.has(key)).sort(compareDept);
	for (const key of leftover) {
		const group = byKey.get(key);
		if (group) ordered.push(group);
	}
	return ordered;
}
function ActionCard({ item, rocId, focused = false, projectItems }) {
	const postedAs = useIdentity((s) => s.postedAs);
	const queryClient = useQueryClient();
	const [body, setBody] = (0, import_react.useState)("");
	const [showThread, setShowThread] = (0, import_react.useState)(item.updates.length > 0);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const [successor, setSuccessor] = (0, import_react.useState)(item.predecessor_id != null);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [editTitle, setEditTitle] = (0, import_react.useState)(item.title);
	const [editDetails, setEditDetails] = (0, import_react.useState)(item.details);
	const [editDue, setEditDue] = (0, import_react.useState)(item.due_date ?? "");
	const [editPriority, setEditPriority] = (0, import_react.useState)(item.priority);
	const [editSuccessor, setEditSuccessor] = (0, import_react.useState)(item.predecessor_id != null);
	const [editPred, setEditPred] = (0, import_react.useState)(item.predecessor_id);
	(0, import_react.useEffect)(() => {
		setSuccessor(item.predecessor_id != null);
	}, [item.predecessor_id]);
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["roc", rocId] });
		queryClient.invalidateQueries({ queryKey: ["rocs"] });
		queryClient.invalidateQueries({ queryKey: ["open-actions"] });
		queryClient.invalidateQueries({ queryKey: ["activity"] });
	};
	const patch = useMutation({
		mutationFn: (data) => updateActionItem({ data }),
		onSuccess: (result) => {
			invalidate();
			if (result.noticesSent) toast.success(result.noticesSent === 1 ? "Late-task notice emailed" : `${result.noticesSent} late-task notices emailed`);
			else if (result.noticeError) toast.error(result.noticeError);
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Update failed")
	});
	const comment = useMutation({
		mutationFn: () => addActionUpdate({ data: {
			actionItemId: item.id,
			body,
			postedAs
		} }),
		onSuccess: () => {
			setBody("");
			setShowThread(true);
			invalidate();
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Could not post")
	});
	const remove = useMutation({
		mutationFn: () => deleteActionItem({ data: { id: item.id } }),
		onSuccess: () => {
			setConfirmDelete(false);
			toast.success(item.kind === "note" ? "Note removed" : "Action removed");
			invalidate();
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete")
	});
	const done = item.status === "complete";
	const overdue = isDueOverdue(item.due_date, done);
	const isNote = item.kind === "note";
	const predecessors = projectItems.filter((other) => other.id !== item.id && other.kind !== "note" && !wouldCreateCycle(projectItems, item.id, other.id));
	const predecessor = projectItems.find((other) => other.id === item.predecessor_id);
	function startEdit() {
		setEditTitle(item.title);
		setEditDetails(item.details);
		setEditDue(item.due_date ?? "");
		setEditPriority(item.priority);
		setEditSuccessor(item.predecessor_id != null);
		setEditPred(item.predecessor_id);
		setEditing(true);
	}
	function saveEdit() {
		if (!editTitle.trim()) {
			toast.error(isNote ? "Note cannot be empty" : "Title is required");
			return;
		}
		if (!isNote && editSuccessor && !editPred) {
			toast.error("Pick the task this comes after");
			return;
		}
		patch.mutate({
			id: item.id,
			title: editTitle.trim(),
			details: isNote ? "" : editDetails,
			dueDate: isNote ? null : editDue || null,
			priority: isNote ? "low" : editPriority,
			predecessorId: isNote || !editSuccessor ? null : editPred
		}, { onSuccess: () => {
			setEditing(false);
			setSuccessor(Boolean(!isNote && editSuccessor && editPred));
			toast.success(isNote ? "Note updated" : "Action updated");
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		id: `action-${item.id}`,
		className: cn("scroll-mt-24 rounded-lg border border-border bg-card p-4 shadow-panel", isNote && "border-l-2 border-l-primary/50", focused && "ring-2 ring-primary/70 ring-offset-2 ring-offset-background"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: isNote ? "muted" : item.priority === "high" ? "high" : "low",
						children: isNote ? "Note" : item.priority === "high" ? "High" : "Low"
					}),
					editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 flex-1",
						children: isNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: editTitle,
							onChange: (e) => setEditTitle(e.target.value),
							"aria-label": "Note",
							className: "min-h-20"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: editTitle,
							onChange: (e) => setEditTitle(e.target.value),
							"aria-label": "Title"
						})
					}) : isNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "min-w-0 flex-1 text-sm leading-relaxed",
						children: item.title
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: cn("min-w-0 flex-1 text-sm font-medium", done && "text-muted-foreground line-through"),
						children: item.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-1",
						children: [editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "outline",
							onClick: () => setEditing(false),
							disabled: patch.isPending,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							onClick: saveEdit,
							disabled: patch.isPending,
							children: "Save"
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								onClick: startEdit,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" }), "Edit"]
							}),
							!isNote && !done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								disabled: patch.isPending,
								onClick: () => patch.mutate({
									id: item.id,
									status: "complete"
								}, { onSuccess: () => toast.success("Marked complete") }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), "Mark complete"]
							}) : null,
							!isNote && done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								disabled: patch.isPending,
								onClick: () => patch.mutate({
									id: item.id,
									status: "open"
								}, { onSuccess: () => toast.success("Reopened") }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Reopen"]
							}) : null
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "inline-flex size-8 items-center justify-center text-muted-foreground hover:text-destructive",
							"aria-label": isNote ? "Remove note" : "Remove action",
							onClick: () => setConfirmDelete(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					})
				]
			}),
			!isNote && editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: `edit-details-${item.id}`,
							children: "Details"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: `edit-details-${item.id}`,
							value: editDetails,
							onChange: (e) => setEditDetails(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `edit-due-${item.id}`,
								children: "Due date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: `edit-due-${item.id}`,
								type: "date",
								value: editDue,
								onChange: (e) => setEditDue(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Importance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: editPriority,
								onValueChange: (value) => setEditPriority(value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 text-xs",
									"aria-label": "Priority",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ACTION_PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p.key,
									children: p.label
								}, p.key)) })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 rounded-md bg-secondary/40 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-8 cursor-pointer items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "size-4 accent-primary",
								checked: editSuccessor,
								onChange: (e) => {
									const on = e.target.checked;
									setEditSuccessor(on);
									if (!on) setEditPred(null);
								}
							}), "Successor task"]
						}), editSuccessor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `edit-pred-${item.id}`,
								children: "Comes after"
							}), predecessors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No other actions in this project yet."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: editPred ? String(editPred) : void 0,
								onValueChange: (value) => setEditPred(Number(value)),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: `edit-pred-${item.id}`,
									className: "h-9 text-xs",
									"aria-label": "Preceding task",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select the task before this one" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-[min(24rem,70vh)]",
									children: predecessors.map((other) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: String(other.id),
										children: [
											departmentLabel(other.department),
											" · ",
											other.title
										]
									}, other.id))
								})]
							})]
						}) : null]
					})
				]
			}) : null,
			!isNote && !editing && item.details ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: item.details
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-[0.65rem] text-muted-foreground",
				children: [
					"Logged by ",
					item.posted_as,
					" · ",
					formatDate(item.created_at)
				]
			}),
			!isNote && !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				!done && item.due_date ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-2 inline-flex items-center gap-1.5 font-mono text-[0.65rem]", overdue ? "text-status-high" : "text-muted-foreground"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5" }),
						overdue ? "Overdue" : "Due",
						" ",
						formatDate(item.due_date)
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: item.priority,
							onValueChange: (value) => patch.mutate({
								id: item.id,
								priority: value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 text-xs",
								"aria-label": "Priority",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ACTION_PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p.key,
								children: p.label
							}, p.key)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: item.status,
							onValueChange: (value) => patch.mutate({
								id: item.id,
								status: value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 text-xs",
								"aria-label": "Action status",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ACTION_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.key,
								children: s.label
							}, s.key)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `due-${item.id}`,
								className: "sr-only",
								children: "Due date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: `due-${item.id}`,
								type: "date",
								value: item.due_date ?? "",
								onChange: (e) => patch.mutate({
									id: item.id,
									dueDate: e.target.value || null
								}),
								className: "h-9 text-xs",
								"aria-label": "Due date"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2 rounded-md bg-secondary/40 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-8 cursor-pointer items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "size-4 accent-primary",
							checked: successor,
							onChange: (e) => {
								const on = e.target.checked;
								setSuccessor(on);
								if (!on && item.predecessor_id) patch.mutate({
									id: item.id,
									predecessorId: null
								});
							}
						}), "Successor task"]
					}), successor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `pred-${item.id}`,
								children: "Comes after"
							}),
							predecessors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No other actions in this project yet."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: item.predecessor_id ? String(item.predecessor_id) : void 0,
								onValueChange: (value) => patch.mutate({
									id: item.id,
									predecessorId: Number(value)
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: `pred-${item.id}`,
									className: "h-9 text-xs",
									"aria-label": "Preceding task",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select the task before this one" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-[min(24rem,70vh)]",
									children: predecessors.map((other) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: String(other.id),
										children: [
											departmentLabel(other.department),
											" · ",
											other.title
										]
									}, other.id))
								})]
							}),
							predecessor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[0.65rem] text-muted-foreground",
								children: ["Starts after ", predecessor.title]
							}) : null
						]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground",
					onClick: () => setShowThread((v) => !v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5" }), item.updates.length ? `${item.updates.length} update${item.updates.length === 1 ? "" : "s"}` : "Add a follow-up"]
				}),
				showThread ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3",
					children: [
						item.updates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "grid gap-2 border-l border-border pl-3",
							children: item.updates.map((update) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-[0.65rem] text-muted-foreground",
									children: [
										update.posted_as,
										" · ",
										formatDate(update.created_at)
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-foreground",
									children: update.body
								})]
							}, update.id))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: body,
							onChange: (e) => setBody(e.target.value),
							placeholder: "Follow-up question or status note…",
							className: "min-h-20"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								disabled: !body.trim() || comment.isPending,
								onClick: () => comment.mutate(),
								children: "Post update"
							})
						})
					]
				}) : null
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: confirmDelete,
				onOpenChange: setConfirmDelete,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isNote ? "Delete this note?" : "Delete this action?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: item.title.trim() ? `“${item.title.trim()}” will be removed. This cannot be undone.` : "This cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => setConfirmDelete(false),
						disabled: remove.isPending,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "destructive",
						disabled: remove.isPending,
						onClick: () => remove.mutate(),
						children: remove.isPending ? "Deleting…" : "Delete"
					})] })]
				})
			})
		]
	});
}
function DepartmentBoard({ rocId, departments, actionItems, selected, focusItemId, onSelect }) {
	const postedAs = useIdentity((s) => s.postedAs);
	const queryClient = useQueryClient();
	const current = departments.find((d) => d.department === selected);
	const items = actionItems.filter((a) => a.department === selected);
	const meta = DEPARTMENTS.find((d) => d.key === selected);
	(0, import_react.useEffect)(() => {
		if (!focusItemId) return;
		let cancelled = false;
		const scroll = () => {
			if (cancelled) return;
			document.getElementById(`action-${focusItemId}`)?.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
		};
		const frame = window.requestAnimationFrame(scroll);
		const timer = window.setTimeout(scroll, 160);
		return () => {
			cancelled = true;
			window.cancelAnimationFrame(frame);
			window.clearTimeout(timer);
		};
	}, [
		focusItemId,
		selected,
		items.length
	]);
	const [entryKind, setEntryKind] = (0, import_react.useState)("action");
	const [title, setTitle] = (0, import_react.useState)("");
	const [noteBody, setNoteBody] = (0, import_react.useState)("");
	const [details, setDetails] = (0, import_react.useState)("");
	const [dueDate, setDueDate] = (0, import_react.useState)("");
	const [priority, setPriority] = (0, import_react.useState)("low");
	const [successor, setSuccessor] = (0, import_react.useState)(false);
	const [predecessorId, setPredecessorId] = (0, import_react.useState)(null);
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["roc", rocId] });
		queryClient.invalidateQueries({ queryKey: ["rocs"] });
		queryClient.invalidateQueries({ queryKey: ["open-actions"] });
		queryClient.invalidateQueries({ queryKey: ["activity"] });
	};
	const statusMutation = useMutation({
		mutationFn: (status) => setDepartmentStatus({ data: {
			rocId,
			department: selected,
			status
		} }),
		onSuccess: invalidate,
		onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update status")
	});
	const notesMutation = useMutation({
		mutationFn: (notes) => setDepartmentStatus({ data: {
			rocId,
			department: selected,
			status: current?.status ?? "not_started",
			notes
		} }),
		onSuccess: () => {
			toast.success("Department notes saved");
			invalidate();
		}
	});
	const addMutation = useMutation({
		mutationFn: () => addActionItem({ data: {
			rocId,
			department: selected,
			title: (entryKind === "note" ? noteBody : title).trim(),
			details: entryKind === "note" ? "" : details,
			kind: entryKind,
			dueDate: entryKind === "action" && dueDate ? dueDate : null,
			priority: entryKind === "note" ? "low" : priority,
			postedAs,
			predecessorId: entryKind === "action" && successor ? predecessorId : null
		} }),
		onSuccess: (result) => {
			setTitle("");
			setNoteBody("");
			setDetails("");
			setDueDate("");
			setPriority("low");
			setSuccessor(false);
			setPredecessorId(null);
			toast.success(entryKind === "note" ? "Note added" : "Action item added");
			if (result.noticesSent) toast.success(result.noticesSent === 1 ? "Late-task notice emailed" : `${result.noticesSent} late-task notices emailed`);
			else if (result.noticeError) toast.error(result.noticeError);
			invalidate();
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Could not add item")
	});
	const counts = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const item of actionItems) {
			if (item.kind === "note" || item.status === "complete") continue;
			map.set(item.department, (map.get(item.department) ?? 0) + 1);
		}
		return map;
	}, [actionItems]);
	const [notes, setNotes] = (0, import_react.useState)(current?.notes ?? "");
	const [notesOpen, setNotesOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setNotes(current?.notes ?? "");
	}, [selected, current?.notes]);
	(0, import_react.useEffect)(() => {
		setNotesOpen(false);
	}, [selected]);
	const canSubmit = entryKind === "note" ? noteBody.trim().length > 0 : title.trim().length > 0 && (!successor || predecessorId != null);
	const predecessorOptions = actionItems.filter((item) => item.kind !== "note");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1",
				children: DEPARTMENTS.map((dept) => {
					const row = departments.find((d) => d.department === dept.key);
					const active = dept.key === selected;
					const open = counts.get(dept.key) ?? 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							onSelect(dept.key);
							setNotes(row?.notes ?? "");
						},
						className: cn("flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors", active ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-foreground hover:bg-secondary"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-full", deptDotClass(row?.status ?? "not_started")) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: dept.short
							}),
							open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[0.65rem] text-muted-foreground",
								children: open
							}) : null
						]
					}, dept.key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-4 shadow-panel sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-md border border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-expanded": notesOpen,
							"aria-controls": "dept-notes-panel",
							onClick: () => setNotesOpen((open) => !open),
							className: "flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
									className: cn("size-4 shrink-0 text-muted-foreground transition-transform", notesOpen ? "rotate-0" : "-rotate-90"),
									"aria-hidden": true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: "Department notes and status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto truncate text-xs text-muted-foreground",
									children: deptStatusLabel(current?.status ?? "not_started")
								})
							]
						}), notesOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							id: "dept-notes-panel",
							className: "border-t border-border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold",
									children: meta?.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Actions with due dates, or a simple note for this department."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: current?.status ?? "not_started",
									onValueChange: (value) => statusMutation.mutate(value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "w-full sm:w-56",
										"aria-label": "Department status",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DEPT_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s.key,
										children: s.label
									}, s.key)) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "dept-notes",
										children: "Department notes"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "dept-notes",
										value: notes,
										onChange: (e) => setNotes(e.target.value),
										placeholder: "Implementation notes visible to the whole team",
										className: "min-h-20"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											disabled: notesMutation.isPending || notes === (current?.notes ?? ""),
											onClick: () => notesMutation.mutate(notes),
											children: "Save notes"
										})
									})
								]
							})]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3",
						children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-secondary/60 px-3 py-4 text-sm text-muted-foreground",
							children: "Nothing logged yet. Add an action or a note below."
						}) : items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
							item,
							rocId,
							focused: item.id === focusItemId,
							projectItems: actionItems
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6 grid gap-3 rounded-md bg-secondary/50 p-4",
						onSubmit: (e) => {
							e.preventDefault();
							if (!canSubmit) return;
							addMutation.mutate();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: "Add to this department"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
									value: entryKind,
									onValueChange: (value) => setEntryKind(value),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
										className: "h-10 w-full sm:w-auto",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "action",
											className: "min-h-8 flex-1 sm:flex-none",
											children: "Action"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "note",
											className: "min-h-8 flex-1 sm:flex-none",
											children: "Note"
										})]
									})
								})]
							}),
							entryKind === "action" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-[1fr_10rem_10rem]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "action-title",
												children: "Title"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "action-title",
												value: title,
												onChange: (e) => setTitle(e.target.value),
												placeholder: "What does this department need to do?"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "action-due",
												children: "Due date"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "action-due",
												type: "date",
												value: dueDate,
												onChange: (e) => setDueDate(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Importance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: priority,
												onValueChange: (v) => setPriority(v),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "high",
													children: "High importance"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "low",
													children: "Low importance"
												})] })]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "action-details",
										children: "Details"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "action-details",
										value: details,
										onChange: (e) => setDetails(e.target.value),
										placeholder: "Context, constraints, or the question you need answered"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2 rounded-md bg-card/80 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex min-h-8 cursor-pointer items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											className: "size-4 accent-primary",
											checked: successor,
											onChange: (e) => {
												const on = e.target.checked;
												setSuccessor(on);
												if (!on) setPredecessorId(null);
											}
										}), "Successor task"]
									}), successor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "new-pred",
											children: "Comes after"
										}), predecessorOptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "No other actions in this project yet."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: predecessorId ? String(predecessorId) : void 0,
											onValueChange: (value) => setPredecessorId(Number(value)),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												id: "new-pred",
												className: "h-9 text-xs",
												"aria-label": "Preceding task",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select the task before this one" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
												className: "max-h-[min(24rem,70vh)]",
												children: predecessorOptions.map((other) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: String(other.id),
													children: [
														departmentLabel(other.department),
														" · ",
														other.title
													]
												}, other.id))
											})]
										})]
									}) : null]
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "note-body",
									children: "Note"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "note-body",
									value: noteBody,
									onChange: (e) => setNoteBody(e.target.value),
									placeholder: "A meeting takeaway, decision, or anything worth recording",
									className: "min-h-24"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: !canSubmit || addMutation.isPending,
									children: entryKind === "note" ? "Add note" : "Add action"
								})
							})
						]
					})
				]
			}),
			current?.status === "na" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("text-sm text-muted-foreground", deptCellTone("na")),
				children: [
					"Marked ",
					deptStatusLabel("na"),
					" — still available if something comes up."
				]
			}) : null
		]
	});
}
var DAY_PX = 28;
function GanttChart({ items, deadline, onDeadlineChange, onFocusItem }) {
	const { bars, days, today, rangeStart, rangeEnd } = buildGantt(items, deadline);
	const byDept = orderDepartmentGroups(DEPARTMENTS.map((dept) => ({
		...dept,
		bars: orderBarsInDepartment(bars.filter((bar) => bar.department === dept.key))
	})).filter((group) => group.bars.length > 0));
	const width = Math.max(days.length * DAY_PX, 320);
	const todayIndex = days.indexOf(today);
	const deadlineIndex = deadline ? days.indexOf(deadline) : -1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted-foreground",
					children: "Bars run from when a task can start through its due date. Successor tasks begin the day after the task they follow."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "project-deadline",
						children: "Project deadline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "project-deadline",
						type: "date",
						value: deadline ?? "",
						onChange: (e) => onDeadlineChange(e.target.value || null),
						className: "h-10 w-full sm:w-48"
					})]
				})]
			}),
			bars.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-md bg-secondary/60 px-3 py-6 text-sm text-muted-foreground",
				children: "Add action items to see them on the schedule. Notes are omitted."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg border border-border bg-secondary/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-full",
					style: { minWidth: width + 192 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex border-b border-border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sticky left-0 z-10 w-48 shrink-0 border-r border-border bg-card px-3 py-2 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase",
							children: "Task"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							style: { width },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex",
									children: days.map((day, i) => {
										const show = i === 0 || i % 7 === 0;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "shrink-0 border-r border-border/60 py-2 text-center",
											style: { width: DAY_PX },
											children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "relative z-[2] block w-12 -translate-x-2 font-mono text-[0.6rem] text-muted-foreground",
												children: formatDate(day).replace(/ \d{4}$/, "")
											}) : null
										}, day);
									})
								}),
								todayIndex >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pointer-events-none absolute top-0 bottom-0 z-[1] w-px bg-primary",
									style: { left: todayIndex * DAY_PX + DAY_PX / 2 },
									title: `Today ${formatDate(today)}`
								}) : null,
								deadlineIndex >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pointer-events-none absolute top-0 bottom-0 z-[1] w-px bg-status-high",
									style: { left: deadlineIndex * DAY_PX + DAY_PX / 2 },
									title: `Deadline ${formatDate(deadline)}`
								}) : null
							]
						})]
					}), byDept.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex border-b border-border bg-muted/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sticky left-0 z-10 w-48 shrink-0 border-r border-border bg-muted/80 px-3 py-1.5 font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase",
							children: group.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width } })]
					}), group.bars.map((bar) => {
						const startIdx = Math.max(0, days.indexOf(bar.start));
						const endIdx = Math.max(startIdx, days.indexOf(bar.end));
						const left = startIdx * DAY_PX;
						const barWidth = Math.max(24, (endIdx - startIdx + 1) * DAY_PX - 6);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex border-b border-border/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "sticky left-0 z-10 w-48 shrink-0 truncate border-r border-border bg-card px-3 py-2 text-left text-xs hover:bg-secondary",
								onClick: () => onFocusItem(bar.id, bar.department),
								title: bar.title,
								children: bar.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative h-10",
								style: { width },
								children: [
									todayIndex >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pointer-events-none absolute top-0 bottom-0 w-px bg-primary/40",
										style: { left: todayIndex * DAY_PX + DAY_PX / 2 }
									}) : null,
									deadlineIndex >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pointer-events-none absolute top-0 bottom-0 w-px bg-status-high/50",
										style: { left: deadlineIndex * DAY_PX + DAY_PX / 2 }
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: cn("absolute top-2 h-6 rounded-sm text-left", bar.complete && "bg-status-complete/70", !bar.complete && bar.overdue && "bg-status-high", !bar.complete && !bar.overdue && bar.high && "bg-status-low", !bar.complete && !bar.overdue && !bar.high && "bg-status-progress"),
										style: {
											left: left + 2,
											width: barWidth
										},
										onClick: () => onFocusItem(bar.id, bar.department),
										title: `${bar.title} · ${formatDate(bar.start)} – ${formatDate(bar.end)}`
									})
								]
							})]
						}, bar.id);
					})] }, group.key))]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-[0.65rem] text-muted-foreground",
				children: [
					formatDate(rangeStart),
					" – ",
					formatDate(rangeEnd),
					deadline ? ` · Deadline ${formatDate(deadline)}` : " · No deadline set",
					" · ",
					"Today marker in steel, deadline in red."
				]
			})
		]
	});
}
function RocDetail({ data, selectedDept, focusItemId, onSelectDept, onFocusItem }) {
	const { roc } = data;
	const addTab = useOpenTabs((s) => s.add);
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		addTab({
			id: roc.id,
			rocNumber: roc.roc_number,
			title: roc.title
		});
	}, [
		addTab,
		roc.id,
		roc.roc_number,
		roc.title
	]);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [showGantt, setShowGantt] = (0, import_react.useState)(false);
	const [number, setNumber] = (0, import_react.useState)(roc.roc_number);
	const [title, setTitle] = (0, import_react.useState)(roc.title);
	const [description, setDescription] = (0, import_react.useState)(roc.description);
	const [startDate, setStartDate] = (0, import_react.useState)(roc.actual_release_date ?? "");
	const [deadline, setDeadline] = (0, import_react.useState)(roc.deadline ?? "");
	const [additional, setAdditional] = (0, import_react.useState)(roc.additional_notes);
	const [singleProject, setSingleProject] = (0, import_react.useState)(roc.single_project);
	const [projectName, setProjectName] = (0, import_react.useState)(roc.project_name);
	(0, import_react.useEffect)(() => {
		setNumber(roc.roc_number);
		setTitle(roc.title);
		setDescription(roc.description);
		setStartDate(roc.actual_release_date ?? "");
		setDeadline(roc.deadline ?? "");
		setAdditional(roc.additional_notes);
		setSingleProject(roc.single_project);
		setProjectName(roc.project_name);
	}, [roc]);
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["roc", roc.id] });
		queryClient.invalidateQueries({ queryKey: ["rocs"] });
		queryClient.invalidateQueries({ queryKey: ["activity"] });
	};
	const save = useMutation({
		mutationFn: () => updateRoc({ data: {
			id: roc.id,
			rocNumber: number,
			title,
			description,
			actualReleaseDate: startDate || null,
			deadline: deadline || null,
			additionalNotes: additional,
			singleProject,
			projectName: singleProject ? projectName : ""
		} }),
		onSuccess: () => {
			toast.success("ROC updated");
			setEditing(false);
			invalidate();
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Save failed")
	});
	const deadlineMutation = useMutation({
		mutationFn: (next) => updateRoc({ data: {
			id: roc.id,
			deadline: next
		} }),
		onSuccess: invalidate,
		onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save deadline")
	});
	const statusMutation = useMutation({
		mutationFn: (overallStatus) => updateRoc({ data: {
			id: roc.id,
			overallStatus
		} }),
		onSuccess: invalidate
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rounded-xl border border-border bg-card p-5 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs font-semibold tracking-wide text-primary",
									children: roc.roc_number
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 text-2xl font-semibold tracking-tight",
									children: roc.title
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: roc.overall_status,
								onValueChange: (v) => statusMutation.mutate(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "w-full sm:w-52",
									"aria-label": "ROC status",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROC_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s.key,
									children: s.label
								}, s.key)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditing((v) => !v),
								children: editing ? "Close editor" : "Edit details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: showGantt ? "secondary" : "outline",
								onClick: () => setShowGantt((v) => !v),
								"aria-expanded": showGantt,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartGantt, { className: "size-4" }), showGantt ? "Hide Gantt" : "Gantt chart"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: rocStatusVariant(roc.overall_status),
								children: rocStatusLabel(roc.overall_status)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"Start ",
									formatDate(roc.actual_release_date),
									" · Deadline",
									" ",
									formatDate(roc.deadline)
								]
							}),
							roc.single_project ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "high",
								children: ["Project", roc.project_name.trim() ? ` · ${roc.project_name.trim()}` : ""]
							}) : null
						]
					}),
					!roc.deadline && !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid max-w-xs gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "header-deadline",
							children: "Project deadline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "header-deadline",
							type: "date",
							value: deadline,
							onChange: (e) => {
								const next = e.target.value;
								setDeadline(next);
								deadlineMutation.mutate(next || null);
							},
							className: "h-10"
						})]
					}) : null,
					!editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90",
						children: roc.description
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 grid gap-3",
						onSubmit: (e) => {
							e.preventDefault();
							save.mutate();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "ROC number",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: number,
										onChange: (e) => setNumber(e.target.value),
										className: "font-mono"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Project name",
									className: "sm:col-span-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: title,
										onChange: (e) => setTitle(e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Description",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: description,
									onChange: (e) => setDescription(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Start date",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: startDate,
										onChange: (e) => setStartDate(e.target.value)
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Project deadline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: deadline,
										onChange: (e) => setDeadline(e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 rounded-md border border-border bg-secondary/40 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											className: "size-4 accent-primary",
											checked: singleProject,
											onChange: (e) => setSingleProject(e.target.checked)
										}), "Project"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "This ROC applies to a change for a single project only."
									}),
									singleProject ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Project name",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: projectName,
											onChange: (e) => setProjectName(e.target.value),
											placeholder: "Project this change applies to"
										})
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Additional notes",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: additional,
									onChange: (e) => setAdditional(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RocFiles, {
								rocId: roc.id,
								attachments: data.attachments,
								editing: true,
								onChanged: invalidate
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: save.isPending,
									children: "Save ROC"
								})
							})
						]
					}),
					!editing && roc.additional_notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-4 grid gap-3 text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase",
							children: "Additional notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 line-clamp-6 text-foreground/90",
							children: roc.additional_notes
						})] })
					}) : null,
					!editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RocFiles, {
							rocId: roc.id,
							attachments: data.attachments,
							editing: false,
							onChanged: invalidate
						})
					}) : null
				]
			}),
			showGantt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-5 shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight",
					children: "Schedule"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GanttChart, {
						items: data.actionItems,
						deadline: roc.deadline,
						onDeadlineChange: (value) => {
							setDeadline(value ?? "");
							deadlineMutation.mutate(value);
						},
						onFocusItem
					})
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepartmentBoard, {
				rocId: roc.id,
				departments: data.departments,
				actionItems: data.actionItems,
				selected: selectedDept,
				focusItemId,
				onSelect: onSelectDept
			})
		]
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `grid gap-1.5 ${className ?? ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function RocFiles({ rocId, attachments, editing, onChanged }) {
	const inputRef = (0, import_react.useRef)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [parsing, setParsing] = (0, import_react.useState)(false);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const upload = useMutation({
		mutationFn: (data) => addAttachment({ data: {
			rocId,
			...data
		} }),
		onSuccess: () => {
			toast.success("File added");
			onChanged();
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Could not add file")
	});
	const remove = useMutation({
		mutationFn: (id) => deleteAttachment({ data: { id } }),
		onSuccess: () => {
			toast.success("File deleted");
			setPendingDelete(null);
			onChanged();
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete file")
	});
	async function handleFile(file) {
		if (!file) return;
		if (file.size > 6291456) {
			toast.error("File is too large (6 MB max)");
			return;
		}
		setParsing(true);
		try {
			const [extractText, contentBase64] = await Promise.all([extractFileText(file), fileToBase64(file)]);
			await upload.mutateAsync({
				filename: file.name,
				mime: file.type || "application/octet-stream",
				extractText,
				contentBase64
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not read file");
		} finally {
			setParsing(false);
		}
	}
	async function download(file) {
		try {
			const row = await getAttachment({ data: { id: file.id } });
			if (row.content_base64) {
				downloadBase64(row.filename, row.mime, row.content_base64);
				return;
			}
			if (row.extract_text) {
				const blob = new Blob([row.extract_text], { type: "text/plain" });
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = row.filename.replace(/\.[^.]+$/, "") + ".txt";
				document.body.appendChild(link);
				link.click();
				link.remove();
				URL.revokeObjectURL(url);
				return;
			}
			toast.error("No file content to download");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not download");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Files" }),
			attachments.length === 0 && !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No files attached yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: attachments.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-4 shrink-0 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm",
							children: file.filename
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: () => void download(file),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Download"]
						}),
						editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "icon",
							"aria-label": `Delete ${file.filename}`,
							onClick: () => setPendingDelete(file),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
						}) : null
					]
				}, file.id))
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => inputRef.current?.click(),
				onDragOver: (e) => {
					e.preventDefault();
					setDragOver(true);
				},
				onDragLeave: () => setDragOver(false),
				onDrop: (e) => {
					e.preventDefault();
					setDragOver(false);
					handleFile(e.dataTransfer.files[0]);
				},
				className: cn("flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-5 text-center transition-colors", dragOver && "border-primary bg-accent"),
				children: [
					parsing || upload.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-5 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-foreground",
						children: "Drop a file here or click to add"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Excel, PDF, images, or other documents · 6 MB max"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				className: "sr-only",
				onChange: (e) => {
					handleFile(e.target.files?.[0]);
					e.target.value = "";
				}
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: pendingDelete != null,
				onOpenChange: (open) => {
					if (!open) setPendingDelete(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Delete this file?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"This will permanently remove “",
					pendingDelete?.filename,
					"”."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => setPendingDelete(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "destructive",
					disabled: remove.isPending,
					onClick: () => {
						if (pendingDelete) remove.mutate(pendingDelete.id);
					},
					children: "Delete"
				})] })] })
			})
		]
	});
}
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
		initialData: Number.isFinite(rocId) ? initial : void 0
	});
	const focusedItem = data?.actionItems.find((row) => row.id === focusItemId);
	const selected = focusedItem?.department ?? dept ?? data?.actionItems.find((item) => item.kind !== "note" && item.status !== "complete")?.department ?? data?.departments.find((row) => row.status !== "na" && row.status !== "not_started")?.department ?? "engineering";
	if (!Number.isFinite(rocId)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Missing, {});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full rounded-xl" })]
	});
	if (isError || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-6 shadow-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Could not open this ROC"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: error instanceof Error ? error.message : "It may have been removed."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm font-medium text-primary underline-offset-4 hover:underline",
					onClick: () => void refetch(),
					children: "Retry"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-sm font-medium text-foreground underline-offset-4 hover:underline",
					children: "Back to tracker"
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Tracker"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RocDetail, {
			data,
			selectedDept: selected,
			focusItemId: focusedItem?.id,
			onSelectDept: (key) => {
				navigate({
					search: { dept: key },
					replace: true
				});
			},
			onFocusItem: (id, dept) => {
				navigate({
					search: {
						dept,
						item: id
					},
					replace: true
				});
			}
		})]
	});
}
function Missing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-6 shadow-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: "Invalid ROC"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-2 inline-block text-sm text-primary",
			children: "Back to tracker"
		})]
	});
}
//#endregion
export { RocPage as component };
