import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { C as isDepartmentKey, T as isDueOverdue, b as formatDateTime, h as departmentLabel, j as normalizeNoticeSettings, n as ACTION_STATUSES, r as DEPARTMENTS, y as formatDate } from "./notice-schedule-CLIK4nXr.mjs";
import { g as Check, h as ChevronDown, i as Settings, m as ChevronUp, n as TriangleAlert, t as X, v as CalendarDays } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as SelectItemIndicator, c as SelectScrollDownButton$1, d as SelectValue$1, f as SelectViewport, i as SelectItem$1, l as SelectScrollUpButton$1, n as SelectContent$1, o as SelectItemText, r as SelectIcon, s as SelectPortal, t as Select$1, u as SelectTrigger$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { a as Trigger$1, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/select-Dpj8dpml.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var useOpenTabs = create((set, get) => ({
	tabs: [],
	actionsOpen: false,
	activityOpen: false,
	add: (tab) => {
		if (get().tabs.some((t) => t.id === tab.id)) {
			set({ tabs: get().tabs.map((t) => t.id === tab.id ? tab : t) });
			return;
		}
		set({ tabs: [...get().tabs, tab] });
	},
	remove: (id) => set({ tabs: get().tabs.filter((t) => t.id !== id) }),
	openActions: () => set({ actionsOpen: true }),
	closeActions: () => set({ actionsOpen: false }),
	openActivity: () => set({ activityOpen: true }),
	closeActivity: () => set({ activityOpen: false })
}));
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listRocs = createServerFn({ method: "GET" }).handler(createSsrRpc("24ae18c9d2846592a69e999fe9d9dfff2ab6d0f6039583fd76ee732fb0759d26"));
var listOpenActions = createServerFn({ method: "GET" }).handler(createSsrRpc("62c773c4d062c26a7748ac6fba89f806ce09d7023db36a8b6392ad7818d1434e"));
var getRoc = createServerFn({ method: "GET" }).validator((data) => data).handler(createSsrRpc("01900cc0009760f719d78a7813dd6c60fdfe6bd35877200ee48c8456d9461b45"));
var createRoc = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("3c1c53c526c177623d077bb986579c3ce5d5323176ae24fc5d130746948d53ac"));
var updateRoc = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("01595cfe90ff45f57d2e4d31e712a58749d27f8310738acdd229cc46a112394e"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("bd5a7843fbeb3cb22afbb3c26946459826ed90c37ecb260a78a9919ccecc88a5"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("a4b38eda3416892281c9cd733bea2f5786fa24623e7b2853633129401a1a2b23"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("a90666914e2f5d370582f0770c2942ee15fe0838cbe1b2211116fa0a0806460c"));
var addAttachment = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("2acb811467fcf0386221db4ca9d8ba5f3ccacba71b31a53ccd47d0292df505dd"));
var getAttachment = createServerFn({ method: "GET" }).validator((data) => data).handler(createSsrRpc("76e8bae5951733008faf7b5fa5082e83b03f98ad1d261745b3ee72a24e04e1cd"));
var deleteAttachment = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("4b3d21071a52baffec0f62e549812c6378df39a498d340311305e82c2898ba91"));
var setDepartmentStatus = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("7ae66d3bb73f4c74c89a6e6fd6470177894a56a1820997b18480bb1ac4dce6e8"));
var addActionItem = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("0b0190b25f7932abfddf1054fc79a192e936b2557b083ae6a18aedfe608d2559"));
var updateActionItem = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("5bd227cb6a7f13ec2016a7004e2118ce2aa4b40ba4fc4b72c2b3555c0c7ac739"));
var addActionUpdate = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("e7403f6493309a728f2f3d2be44fbdb27cac835092925d06d5023bda8f710d5a"));
var deleteActionItem = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("42f962730530e50eda922f82e5064f9fc4a7d8c937ce474866bb307df0688620"));
var listActivity = createServerFn({ method: "GET" }).handler(createSsrRpc("fcfa140a5ea33a7d9544363357e12d265829efdb72ab0ef955b428d218924f63"));
var listDepartmentContacts = createServerFn({ method: "GET" }).handler(createSsrRpc("14f20063591989c3c298befe710687ebb603769ec55407e7f04578a9b04da781"));
var saveDepartmentContacts = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("22fd423041c44dcf95f7cdcbf0ea0ed4349a32d738cbad77e9befa81db3ec326"));
var getNoticeSettings = createServerFn({ method: "GET" }).handler(createSsrRpc("5fe946ccdfff213010489288ab343f010dc55a573cb749eedcc5ab213f062c40"));
var saveNoticeSettings = createServerFn({ method: "POST" }).validator((data) => normalizeNoticeSettings(data)).handler(createSsrRpc("ec7ec9c2583c0d6aa0f3f589c817e98f0e72c42caaa601b89ae31515c23b80bb"));
var sendLateNotices = createServerFn({ method: "POST" }).validator((data) => ({ force: Boolean(data?.force) })).handler(createSsrRpc("ab5358d1733b31bac24651ee43bff5c28ef54d704ae10c8315ec35f3fa21ca0f"));
var saveDailyState = createServerFn({ method: "POST" }).handler(createSsrRpc("45561b230ac07f84c651eb09d2a6a5b704afbefe3b31752ff305673dc4833868"));
var listTrackerStates = createServerFn({ method: "GET" }).handler(createSsrRpc("874a1308b3f62ff71ab94ae9b7891aad27fe6deabef8a9078eca5d3308e630dd"));
var exportTrackerStateDocx = createServerFn({ method: "GET" }).validator((data) => {
	const id = Math.trunc(Number(data?.id));
	if (!Number.isFinite(id) || id <= 0) throw new Error("Choose a saved state.");
	return { id };
}).handler(createSsrRpc("5bf53f4faa9409f9959d01c07e88310c87a450e9a9d6f88d2fd22d212bb8fa7c"));
var restoreTrackerState = createServerFn({ method: "POST" }).validator((data) => {
	const id = Math.trunc(Number(data?.id));
	if (!Number.isFinite(id) || id <= 0) throw new Error("Choose a saved state.");
	return { id };
}).handler(createSsrRpc("e61734259a90ace9bb21a0cb5bda54a47577e6726f540414160a3c5df5d524c8"));
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-muted shadow-panel",
			outline: "border border-border bg-card text-foreground hover:bg-secondary",
			ghost: "text-foreground hover:bg-secondary",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-10 px-4 py-2",
			sm: "h-8 rounded-sm px-3 text-xs",
			lg: "h-11 rounded-md px-5",
			icon: "h-10 w-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
