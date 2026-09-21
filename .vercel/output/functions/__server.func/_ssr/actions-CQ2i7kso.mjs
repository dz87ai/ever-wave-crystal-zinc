import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { y as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { K as listOpenActions, a as Route$3, nt as useOpenTabs, o as NeedActionList } from "./router-MkaizW1V.mjs";
import { t as Skeleton } from "./skeleton-BSVtkruh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-CQ2i7kso.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ActionsPage() {
	const { sort, dept, roc, successors } = Route$3.useSearch();
	const navigate = Route$3.useNavigate();
	const openActions = useOpenTabs((s) => s.openActions);
	const initial = Route$3.useLoaderData();
	const showSuccessors = Boolean(successors);
	(0, import_react.useEffect)(() => {
		openActions();
	}, [openActions]);
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["open-actions"],
		queryFn: () => listOpenActions(),
		initialData: initial
	});
	const items = data ?? [];
	const setSearch = (next) => {
		const nextSort = next.sort ?? sort;
		const nextDept = "dept" in next ? next.dept : dept;
		const nextRoc = "roc" in next ? next.roc : roc;
		const nextSuccessors = "successors" in next ? next.successors : showSuccessors;
		navigate({
			search: {
				sort: nextSort,
				...nextDept ? { dept: nextDept } : {},
				...nextRoc ? { roc: nextRoc } : {},
				...nextSuccessors ? { successors: true } : {}
			},
			replace: true
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Tracker"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Need action"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted-foreground",
					children: "Work that can start now, across every ROC. Successor tasks stay hidden until you show them. Filter by project or department."
				})] })
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" })
				]
			}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-6 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Could not load action items"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: error instanceof Error ? error.message : "Try again."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline",
						onClick: () => void refetch(),
						children: "Retry"
					})
				]
			}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-dashed border-border bg-card/70 px-6 py-16 text-center shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "Nothing needs action"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Open items will show up here as departments add them."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeedActionList, {
				items,
				sort,
				department: dept,
				rocId: roc,
				showSuccessors,
				onSort: (next) => setSearch({ sort: next }),
				onDepartment: (next) => setSearch({ dept: next }),
				onRoc: (next) => setSearch({ roc: next }),
				onShowSuccessors: (next) => setSearch({ successors: next })
			})
		]
	});
}
//#endregion
export { ActionsPage as component };
