import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as NOTICE_MODES, l as NOTICE_TIMEZONES, p as WEEKDAYS, r as DEPARTMENTS, u as REMIND_OPTIONS, x as formatNoticeSummary, y as formatDate } from "./notice-schedule-CLIK4nXr.mjs";
import { d as LoaderCircle, p as Download, u as Mail, y as ArrowLeft } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as SelectItem, B as exportTrackerStateDocx, C as TabsContent, D as Button, G as listDepartmentContacts, H as getNoticeSettings, I as cn, J as listTrackerStates, M as SelectValue, O as Select, Q as sendLateNotices, S as Tabs, T as TabsTrigger, X as saveDepartmentContacts, Y as restoreTrackerState, Z as saveNoticeSettings, c as Label, d as DialogDescription, f as DialogFooter, j as SelectTrigger, k as SelectContent, l as Dialog, m as DialogTitle, nt as useOpenTabs, p as DialogHeader, r as Route$1, u as DialogContent, w as TabsList } from "./router-MkaizW1V.mjs";
import { t as Skeleton } from "./skeleton-BSVtkruh.mjs";
import { n as downloadBase64, t as Input } from "./input-lZCACGe0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BU7MXm2l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TeamContacts({ initial }) {
	const queryClient = useQueryClient();
	const [rows, setRows] = (0, import_react.useState)(initial);
	(0, import_react.useEffect)(() => {
		setRows(initial);
	}, [initial]);
	const save = useMutation({
		mutationFn: () => saveDepartmentContacts({ data: rows }),
		onSuccess: async (result) => {
			await queryClient.invalidateQueries({ queryKey: ["department-contacts"] });
			toast.success("Team contacts saved");
			if (result.noticesSent) toast.success(result.noticesSent === 1 ? "Late-task notice emailed" : `${result.noticesSent} late-task notices emailed`);
			else if (result.noticeError) toast.error(result.noticeError);
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not save contacts");
		}
	});
	function patch(department, field, value) {
		setRows((current) => current.map((row) => row.department === department ? {
			...row,
			[field]: value
		} : row));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-4",
		onSubmit: (event) => {
			event.preventDefault();
			save.mutate();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap items-center justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				disabled: save.isPending,
				className: "min-h-11",
				children: [save.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save contacts"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3",
			children: DEPARTMENTS.map((dept) => {
				const row = rows.find((item) => item.department === dept.key) ?? {
					department: dept.key,
					contact_name: "",
					email: "",
					phone: "",
					role: ""
				};
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-lg border border-border bg-card p-4 shadow-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: dept.label
						}), row.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `mailto:${row.email}`,
							className: "inline-flex items-center gap-1 text-xs text-primary no-underline hover:underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5" }), row.email]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase",
							children: dept.short
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `${dept.key}-name`,
								label: "Contact",
								value: row.contact_name,
								placeholder: "Name",
								onChange: (value) => patch(dept.key, "contact_name", value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `${dept.key}-role`,
								label: "Role",
								value: row.role,
								placeholder: "Department manager",
								onChange: (value) => patch(dept.key, "role", value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `${dept.key}-email`,
								label: "Email",
								type: "email",
								value: row.email,
								placeholder: "name@company.com",
								onChange: (value) => patch(dept.key, "email", value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								id: `${dept.key}-phone`,
								label: "Phone",
								type: "tel",
								value: row.phone,
								placeholder: "Ext. or mobile",
								onChange: (value) => patch(dept.key, "phone", value)
							})
						]
					})]
				}, dept.key);
			})
		})]
	});
}
function Field({ id, label, value, placeholder, type = "text", onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: id,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id,
			type,
			value,
			placeholder,
			onChange: (event) => onChange(event.target.value),
			autoComplete: "off"
		})]
	});
}
function toastLateResult(result, emptyMessage) {
	if (result.noticesSent) toast.success(result.noticesSent === 1 ? "Late-task notice emailed" : `${result.noticesSent} late-task notices emailed`);
	else if (result.noticeError) toast.error(result.noticeError);
	else if (emptyMessage) toast.info(emptyMessage);
}
function NoticeSettingsForm({ initial }) {
	const queryClient = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(initial);
	(0, import_react.useEffect)(() => {
		setForm(initial);
	}, [initial]);
	const save = useMutation({
		mutationFn: () => saveNoticeSettings({ data: form }),
		onSuccess: async (saved) => {
			setForm(saved);
			await queryClient.invalidateQueries({ queryKey: ["notice-settings"] });
			toast.success("Notice schedule saved");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not save schedule");
		}
	});
	const sendNow = useMutation({
		mutationFn: () => sendLateNotices({ data: { force: true } }),
		onSuccess: (result) => {
			toastLateResult(result, "No overdue tasks with an email on file");
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not send notices");
		}
	});
	function setMode(mode) {
		setForm((current) => ({
			...current,
			mode
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-border bg-card p-4 shadow-panel sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 max-w-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Late notices"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: formatNoticeSummary(form)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					disabled: sendNow.isPending || save.isPending,
					className: "min-h-11",
					onClick: () => sendNow.mutate(),
					children: [sendNow.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), "Send overdue notices now"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "mt-4 grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "sr-only",
					children: "When to send late notices"
				}), NOTICE_MODES.map((mode) => {
					const selected = form.mode === mode.key;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: cn("grid cursor-pointer gap-1 rounded-md border px-3 py-3 transition-colors", selected ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background hover:bg-secondary/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "radio",
								name: "notice-mode",
								value: mode.key,
								checked: selected,
								onChange: () => setMode(mode.key),
								className: "size-4 accent-primary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-foreground",
								children: mode.title
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pl-6 text-xs leading-relaxed text-muted-foreground",
							children: mode.body
						})]
					}, mode.key);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					form.mode === "immediate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "remind-every",
							children: "Remind every"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: String(form.remindEveryHours),
							onValueChange: (value) => setForm((current) => ({
								...current,
								remindEveryHours: Number(value)
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "remind-every",
								className: "h-11",
								"aria-label": "Reminder frequency",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: REMIND_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: String(option.hours),
								children: option.label
							}, option.hours)) })]
						})]
					}) : null,
					form.mode === "daily" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "daily-time",
							children: "Send at"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "daily-time",
							type: "time",
							value: form.dailyTime,
							onChange: (event) => setForm((current) => ({
								...current,
								dailyTime: event.target.value
							})),
							className: "h-11"
						})]
					}) : null,
					form.mode === "weekly" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "weekly-day",
							children: "Day"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: String(form.weeklyDay),
							onValueChange: (value) => setForm((current) => ({
								...current,
								weeklyDay: Number(value)
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "weekly-day",
								className: "h-11",
								"aria-label": "Weekday",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: WEEKDAYS.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: String(day.value),
								children: day.label
							}, day.value)) })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "weekly-time",
							children: "Time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "weekly-time",
							type: "time",
							value: form.weeklyTime,
							onChange: (event) => setForm((current) => ({
								...current,
								weeklyTime: event.target.value
							})),
							className: "h-11"
						})]
					})] }) : null,
					form.mode !== "immediate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "notice-tz",
							children: "Time zone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.timezone,
							onValueChange: (value) => setForm((current) => ({
								...current,
								timezone: value
							})),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "notice-tz",
								className: "h-11",
								"aria-label": "Time zone",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: NOTICE_TIMEZONES.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: zone.value,
								children: zone.label
							}, zone.value)) })]
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					disabled: save.isPending,
					className: "min-h-11",
					onClick: () => save.mutate(),
					children: [save.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save notice schedule"]
				})
			})
		]
	});
}
function formatSavedAt(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleString("en-US", {
		hour: "numeric",
		minute: "2-digit"
	});
}
function stateLabel(state) {
	const day = formatDate(state.day);
	return state.isToday ? `Today · ${day}` : day;
}
function RestoreStates({ initial }) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [selectedId, setSelectedId] = (0, import_react.useState)(() => initial[0] ? String(initial[0].id) : "");
	const [confirmRestore, setConfirmRestore] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!initial.length) {
			setSelectedId("");
			return;
		}
		if (!initial.some((state) => String(state.id) === selectedId)) setSelectedId(String(initial[0].id));
	}, [initial, selectedId]);
	const selected = initial.find((state) => String(state.id) === selectedId) ?? initial[0] ?? null;
	const restore = useMutation({
		mutationFn: (id) => restoreTrackerState({ data: { id } }),
		onSuccess: async (state) => {
			setConfirmRestore(false);
			useOpenTabs.setState({ tabs: [] });
			await queryClient.invalidateQueries();
			toast.success(`Restored ${formatDate(state.day)}`);
			navigate({ to: "/" });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not restore.");
		}
	});
	const download = useMutation({
		mutationFn: (id) => exportTrackerStateDocx({ data: { id } }),
		onSuccess: (file) => {
			downloadBase64(file.filename, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", file.base64);
			toast.success(`Downloaded ${file.filename}`);
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not build the Word file.");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Restore archive"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-sm text-muted-foreground",
				children: "A snapshot is saved each day this tracker is in use. Download the Word file for a readable copy you can open in Microsoft Word and rebuild by hand if needed. Restore replaces every ROC, action, file, contact, and notice setting with that day’s copy."
			})] }),
			initial.length === 0 || !selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-dashed border-border bg-card/70 px-6 py-12 text-center shadow-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "No saved states yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Keep the tracker open during the day and a snapshot will appear here."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 rounded-xl border border-border bg-card p-4 shadow-panel sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid max-w-lg gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "restore-date",
							children: "Restore date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedId,
							onValueChange: setSelectedId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "restore-date",
								className: "h-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a date" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: initial.map((state) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: String(state.id),
								children: [stateLabel(state), state.summary ? ` · ${state.summary}` : ""]
							}, state.id)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [selected.summary, selected.captured_at ? ` · last saved ${formatSavedAt(selected.captured_at)}` : null]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						className: "min-h-11",
						disabled: download.isPending,
						onClick: () => download.mutate(selected.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), download.isPending ? "Preparing Word file…" : "Download Word file"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "destructive",
						className: "min-h-11",
						disabled: restore.isPending,
						onClick: () => setConfirmRestore(true),
						children: "Restore tracker to this date"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: confirmRestore,
				onOpenChange: (open) => {
					if (!open && !restore.isPending) setConfirmRestore(false);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
						"Restore ",
						selected ? formatDate(selected.day) : "this state",
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The tracker will match that day’s snapshot — projects, actions, files, contacts, and notice settings. This cannot be undone except by restoring another saved state." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => setConfirmRestore(false),
						disabled: restore.isPending,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "destructive",
						disabled: restore.isPending || !selected,
						onClick: () => {
							if (selected) restore.mutate(selected.id);
						},
						children: restore.isPending ? "Restoring…" : "Restore"
					})] })]
				})
			})
		]
	});
}
function SettingsPage() {
	const initial = Route$1.useLoaderData();
	const contactsQuery = useQuery({
		queryKey: ["department-contacts"],
		queryFn: () => listDepartmentContacts(),
		initialData: initial.contacts
	});
	const noticeQuery = useQuery({
		queryKey: ["notice-settings"],
		queryFn: () => getNoticeSettings(),
		initialData: initial.notice
	});
	const statesQuery = useQuery({
		queryKey: ["tracker-states"],
		queryFn: () => listTrackerStates(),
		initialData: initial.states
	});
	const isLoading = contactsQuery.isLoading || noticeQuery.isLoading || statesQuery.isLoading;
	const isError = contactsQuery.isError || noticeQuery.isError || statesQuery.isError;
	const error = contactsQuery.error ?? noticeQuery.error ?? statesQuery.error;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Tracker"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-xl text-sm text-muted-foreground",
				children: "Late-task notices and a Word restore archive from each day."
			})] }),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" })]
			}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-6 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Could not load settings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: error instanceof Error ? error.message : "Try again."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline",
						onClick: () => {
							contactsQuery.refetch();
							noticeQuery.refetch();
							statesQuery.refetch();
						},
						children: "Retry"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "notifications",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "h-11",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "notifications",
							className: "min-h-11 px-4",
							children: "Notifications"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "restore",
							className: "min-h-11 px-4",
							children: "Restore"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "notifications",
						className: "grid gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeSettingsForm, { initial: noticeQuery.data ?? initial.notice }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold",
								children: "Team contacts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-xl text-sm text-muted-foreground",
								children: "Late-task notices use this email. Several overdue tasks for the same department are always combined into one message."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamContacts, { initial: contactsQuery.data ?? [] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "restore",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestoreStates, { initial: statesQuery.data ?? initial.states })
					})
				]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
