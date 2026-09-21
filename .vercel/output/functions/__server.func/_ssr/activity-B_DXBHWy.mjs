import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { y as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { W as listActivity, b as ActivityList, i as Route$2, nt as useOpenTabs } from "./router-MkaizW1V.mjs";
import { t as Skeleton } from "./skeleton-BSVtkruh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-B_DXBHWy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ActivityPage() {
	const { range, dept, roc } = Route$2.useSearch();
	const navigate = Route$2.useNavigate();
	const openActivity = useOpenTabs((s) => s.openActivity);
	const initial = Route$2.useLoaderData();
	(0, import_react.useEffect)(() => {
		openActivity();
	}, [openActivity]);
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["activity"],
		queryFn: () => listActivity(),
		initialData: initial
	});
	const items = data ?? [];
	const setSearch = (next) => {
		const nextRange = next.range ?? range;
		const nextDept = "dept" in next ? next.dept : dept;
		const nextRoc = "roc" in next ? next.roc : roc;
		navigate({
			search: {
				range: nextRange,
				...nextDept ? { dept: nextDept } : {},
				...nextRoc ? { roc: nextRoc } : {}
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Recent activity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm text-muted-foreground",
				children: "New projects, new actions, completions, and follow-ups. Filter by timeframe, project, or department."
			})] }),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" })]
			}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-6 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Could not load activity"
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
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityList, {
				items,
				range,
				department: dept,
				rocId: roc,
				onRange: (next) => setSearch({ range: next }),
				onDepartment: (next) => setSearch({ dept: next }),
				onRoc: (next) => setSearch({ roc: next })
			})
		]
	});
}
//#endregion
export { ActivityPage as component };
