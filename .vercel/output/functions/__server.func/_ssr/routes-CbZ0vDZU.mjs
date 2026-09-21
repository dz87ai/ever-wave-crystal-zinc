import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { A as nextRocNumber, M as rocStatusLabel, S as isActionRequired, d as ROC_STATUSES, g as deptStatusLabel, i as DEPT_STATUSES, r as DEPARTMENTS, y as formatDate } from "./notice-schedule-CLIK4nXr.mjs";
import { a as Search, d as LoaderCircle, f as FileUp, g as Check } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as SelectItem, D as Button, E as Badge, I as cn, L as createRoc, M as SelectValue, O as Select, W as listActivity, _ as Tooltip, c as Label, d as DialogDescription, f as DialogFooter, h as DialogTrigger, j as SelectTrigger, k as SelectContent, l as Dialog, m as DialogTitle, nt as useOpenTabs, p as DialogHeader, q as listRocs, s as Route$4, u as DialogContent, v as TooltipContent, x as inActivityRange, y as TooltipTrigger } from "./router-MkaizW1V.mjs";
import { t as Skeleton } from "./skeleton-BSVtkruh.mjs";
import { a as suggestTitleFromFile, r as extractFileText, t as Input } from "./input-lZCACGe0.mjs";
import { a as rocStatusVariant, i as deptDotClass, n as deptCellDisplay, t as Textarea } from "./status-style-Cx9OQkQb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CbZ0vDZU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AddRocDialog({ triggerClassName }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [rocNumber, setRocNumber] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [fileName, setFileName] = (0, import_react.useState)(null);
	const [extract, setExtract] = (0, import_react.useState)("");
	const [mime, setMime] = (0, import_react.useState)("");
	const [parsing, setParsing] = (0, import_react.useState)(false);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const addTab = useOpenTabs((s) => s.add);
	const { data: rocs } = useQuery({
		queryKey: ["rocs"],
		queryFn: () => listRocs()
	});
	function suggestedNumber() {
		return nextRocNumber((rocs ?? []).map((row) => row.roc_number));
	}
	const mutation = useMutation({
		mutationFn: () => createRoc({ data: {
			rocNumber: rocNumber.trim() || suggestedNumber(),
			title: title.trim(),
			description: description.trim(),
			additionalNotes: extract,
			attachment: fileName ? {
				filename: fileName,
				mime,
				extractText: extract
			} : null
		} }),
		onSuccess: async (result) => {
			await queryClient.invalidateQueries({ queryKey: ["rocs"] });
			await queryClient.invalidateQueries({ queryKey: ["activity"] });
			const number = rocNumber.trim() || suggestedNumber();
			addTab({
				id: result.id,
				rocNumber: number,
				title: title.trim()
			});
			toast.success("ROC added to the tracker");
			reset();
			setOpen(false);
			navigate({
				to: "/roc/$id",
				params: { id: String(result.id) }
			});
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not add ROC");
		}
	});
	function reset() {
		setRocNumber("");
		setTitle("");
		setDescription("");
		setFileName(null);
		setExtract("");
		setMime("");
		setParsing(false);
	}
	async function handleFile(file) {
		if (!file) return;
		setParsing(true);
		setFileName(file.name);
		setMime(file.type);
		if (!title.trim()) setTitle(suggestTitleFromFile(file));
		try {
			const text = await extractFileText(file);
			setExtract(text);
		} catch {
			setExtract(`(Could not read ${file.name})`);
		} finally {
			setParsing(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (next) => {
			setOpen(next);
			if (!next) reset();
			else setRocNumber(suggestedNumber());
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: triggerClassName,
				children: "Add ROC"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90dvh] overflow-y-auto sm:max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add a design change" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Name the ROC and optionally attach a tracking sheet or notes file. Departments can pick up action items on the project tab." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5 sm:col-span-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "roc-number",
									children: "ROC number"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "roc-number",
									placeholder: "ROC-001",
									value: rocNumber,
									onChange: (e) => setRocNumber(e.target.value),
									className: "font-mono"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "roc-title",
									children: "Project name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "roc-title",
									placeholder: "Bulb gasket on 8560 vent",
									value: title,
									onChange: (e) => setTitle(e.target.value),
									required: true
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "roc-desc",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "roc-desc",
								placeholder: "What is changing, and why.",
								value: description,
								onChange: (e) => setDescription(e.target.value),
								className: "min-h-28"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Project details file" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
									className: cn("flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-6 text-center transition-colors", dragOver && "border-primary bg-accent"),
									children: [
										parsing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-5 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-foreground",
											children: fileName ?? "Drop an Excel, CSV, or text file"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Extracted text is stored with the ROC for the team"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: inputRef,
									type: "file",
									className: "sr-only",
									accept: ".xlsx,.xls,.xlsm,.csv,.txt,.md,.json,.tsv,text/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
									onChange: (e) => {
										handleFile(e.target.files?.[0]);
										e.target.value = "";
									}
								}),
								extract ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									"aria-label": "Extracted file text",
									value: extract,
									onChange: (e) => setExtract(e.target.value),
									className: "max-h-40 min-h-24 font-mono text-xs"
								}) : null
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: !title.trim() || mutation.isPending || parsing,
					onClick: () => mutation.mutate(),
					children: [mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Add to tracker"]
				})] })
			]
		})]
	});
}
function isDeptIdle(cell) {
	if (cell.actionCount > 0 || cell.openCount > 0 || cell.lateCount > 0 || cell.allComplete || cell.waiting) return false;
	return cell.status === "na" || cell.status === "not_started";
}
function CellMark({ cell, compact = false }) {
	const display = deptCellDisplay(cell);
	const idle = isDeptIdle(cell);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("mx-auto flex items-center justify-center rounded-sm px-1 ring-1 no-underline", compact ? idle ? "h-4 min-w-4" : "h-6 min-w-6" : idle ? "h-9 min-w-9" : "h-10 min-w-10", display.tone),
		children: display.kind === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: compact ? idle ? "size-2.5" : "size-3.5" : idle ? "size-3.5" : "size-5",
			strokeWidth: 3,
			"aria-hidden": true
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("font-mono font-semibold", display.kind === "late" ? compact ? idle ? "text-[0.35rem] tracking-wide" : "text-[0.45rem] tracking-wide" : idle ? "text-[0.45rem] tracking-wide" : "text-[0.55rem] tracking-wide" : compact ? idle ? "text-[0.5rem]" : "text-[0.6rem]" : idle ? "text-[0.65rem]" : "text-xs"),
			children: display.mark
		})
	});
}
function TrackerGrid({ rocs }) {
	const addTab = useOpenTabs((s) => s.add);
	function openRoc(roc) {
		addTab({
			id: roc.id,
			rocNumber: roc.roc_number,
			title: roc.title
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hidden overflow-hidden rounded-xl border border-border bg-card shadow-panel lg:block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[64rem] table-fixed border-collapse text-left text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("colgroup", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-[8.5%]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "w-[17.5%]" }),
						DEPARTMENTS.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", {}, dept.key))
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border bg-secondary/60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "sticky left-0 z-20 bg-secondary px-3 py-3 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase",
								children: "ROC"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "sticky left-[8.5%] z-20 bg-secondary px-3 py-3 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase",
								children: "Project"
							}),
							DEPARTMENTS.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								title: dept.label,
								className: "truncate px-0.5 py-3 text-center font-mono text-[0.65rem] font-medium tracking-wide text-muted-foreground",
								children: dept.short
							}, dept.key))
						]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rocs.map((roc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-b-0 hover:bg-secondary/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "sticky left-0 z-10 bg-card px-3 py-3 align-top",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/roc/$id",
										params: { id: String(roc.id) },
										onClick: () => openRoc(roc),
										className: "font-mono text-xs font-semibold text-primary no-underline hover:underline",
										children: roc.roc_number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: rocStatusVariant(roc.overall_status),
											children: rocStatusLabel(roc.overall_status)
										})
									}),
									roc.single_project ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "high",
											children: "Project"
										})
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "sticky left-[8.5%] z-10 bg-card px-3 py-3 align-top",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/roc/$id",
										params: { id: String(roc.id) },
										onClick: () => openRoc(roc),
										className: "font-medium text-foreground no-underline hover:underline",
										children: roc.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
										children: roc.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 font-mono text-[0.65rem] text-muted-foreground",
										children: [
											"Start ",
											formatDate(roc.actual_release_date),
											roc.highOpen ? ` · ${roc.highOpen} high` : ""
										]
									})
								]
							}),
							roc.departments.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-0.5 py-2 align-middle",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/roc/$id",
										params: { id: String(roc.id) },
										search: { dept: cell.department },
										onClick: () => openRoc(roc),
										className: "block no-underline",
										"aria-label": `${DEPARTMENTS.find((d) => d.key === cell.department)?.label}: ${cell.waiting ? "waiting on predecessor" : cell.lateCount ? `${cell.lateCount} late` : cell.allComplete ? "all tasks complete" : deptStatusLabel(cell.status)}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellMark, { cell })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: DEPARTMENTS.find((d) => d.key === cell.department)?.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: deptStatusLabel(cell.status) }),
									cell.waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Waiting on predecessor" }) : cell.lateCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [cell.lateCount, " late"] }) : cell.allComplete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "All tasks complete" }) : null,
									cell.openCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										cell.openCount,
										" open",
										cell.highOpen ? ` · ${cell.highOpen} high` : ""
									] }) : null,
									cell.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 max-w-xs text-background/80",
										children: cell.notes
									}) : null
								] })] })
							}, cell.department))
						]
					}, roc.id)) })
				]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-3 lg:hidden",
		children: rocs.map((roc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/roc/$id",
			params: { id: String(roc.id) },
			onClick: () => openRoc(roc),
			className: "block rounded-xl border border-border bg-card p-4 text-foreground no-underline shadow-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs font-semibold text-primary",
						children: roc.roc_number
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: rocStatusVariant(roc.overall_status),
						children: rocStatusLabel(roc.overall_status)
					})]
				}),
				roc.single_project ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "high",
						children: "Project"
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-medium",
					children: roc.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
					children: roc.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-1",
					children: roc.departments.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						title: `${DEPARTMENTS.find((d) => d.key === cell.department)?.short}: ${cell.waiting ? "waiting" : cell.lateCount ? `${cell.lateCount} late` : cell.allComplete ? "all complete" : deptStatusLabel(cell.status)}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellMark, {
							cell,
							compact: true
						})
					}, cell.department))
				}),
				roc.highOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-status-high",
					children: [
						roc.highOpen,
						" high-importance action",
						roc.highOpen === 1 ? "" : "s",
						" open"
					]
				}) : roc.openActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						roc.openActions,
						" open action",
						roc.openActions === 1 ? "" : "s"
					]
				}) : null
			]
		}) }, roc.id))
	})] });
}
var ROC_SWATCH = {
	not_started: "bg-border",
	discussed: "bg-status-discussed",
	follow_up: "bg-status-low",
	ready_for_review: "bg-status-review",
	in_progress: "bg-status-progress",
	released: "bg-status-complete",
	requires_revision: "bg-status-high",
	on_hold: "bg-status-hold"
};
function StatusLegend() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "rounded-lg border border-border bg-card px-4 py-3 shadow-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
			className: "cursor-pointer text-sm font-medium text-foreground",
			children: "Status legend"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-5 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase",
				children: "ROC release"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-1.5",
				children: ROC_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-2.5 shrink-0 rounded-full ${ROC_SWATCH[status.key]}` }), status.label]
				}, status.key))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase",
				children: "Department cell"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid gap-1.5",
				children: [
					DEPT_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-2.5 shrink-0 rounded-full ${deptDotClass(status.key)}` }), status.label]
					}, status.key)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-5 items-center justify-center rounded-xs bg-status-complete/18 font-bold text-status-complete ring-1 ring-status-complete/30",
							children: "✓"
						}), "All tasks complete"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-5 items-center justify-center rounded-xs bg-status-wait font-mono text-[0.7rem] font-semibold text-white",
							children: "W"
						}), "Waiting on predecessor"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-5 min-w-8 items-center justify-center rounded-xs bg-status-high px-1 font-mono text-[0.5rem] font-semibold tracking-wide text-white",
							children: "LATE"
						}), "Task past due date"]
					})
				]
			})] })]
		})]
	});
}
function Home() {
	const [initialRocs, initialActivity] = Route$4.useLoaderData();
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["rocs"],
		queryFn: () => listRocs(),
		initialData: initialRocs
	});
	const { data: activity } = useQuery({
		queryKey: ["activity"],
		queryFn: () => listActivity(),
		initialData: initialActivity
	});
	const [query, setQuery] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [deptFilter, setDeptFilter] = (0, import_react.useState)("all");
	const navigate = useNavigate();
	const openActions = useOpenTabs((s) => s.openActions);
	const openActivity = useOpenTabs((s) => s.openActivity);
	const filtered = (0, import_react.useMemo)(() => {
		const rows = data ?? [];
		const q = query.trim().toLowerCase();
		return rows.filter((roc) => {
			if (statusFilter === "action") {
				if (!roc.departments.some((d) => isActionRequired(d.status))) return false;
			} else if (statusFilter !== "all" && roc.overall_status !== statusFilter) return false;
			if (deptFilter !== "all") {
				const cell = roc.departments.find((d) => d.department === deptFilter);
				if (!cell || cell.status === "na" || cell.status === "not_started") return false;
			}
			if (!q) return true;
			return `${roc.roc_number} ${roc.title} ${roc.description}`.toLowerCase().includes(q);
		});
	}, [
		data,
		query,
		statusFilter,
		deptFilter
	]);
	const stats = (0, import_react.useMemo)(() => {
		return {
			action: (data ?? []).reduce((sum, r) => sum + r.openActions, 0),
			recent: (activity ?? []).filter((event) => inActivityRange(event.occurred_at, "week")).length
		};
	}, [data, activity]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid max-w-md flex-1 grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Need action",
						value: stats.action,
						onClick: () => {
							openActions();
							navigate({
								to: "/actions",
								search: { sort: "importance" }
							});
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Recent activity",
						value: stats.recent,
						onClick: () => {
							openActivity();
							navigate({
								to: "/activity",
								search: { range: "week" }
							});
						}
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end sm:justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRocDialog, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 lg:flex-row lg:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Search ROC number or title",
							className: "pl-9",
							"aria-label": "Search ROCs"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusFilter,
						onValueChange: setStatusFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "lg:w-52",
							"aria-label": "Filter by status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Status" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "action",
								children: "Action required"
							}),
							ROC_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.key,
								children: s.label
							}, s.key))
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: deptFilter,
						onValueChange: setDeptFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "lg:w-52",
							"aria-label": "Filter by department",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Department" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All departments"
						}), DEPARTMENTS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: d.key,
							children: d.label
						}, d.key))] })]
					})
				]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full rounded-xl" })]
			}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-6 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Could not load the tracker"
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
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-dashed border-border bg-card/70 px-6 py-16 text-center shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "No ROCs match these filters"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Add a design change to start the tracker, or clear the search."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddRocDialog, {})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackerGrid, { rocs: filtered }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusLegend, {})
		]
	});
}
function Stat({ label, value, onClick }) {
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "font-mono text-xs tracking-widest text-muted-foreground uppercase",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 font-mono text-2xl font-semibold tabular-nums",
		children: value
	})] });
	if (!onClick) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg border border-border bg-card px-4 py-3 shadow-panel",
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-label": `${label}: ${value}. Open list`,
		className: cn("min-h-11 rounded-lg border border-border bg-card px-4 py-3 text-left shadow-panel transition-colors", "hover:border-primary/40 hover:bg-accent"),
		children: body
	});
}
//#endregion
export { Home as component };