var Select = Select$1;
var SelectValue = SelectValue$1;
function SelectTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
		className: cn("flex h-10 w-full items-center justify-between gap-2 rounded-sm border border-input bg-card px-3 py-2 text-sm shadow-panel transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 opacity-60" })
		})]
	});
}
function SelectScrollUpButton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
		className: cn("flex cursor-default items-center justify-center py-1", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4" })
	});
}
function SelectScrollDownButton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
		className: cn("flex cursor-default items-center justify-center py-1", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" })
	});
}
function SelectContent({ className, children, position = "popper", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
		className: cn("relative z-50 max-h-72 min-w-32 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-panel data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
		position,
		...props,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
				className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
		]
	}) });
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
		className: cn("relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-secondary data-disabled:pointer-events-none data-disabled:opacity-50", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute right-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/badge-B4gbHEJd.js
var badgeVariants = cva("inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide whitespace-nowrap", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground",
		secondary: "border-transparent bg-secondary text-secondary-foreground",
		outline: "border-border text-foreground",
		high: "border-transparent bg-status-high/15 text-status-high",
		low: "border-transparent bg-status-low/15 text-status-low",
		complete: "border-transparent bg-status-complete/15 text-status-complete",
		progress: "border-transparent bg-status-progress/15 text-status-progress",
		hold: "border-transparent bg-status-hold/15 text-status-hold",
		review: "border-transparent bg-status-review/15 text-status-review",
		muted: "border-transparent bg-muted text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/tabs-BQQcySrv.js
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("inline-flex h-10 items-center justify-center rounded-md bg-secondary p-1 text-muted-foreground", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-panel", className),
		...props
	});
}
function TabsContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
		className: cn("mt-4 focus-visible:outline-none", className),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/activity-list-lUm3Ogw2.js
var ACTIVITY_RANGES = [
	{
		key: "day",
		label: "Last day"
	},
	{
		key: "week",
		label: "Last week"
	},
	{
		key: "month",
		label: "Last month"
	}
];
var KIND_LABEL = {
	roc_created: "Project created",
	action_created: "Action added",
	note_created: "Note added",
	action_completed: "Marked complete",
	action_reopened: "Reopened",
	follow_up: "Follow-up posted"
};
var KIND_VARIANT = {
	roc_created: "progress",
	action_created: "low",
	note_created: "muted",
	action_completed: "complete",
	action_reopened: "high",
	follow_up: "outline"
};
function inActivityRange(occurredAt, range) {
	const at = new Date(occurredAt).getTime();
	if (Number.isNaN(at)) return false;
	const hours = range === "day" ? 24 : range === "week" ? 168 : 720;
	return Date.now() - at <= hours * 60 * 60 * 1e3;
}
function ActivityList({ items, range, department, rocId, onRange, onDepartment, onRoc }) {
	const scoped = items.filter((item) => inActivityRange(item.occurred_at, range));
	const byRoc = rocId ? scoped.filter((item) => item.roc_id === rocId) : scoped;
	const visible = department ? byRoc.filter((item) => item.department === department) : byRoc;
	const projects = [...new Map(scoped.map((item) => [item.roc_id, item])).values()].map((item) => ({
		id: item.roc_id,
		number: item.roc_number,
		title: item.roc_title,
		count: scoped.filter((row) => row.roc_id === item.roc_id).length
	})).sort((a, b) => a.number.localeCompare(b.number));
	const counts = /* @__PURE__ */ new Map();
	for (const item of byRoc) {
		if (!item.department) continue;
		counts.set(item.department, (counts.get(item.department) ?? 0) + 1);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 lg:flex-row lg:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: ACTIVITY_RANGES.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: range === option.key ? "secondary" : "outline",
					onClick: () => onRange(option.key),
					children: option.label
				}, option.key))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: rocId != null ? String(rocId) : "all",
					onValueChange: (value) => onRoc(value === "all" ? void 0 : Number(value)),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-10 w-full sm:w-64",
						"aria-label": "Filter by project",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All projects" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
						className: "max-h-[min(24rem,70vh)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
							value: "all",
							children: [
								"All projects (",
								scoped.length,
								")"
							]
						}), projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
							value: String(project.id),
							children: [
								project.number,
								" · ",
								project.title,
								" (",
								project.count,
								")"
							]
						}, project.id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: department ?? "all",
					onValueChange: (value) => onDepartment(value === "all" ? void 0 : value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "h-10 w-full sm:w-60",
						"aria-label": "Filter by department",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All departments" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
						className: "max-h-[min(24rem,70vh)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
							value: "all",
							children: [
								"All departments (",
								byRoc.length,
								")"
							]
						}), DEPARTMENTS.map((dept) => {
							const count = counts.get(dept.key) ?? 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: dept.key,
								children: [dept.label, count ? ` (${count})` : ""]
							}, dept.key);
						})]
					})]
				})]
			})]
		}), visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-dashed border-border bg-card/70 px-6 py-12 text-center shadow-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "No activity in this window"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Try a longer timeframe, or another project or department."
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "grid gap-3",
			children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityRow, { item }) }, item.id))
		})]
	});
}
function ActivityRow({ item }) {
	const addTab = useOpenTabs((s) => s.add);
	const openItem = () => addTab({
		id: item.roc_id,
		rocNumber: item.roc_number,
		title: item.roc_title
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border border-border bg-card p-4 shadow-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: KIND_VARIANT[item.kind],
						children: KIND_LABEL[item.kind]
					}),
					item.department && isDepartmentKey(item.department) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "muted",
						children: departmentLabel(item.department)
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "min-w-0 flex-1 text-sm font-medium",
						children: item.action_item_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/roc/$id",
							params: { id: String(item.roc_id) },
							search: {
								dept: item.department && isDepartmentKey(item.department) ? item.department : void 0,
								item: item.action_item_id
							},
							onClick: openItem,
							className: "text-primary no-underline hover:underline",
							children: item.title
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/roc/$id",
							params: { id: String(item.roc_id) },
							onClick: openItem,
							className: "text-primary no-underline hover:underline",
							children: item.title
						})
					})
				]
			}),
			item.details && item.kind === "follow_up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 line-clamp-2 text-sm text-muted-foreground",
				children: item.details
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/roc/$id",
						params: { id: String(item.roc_id) },
						search: item.action_item_id ? {
							dept: item.department && isDepartmentKey(item.department) ? item.department : void 0,
							item: item.action_item_id
						} : void 0,
						onClick: openItem,
						className: "font-medium text-foreground no-underline hover:underline",
						children: [
							item.roc_number,
							" · ",
							item.roc_title
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.posted_as }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[0.65rem]",
						children: formatDateTime(item.occurred_at)
					})
				]
			})
		]
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-MkaizW1V.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function TooltipProvider({ delayDuration = 200, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration,
		...props
	});
}
var Tooltip = Root3;
var TooltipTrigger = Trigger$1;
function TooltipContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 max-w-xs rounded-sm bg-foreground px-3 py-1.5 text-xs text-background shadow-panel", className),
		...props
	}) });
}
function Toaster$1(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme: "light",
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast bg-card text-card-foreground border-border shadow-panel",
			description: "text-muted-foreground",
			actionButton: "bg-primary text-primary-foreground",
			cancelButton: "bg-secondary text-secondary-foreground"
		} },
		...props
	});
}
var STORAGE_KEY = "roc-posted-as";
var pickedThisVisit = false;
var POST_AS_OPTIONS = [
	...DEPARTMENTS.map((d) => d.label),
	"Quality Meeting",
	"Management"
];
var useIdentity = create((set) => ({
	postedAs: "Engineering",
	savedPostedAs: null,
	hydrated: false,
	needsDepartment: false,
	setPostedAs: (value) => {
		const next = value.trim() || "Engineering";
		if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
		set({
			postedAs: next,
			savedPostedAs: next
		});
	},
	confirmDepartment: (value) => {
		const next = value.trim() || "Engineering";
		pickedThisVisit = true;
		if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
		set({
			postedAs: next,
			savedPostedAs: next,
			needsDepartment: false
		});
	},
	hydrate: () => {
		if (typeof window === "undefined") return;
		const stored = window.localStorage.getItem(STORAGE_KEY)?.trim() || null;
		set({
			postedAs: stored || "Engineering",
			savedPostedAs: stored,
			hydrated: true,
			needsDepartment: !pickedThisVisit
		});
	}
}));
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, showClose = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-panel duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, showClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-4 right-4 rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		}) : null]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 text-left", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-lg font-semibold leading-snug", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		"data-slot": "label",
		className: cn("text-xs font-medium tracking-wide text-muted-foreground", className),
		...props
	});
}
function DepartmentGate() {
	const hydrated = useIdentity((s) => s.hydrated);
	const needsDepartment = useIdentity((s) => s.needsDepartment);
	useIdentity((s) => s.postedAs);
	const savedPostedAs = useIdentity((s) => s.savedPostedAs);
	const confirmDepartment = useIdentity((s) => s.confirmDepartment);
	const [choice, setChoice] = (0, import_react.useState)("");
	const open = hydrated && needsDepartment;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setChoice(savedPostedAs && POST_AS_OPTIONS.includes(savedPostedAs) ? savedPostedAs : "");
	}, [open, savedPostedAs]);
	function continueAs() {
		if (!choice) return;
		confirmDepartment(choice);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: () => void 0,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			showClose: false,
			className: "max-w-md",
			onPointerDownOutside: (event) => event.preventDefault(),
			onInteractOutside: (event) => event.preventDefault(),
			onEscapeKeyDown: (event) => event.preventDefault(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Select your department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Comments and tasks are posted as this department. You can change it later from the top of the page." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "department-choice",
						children: "Department"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: choice || void 0,
						onValueChange: setChoice,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "department-choice",
							className: "h-11",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a department" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: POST_AS_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: option,
							children: option
						}, option)) })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "min-h-11",
					disabled: !choice,
					onClick: continueAs,
					children: "Continue"
				}) })
			]
		})
	});
}
function AppShell({ children }) {
	const hydrate = useIdentity((s) => s.hydrate);
	const postedAs = useIdentity((s) => s.postedAs);
	const setPostedAs = useIdentity((s) => s.setPostedAs);
	const tabs = useOpenTabs((s) => s.tabs);
	const remove = useOpenTabs((s) => s.remove);
	const actionsOpen = useOpenTabs((s) => s.actionsOpen);
	const closeActions = useOpenTabs((s) => s.closeActions);
	const activityOpen = useOpenTabs((s) => s.activityOpen);
	const closeActivity = useOpenTabs((s) => s.closeActivity);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		function tick() {
			if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
			sendLateNotices({ data: { force: false } }).catch(() => void 0);
			saveDailyState().catch(() => void 0);
		}
		const first = window.setTimeout(tick, 4e3);
		const timer = window.setInterval(tick, 6e4);
		document.addEventListener("visibilitychange", tick);
		return () => {
			window.clearTimeout(first);
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", tick);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-draft flex min-h-dvh flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-card/90 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full items-center gap-3 px-4 sm:px-6 xl:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						"aria-label": "Open ROC tabs",
						className: "flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
								to: "/",
								active: pathname === "/",
								label: "Tracker"
							}),
							actionsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 items-stretch",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
									to: "/actions",
									active: pathname === "/actions",
									label: "Need action"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Close Need action",
									className: cn("flex items-center px-1 text-muted-foreground hover:text-foreground", pathname === "/actions" && "bg-background"),
									onClick: (event) => {
										event.preventDefault();
										closeActions();
										if (pathname === "/actions") navigate({ to: "/" });
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
								})]
							}) : null,
							activityOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 items-stretch",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
									to: "/activity",
									active: pathname === "/activity",
									label: "Recent activity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Close Recent activity",
									className: cn("flex items-center px-1 text-muted-foreground hover:text-foreground", pathname === "/activity" && "bg-background"),
									onClick: (event) => {
										event.preventDefault();
										closeActivity();
										if (pathname === "/activity") navigate({ to: "/" });
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
								})]
							}) : null,
							tabs.map((tab) => {
								const href = `/roc/${tab.id}`;
								const active = pathname === href;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex shrink-0 items-stretch",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
										to: "/roc/$id",
										params: { id: String(tab.id) },
										active,
										label: `${tab.rocNumber} · ${tab.title}`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": `Close ${tab.rocNumber}`,
										className: cn("flex items-center px-1 text-muted-foreground hover:text-foreground", active && "bg-background"),
										onClick: (event) => {
											event.preventDefault();
											remove(tab.id);
											if (active) navigate({ to: "/" });
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
									})]
								}, tab.id);
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden text-xs text-muted-foreground sm:inline",
								children: "Posting as"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: postedAs,
								onValueChange: setPostedAs,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"aria-label": "Posting as",
									className: "h-10 w-36 bg-card text-xs sm:w-52",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: POST_AS_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: option,
									children: option
								}, option)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/settings",
								"aria-label": "Settings",
								title: "Settings",
								className: cn("inline-flex size-11 items-center justify-center rounded-sm text-muted-foreground no-underline transition-colors", "hover:bg-secondary hover:text-foreground", pathname === "/settings" && "bg-secondary text-foreground"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex w-full flex-1 flex-col px-4 py-4 sm:px-6 sm:py-4 xl:px-8",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepartmentGate, {})
		]
	});
}
function TabLink({ to, params, active, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		params,
		className: cn("max-w-56 truncate border-b-2 px-3 py-3 text-xs font-medium no-underline transition-colors", active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"),
		children: label
	});
}
var styles_default = "/assets/styles-DEZ15cgO.css";
var APP_NAME = "ROC Tracker";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#1e4a56"
			},
			{
				name: "description",
				content: "Track design change ROCs across departments, with action items and follow-ups."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	const [queryClient] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 8e3,
		retry: 1,
		refetchOnWindowFocus: false
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
				client: queryClient,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})] })
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$4 = () => import("./routes-CbZ0vDZU.mjs");
var Route$4 = createFileRoute("/")({
	loader: () => Promise.all([listRocs(), listActivity()]),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var ACTION_SORTS = [{
	key: "importance",
	label: "Importance"
}, {
	key: "due",
	label: "Due date"
}];
function compareDue(a, b) {
	if (!a.due_date && !b.due_date) return 0;
	if (!a.due_date) return 1;
	if (!b.due_date) return -1;
	return a.due_date.localeCompare(b.due_date);
}
function comparePriority(a, b) {
	if (a.priority === b.priority) return 0;
	return a.priority === "high" ? -1 : 1;
}
function sortItems(items, sort) {
	const copy = [...items];
	copy.sort((a, b) => {
		if (sort === "due") {
			const overdueA = isDueOverdue(a.due_date) ? 0 : a.due_date ? 1 : 2;
			const overdueB = isDueOverdue(b.due_date) ? 0 : b.due_date ? 1 : 2;
			if (overdueA !== overdueB) return overdueA - overdueB;
			const due = compareDue(a, b);
			return due !== 0 ? due : comparePriority(a, b);
		}
		const p = comparePriority(a, b);
		return p !== 0 ? p : compareDue(a, b);
	});
	return copy;
}
function groupItems(items, sort) {
	const sorted = sortItems(items, sort);
	if (sort === "due") return [
		{
			key: "overdue",
			label: "Overdue",
			items: sorted.filter((i) => isDueOverdue(i.due_date))
		},
		{
			key: "upcoming",
			label: "Upcoming",
			items: sorted.filter((i) => i.due_date && !isDueOverdue(i.due_date))
		},
		{
			key: "none",
			label: "No due date",
			items: sorted.filter((i) => !i.due_date)
		}
	].filter((g) => g.items.length > 0);
	return [{
		key: "high",
		label: "High importance",
		items: sorted.filter((i) => i.priority === "high")
	}, {
		key: "low",
		label: "Low importance",
		items: sorted.filter((i) => i.priority === "low")
	}].filter((g) => g.items.length > 0);
}
function deptCounts(items) {
	const counts = /* @__PURE__ */ new Map();
	for (const item of items) counts.set(item.department, (counts.get(item.department) ?? 0) + 1);
	return counts;
}
function projectOptions(items) {
	const map = /* @__PURE__ */ new Map();
	for (const item of items) {
		const existing = map.get(item.roc_id);
		if (existing) existing.count += 1;
		else map.set(item.roc_id, {
			id: item.roc_id,
			number: item.roc_number,
			title: item.roc_title,
			count: 1
		});
	}
	return [...map.values()].sort((a, b) => a.number.localeCompare(b.number) || a.id - b.id);
}
function NeedActionList({ items, sort, department, rocId, showSuccessors, onSort, onDepartment, onRoc, onShowSuccessors }) {
	const unblocked = showSuccessors ? items : items.filter((item) => !item.blocked);
	const blockedCount = items.filter((item) => item.blocked).length;
	const projects = projectOptions(unblocked);
	const scoped = rocId ? unblocked.filter((item) => item.roc_id === rocId) : unblocked;
	const counts = deptCounts(scoped);
	const visible = department ? scoped.filter((item) => item.department === department) : scoped;
	const groups = groupItems(visible, sort);
	const projectLabel = rocId ? projects.find((p) => p.id === rocId) ?? projectOptions(items).find((p) => p.id === rocId) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					visible.length,
					" ",
					showSuccessors ? "open" : "ready",
					" ",
					visible.length === 1 ? "item" : "items",
					projectLabel ? ` on ${projectLabel.number}` : "",
					department ? ` in ${departmentLabel(department)}` : "",
					!showSuccessors && blockedCount ? ` · ${blockedCount} successor${blockedCount === 1 ? "" : "s"} waiting` : "",
					"."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: sort,
						onValueChange: (value) => onSort(value),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
							className: "h-10 w-full sm:w-auto",
							"aria-label": "Sort items",
							children: ACTION_SORTS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: option.key,
								className: "min-h-8 flex-1 sm:flex-none",
								children: option.label
							}, option.key))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: showSuccessors ? "secondary" : "outline",
						className: "h-10",
						"aria-pressed": showSuccessors,
						onClick: () => onShowSuccessors(!showSuccessors),
						children: showSuccessors ? "Hide successors" : "Show successors"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: rocId != null ? String(rocId) : "all",
						onValueChange: (value) => onRoc(value === "all" ? void 0 : Number(value)),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-10 w-full sm:w-64",
							"aria-label": "Filter by project",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All projects" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
							className: "max-h-[min(24rem,70vh)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: "all",
								children: [
									"All projects (",
									unblocked.length,
									")"
								]
							}), projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: String(project.id),
								children: [
									project.number,
									" · ",
									project.title,
									" (",
									project.count,
									")"
								]
							}, project.id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: department ?? "all",
						onValueChange: (value) => onDepartment(value === "all" ? void 0 : value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-10 w-full sm:w-60",
							"aria-label": "Filter by department",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All departments" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
							className: "max-h-[min(24rem,70vh)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: "all",
								children: [
									"All departments (",
									scoped.length,
									")"
								]
							}), DEPARTMENTS.map((dept) => {
								const count = counts.get(dept.key) ?? 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: dept.key,
									children: [dept.label, count ? ` (${count})` : ""]
								}, dept.key);
							})]
						})]
					})
				]
			})]
		}), visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-dashed border-border bg-card/70 px-6 py-12 text-center shadow-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: items.length === 0 ? "Nothing needs action" : !showSuccessors && blockedCount && scoped.length === 0 ? "Remaining items are successors" : "No open items for this filter"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: !showSuccessors && blockedCount ? "Turn on Show successors to see work waiting on a predecessor, or pick another project." : "Pick another project or department, or switch back to all."
			})]
		}) : groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-baseline gap-2 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase",
				children: [group.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: group.items.length
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-3",
				children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeedActionRow, { item }) }, item.id))
			})]
		}, group.key))]
	});
}
function NeedActionRow({ item }) {
	const addTab = useOpenTabs((s) => s.add);
	const overdue = isDueOverdue(item.due_date);
	const statusLabel = ACTION_STATUSES.find((s) => s.key === item.status)?.label ?? item.status;
	const openItem = () => addTab({
		id: item.roc_id,
		rocNumber: item.roc_number,
		title: item.roc_title
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border border-border bg-card p-4 shadow-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: item.priority === "high" ? "high" : "low",
						children: item.priority === "high" ? "High" : "Low"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: statusLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "muted",
						children: departmentLabel(item.department)
					}),
					item.blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "muted",
						children: "Successor"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "min-w-0 flex-1 text-sm font-medium",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/roc/$id",
							params: { id: String(item.roc_id) },
							search: {
								dept: item.department,
								item: item.id
							},
							onClick: openItem,
							className: "text-primary no-underline hover:underline",
							children: item.title
						})
					})
				]
			}),
			item.details ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 line-clamp-2 text-sm text-muted-foreground",
				children: item.details
			}) : null,
			item.blocked && item.predecessor_title ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: ["Waiting on ", item.predecessor_title]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/roc/$id",
					params: { id: String(item.roc_id) },
					search: {
						dept: item.department,
						item: item.id
					},
					onClick: openItem,
					className: "font-medium text-foreground no-underline hover:underline",
					children: [
						item.roc_number,
						" · ",
						item.roc_title
					]
				}), item.due_date ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("inline-flex items-center gap-1 font-mono text-[0.65rem]", overdue ? "text-status-high" : "text-muted-foreground"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5" }),
						overdue ? "Overdue" : "Due",
						" ",
						formatDate(item.due_date)
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[0.65rem] text-muted-foreground",
					children: "No due date"
				})]
			})
		]
	});
}
var $$splitComponentImporter$3 = () => import("./actions-CQ2i7kso.mjs");
function asSort(value) {
	return ACTION_SORTS.some((s) => s.key === value) ? value : "importance";
}
function asRocId$1(value) {
	if (value == null || value === "") return void 0;
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) && n > 0 ? Math.trunc(n) : void 0;
}
function asFlag(value) {
	if (value === true || value === "1" || value === "true") return true;
}
var Route$3 = createFileRoute("/actions")({
	validateSearch: (search) => {
		const dept = typeof search.dept === "string" ? search.dept : void 0;
		return {
			sort: asSort(search.sort),
			dept: dept && isDepartmentKey(dept) ? dept : void 0,
			roc: asRocId$1(search.roc),
			successors: asFlag(search.successors)
		};
	},
	loader: () => listOpenActions(),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./activity-B_DXBHWy.mjs");
function asRange(value) {
	return ACTIVITY_RANGES.some((s) => s.key === value) ? value : "week";
}
function asRocId(value) {
	if (value == null || value === "") return void 0;
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) && n > 0 ? Math.trunc(n) : void 0;
}
var Route$2 = createFileRoute("/activity")({
	validateSearch: (search) => {
		const dept = typeof search.dept === "string" ? search.dept : void 0;
		return {
			range: asRange(search.range),
			dept: dept && isDepartmentKey(dept) ? dept : void 0,
			roc: asRocId(search.roc)
		};
	},
	loader: () => listActivity(),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./settings-BU7MXm2l.mjs");
var Route$1 = createFileRoute("/settings")({
	loader: async () => {
		const [contacts, notice, states] = await Promise.all([
			listDepartmentContacts(),
			getNoticeSettings(),
			listTrackerStates()
		]);
		return {
			contacts,
			notice,
			states
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./roc._id-D75dgLiZ.mjs");
var Route = createFileRoute("/roc/$id")({
	validateSearch: (search) => {
		const dept = typeof search.dept === "string" ? search.dept : void 0;
		const rawItem = search.item;
		const item = typeof rawItem === "number" ? rawItem : typeof rawItem === "string" ? Number(rawItem) : NaN;
		return {
			dept: dept && isDepartmentKey(dept) ? dept : void 0,
			item: Number.isFinite(item) && item > 0 ? item : void 0
		};
	},
	loader: ({ params }) => getRoc({ data: { id: Number(params.id) } }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	ActionsRoute: Route$3.update({
		id: "/actions",
		path: "/actions",
		getParentRoute: () => Route$5
	}),
	ActivityRoute: Route$2.update({
		id: "/activity",
		path: "/activity",
		getParentRoute: () => Route$5
	}),
	SettingsRoute: Route$1.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$5
	}),
	RocIdRoute: Route.update({
		id: "/roc/$id",
		path: "/roc/$id",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { setDepartmentStatus as $, SelectItem as A, exportTrackerStateDocx as B, TabsContent as C, Button as D, Badge as E, addAttachment as F, listDepartmentContacts as G, getNoticeSettings as H, cn as I, listTrackerStates as J, listOpenActions as K, createRoc as L, SelectValue as M, addActionItem as N, Select as O, addActionUpdate as P, sendLateNotices as Q, deleteActionItem as R, Tabs as S, TabsTrigger as T, getRoc as U, getAttachment as V, listActivity as W, saveDepartmentContacts as X, restoreTrackerState as Y, saveNoticeSettings as Z, Tooltip as _, Route$3 as a, ActivityList as b, Label as c, DialogDescription as d, updateActionItem as et, DialogFooter as f, useIdentity as g, DialogTrigger as h, Route$2 as i, SelectTrigger as j, SelectContent as k, Dialog as l, DialogTitle as m, Route as n, useOpenTabs as nt, NeedActionList as o, DialogHeader as p, listRocs as q, Route$1 as r, Route$4 as s, router_exports as t, updateRoc as tt, DialogContent as u, TooltipContent as v, TabsList as w, inActivityRange as x, TooltipTrigger as y, deleteAttachment as z };
