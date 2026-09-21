import { i as getRequest, n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { A as nextRocNumber, C as isDepartmentKey, E as isReminderDue, M as rocStatusLabel, P as zonedClock, T as isDueOverdue, _ as digestPeriodKey, a as DEPT_STATUS_SET, b as formatDateTime, c as NOTICE_MODES, f as ROC_STATUS_SET, g as deptStatusLabel, h as departmentLabel, j as normalizeNoticeSettings, l as NOTICE_TIMEZONES, n as ACTION_STATUSES, o as DOC_KINDS, p as WEEKDAYS, r as DEPARTMENTS, s as ITEM_KINDS, t as ACTION_PRIORITIES, u as REMIND_OPTIONS, w as isDigestSlotOpen, y as formatDate } from "./notice-schedule-CLIK4nXr.mjs";
import { _ as VerticalAlign, a as Footer, c as InternalHyperlink, d as Paragraph, f as ShadingType, g as TextRun, h as TableRow, i as File, l as Packer, m as TableCell, n as Bookmark, o as Header, p as Table, r as BorderStyle, s as HeadingLevel, t as AlignmentType, u as PageNumber, v as WidthType } from "../_libs/docx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CQ4QYI7A.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_roc_tracker_default = "-- ROC design-change tracker (unowned shared rows — no user_id)\ncreate table if not exists app_meta (\n  key   text primary key,\n  value text not null\n);\n\ncreate table if not exists rocs (\n  id                    serial primary key,\n  roc_number            text not null,\n  title                 text not null,\n  description           text not null default '',\n  overall_status        text not null default 'not_started',\n  critical_release_date text,\n  actual_release_date   text,\n  release_description   text not null default '',\n  implementation_notes  text not null default '',\n  additional_notes      text not null default '',\n  affected_projects     text not null default '',\n  created_at            timestamptz not null default now(),\n  updated_at            timestamptz not null default now()\n);\n\ncreate table if not exists roc_meetings (\n  id           serial primary key,\n  roc_id       integer not null references rocs(id) on delete cascade,\n  meeting_date text not null,\n  notes        text not null,\n  created_at   timestamptz not null default now()\n);\n\ncreate table if not exists roc_documents (\n  id             serial primary key,\n  roc_id         integer not null references rocs(id) on delete cascade,\n  title          text not null,\n  kind           text not null,\n  date_required  text,\n  date_completed text,\n  created_at     timestamptz not null default now()\n);\n\ncreate table if not exists roc_attachments (\n  id           serial primary key,\n  roc_id       integer not null references rocs(id) on delete cascade,\n  filename     text not null,\n  mime         text not null default 'application/octet-stream',\n  extract_text text not null default '',\n  created_at   timestamptz not null default now()\n);\n\ncreate table if not exists department_statuses (\n  id         serial primary key,\n  roc_id     integer not null references rocs(id) on delete cascade,\n  department text not null,\n  status     text not null default 'not_started',\n  notes      text not null default '',\n  unique (roc_id, department)\n);\n\ncreate table if not exists action_items (\n  id         serial primary key,\n  roc_id     integer not null references rocs(id) on delete cascade,\n  department text not null,\n  title      text not null,\n  details    text not null default '',\n  priority   text not null default 'low',\n  status     text not null default 'open',\n  posted_as  text not null default 'Engineering',\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists action_updates (\n  id             serial primary key,\n  action_item_id integer not null references action_items(id) on delete cascade,\n  body           text not null,\n  posted_as      text not null default 'Engineering',\n  created_at     timestamptz not null default now()\n);\n\ncreate index if not exists roc_meetings_roc_idx on roc_meetings (roc_id);\ncreate index if not exists roc_documents_roc_idx on roc_documents (roc_id);\ncreate index if not exists roc_attachments_roc_idx on roc_attachments (roc_id);\ncreate index if not exists dept_status_roc_idx on department_statuses (roc_id);\ncreate index if not exists action_items_roc_idx on action_items (roc_id);\ncreate index if not exists action_updates_item_idx on action_updates (action_item_id);\n";
var _0003_action_kind_due_default = "-- Action items can be a dated action or a simple note\nalter table action_items add column if not exists kind text not null default 'action';\nalter table action_items add column if not exists due_date text;\n";
var _0004_predecessor_deadline_default = "-- Successor/predecessor links between action items, plus a project deadline\nalter table action_items add column if not exists predecessor_id integer;\nalter table rocs add column if not exists deadline text;\n";
var _0005_retire_materials_default = "-- Materials (Mat.) is no longer a tracker department. Stock work sits with Purchasing.\nupdate action_items set department = 'purchasing' where department = 'materials';\ndelete from department_statuses where department = 'materials';\n";
var _0006_cnc_retire_floor_depts_default = "-- Programming becomes CNC. Production, Assembly, and Glazing leave the tracker;\n-- remaining shop-floor work sits with Fabrication.\nupdate action_items set department = 'cnc' where department = 'programming';\nupdate action_items\n  set department = 'fabrication'\n  where department in ('production', 'assembly', 'glazing');\n\nupdate department_statuses set department = 'cnc' where department = 'programming';\n\nupdate department_statuses as fab\nset status = asm.status, notes = asm.notes\nfrom department_statuses as asm\nwhere fab.roc_id = asm.roc_id\n  and fab.department = 'fabrication'\n  and asm.department = 'assembly'\n  and fab.status in ('na', 'not_started');\n\ndelete from department_statuses\nwhere department in ('programming', 'production', 'assembly', 'glazing');\n";
var _0007_attachment_content_default = "alter table roc_attachments\n  add column if not exists content_base64 text not null default '';\n";
var _0008_activity_events_default = "create table if not exists activity_events (\n  id serial primary key,\n  occurred_at timestamptz not null default now(),\n  kind text not null,\n  roc_id integer not null references rocs(id) on delete cascade,\n  action_item_id integer references action_items(id) on delete set null,\n  department text,\n  title text not null,\n  details text not null default '',\n  posted_as text not null default 'Engineering'\n);\n\ncreate index if not exists activity_events_occurred_idx on activity_events (occurred_at desc);\ncreate index if not exists activity_events_roc_idx on activity_events (roc_id);\n";
var _0009_department_contacts_default = "create table if not exists department_contacts (\n  department text primary key,\n  contact_name text not null default '',\n  email text not null default '',\n  phone text not null default '',\n  role text not null default '',\n  updated_at timestamptz not null default now()\n);\n";
var _0010_late_notices_default = "create table if not exists late_notices (\n  action_item_id integer primary key references action_items(id) on delete cascade,\n  to_email text not null,\n  sent_at timestamptz not null default now()\n);\n";
var _0011_notice_settings_default = "-- How late-task emails go out: immediately (with optional reminders),\n-- a daily digest, or a weekly digest. One combined email per department.\ncreate table if not exists notice_settings (\n  id integer primary key default 1,\n  mode text not null default 'immediate',\n  remind_every_hours integer not null default 24,\n  daily_time text not null default '17:00',\n  weekly_day integer not null default 1,\n  weekly_time text not null default '09:00',\n  timezone text not null default 'America/New_York',\n  updated_at timestamptz not null default now(),\n  constraint notice_settings_singleton check (id = 1)\n);\n\ninsert into notice_settings (id) values (1) on conflict (id) do nothing;\n\ncreate table if not exists notice_digests (\n  department text not null,\n  period_key text not null,\n  to_email text not null,\n  sent_at timestamptz not null default now(),\n  primary key (department, period_key)\n);\n";
var _0012_roc_number_unique_default = "-- ROC numbers are stable identities. Skip the unique index when duplicates\n-- already exist so a publish cannot fail the whole deploy.\ndo $$\nbegin\n  if exists (\n    select 1 from pg_indexes\n    where schemaname = current_schema()\n      and indexname = 'rocs_roc_number_uidx'\n  ) then\n    return;\n  end if;\n  if exists (\n    select 1 from information_schema.tables\n    where table_schema = current_schema()\n      and table_name = 'rocs'\n  ) and exists (\n    select 1 from rocs group by roc_number having count(*) > 1\n  ) then\n    return;\n  end if;\n  execute 'create unique index if not exists rocs_roc_number_uidx on rocs (roc_number)';\nend\n$$;\n";
var _0013_daily_states_default = "-- End-of-day tracker snapshots for Settings → Restore\ncreate table if not exists tracker_states (\n  id serial primary key,\n  day text not null unique,\n  captured_at timestamptz not null default now(),\n  payload text not null,\n  summary text not null default ''\n);\n";
var _0014_single_project_default = "alter table rocs add column if not exists single_project boolean not null default false;\nalter table rocs add column if not exists project_name text not null default '';\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_roc_tracker.sql": _0002_roc_tracker_default,
			"/migrations/0003_action_kind_due.sql": _0003_action_kind_due_default,
			"/migrations/0004_predecessor_deadline.sql": _0004_predecessor_deadline_default,
			"/migrations/0005_retire_materials.sql": _0005_retire_materials_default,
			"/migrations/0006_cnc_retire_floor_depts.sql": _0006_cnc_retire_floor_depts_default,
			"/migrations/0007_attachment_content.sql": _0007_attachment_content_default,
			"/migrations/0008_activity_events.sql": _0008_activity_events_default,
			"/migrations/0009_department_contacts.sql": _0009_department_contacts_default,
			"/migrations/0010_late_notices.sql": _0010_late_notices_default,
			"/migrations/0011_notice_settings.sql": _0011_notice_settings_default,
			"/migrations/0012_roc_number_unique.sql": _0012_roc_number_unique_default,
			"/migrations/0013_daily_states.sql": _0013_daily_states_default,
			"/migrations/0014_single_project.sql": _0014_single_project_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function na(department) {
	return {
		department,
		status: "na",
		notes: "N/A"
	};
}
function actionDept(department, status, notes) {
	return {
		department,
		status,
		notes
	};
}
var SEED_ROCS = [
	{
		rocNumber: "TBD-001",
		title: "Bulb gasket on F97 / 8560 / 8560HT vent",
		description: "Replace flap gasket 84-199 with 86-403 bulb gasket (and 86-403 CRN) on F97 / 8560 / 8560HT vents. Current flap gasket requires mitre cuts and applied adhesive at corner joints which is difficult to control. The bulb gasket provides a better lineal seal and has pre-made corners for proper adhesion and a continuous seal around corners.",
		overallStatus: "in_progress",
		criticalReleaseDate: null,
		actualReleaseDate: null,
		releaseDescription: "Cannot be completed until release has occurred.",
		implementationNotes: "Change can only occur on new projects entering production. Bulb gasket does not need to be shown on submitted shop drawings but should be updated on the record set. Standard details to be updated and supplied to the drafting team for implementation on current / new projects.",
		additionalNotes: "Flap gasket has been replaced by bulb gasket in PIP documents, but may cause confusion with current production as the change has not yet taken effect. No clear instruction noted regarding delayed implementation / reference by production.",
		affectedProjects: "TBD",
		meetings: [{
			date: "2026-06-24",
			notes: "Discussion occurred with management team during bi-weekly New Products Meeting. Bulb gasket was previously tested internally for air / water / force of operation. Air leakage reduced by 40%. No water leakage identified. Force of operation improved (15% reduction)."
		}, {
			date: "2026-07-22",
			notes: "Discussion occurred with management team during bi-weekly New Products Meeting. Determined that changeover will need to occur on new projects entering production only, due to potential risk of the change being identified mid-project on site / needing to replace flap gasket with bulb gasket on lower levels if the change was identified."
		}],
		documents: [
			{
				title: "Master Excel File — Design",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "ROC Sketch",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "Vent Department Training — Gasket Usage",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "PIP 1.02.09 — 8560/F97 Std & HT Gen Vent Info",
				kind: "released",
				dateRequired: null,
				dateCompleted: "2026-07-21"
			},
			{
				title: "PIP 1.02.10 — 8560/F97 Std & HT Vent Frame",
				kind: "released",
				dateRequired: null,
				dateCompleted: "2026-07-21"
			},
			{
				title: "PIP 1.02.11 — 8560/F97 Std & HT Vent Sash",
				kind: "released",
				dateRequired: null,
				dateCompleted: "2026-07-21"
			}
		],
		departments: [
			na("sales"),
			actionDept("estimating", "low_action", "Part number / pricing update required (only minor difference expected)."),
			na("pre_construction"),
			na("project_management"),
			na("winporte"),
			actionDept("design", "follow_up", "See outstanding documents list."),
			na("engineering"),
			actionDept("drafting", "low_action", "Implement new details on all new / existing projects once supplied by the design team."),
			actionDept("breakdown", "low_action", "All newly generated MTOs are to show 86-403 / 86-403CRN in place of 84-199 related to 8560 / 8560HT vent components."),
			actionDept("scheduling", "high_action", "Identify the next project to enter production / date to enter production."),
			actionDept("purchasing", "low_action", "Need to determine unused 84-199 that will remain in stock after 86-403 changeover, and what to do with remaining stock."),
			na("cnc"),
			actionDept("fabrication", "high_action", "All 8560 series vents entering production after the specified date (supplied by scheduling) receive gasket 86-403 in place of 84-199. Both 84-199 and 86-403 will be used in the vent assembly area simultaneously. Training required."),
			actionDept("quality", "high_action", "Correct gasket usage per project needs to be tracked / enforced."),
			na("installation"),
			actionDept("service", "low_action", "Need to be aware that 86-403 will be required for gasket replacement for vent frames manufactured after the agreed-upon date (supplied by scheduling).")
		],
		actions: [
			{
				department: "estimating",
				title: "Update part number and pricing for 86-403",
				details: "Only a minor difference is expected versus 84-199. Confirm the new part number and pricing are reflected in estimating.",
				priority: "low",
				status: "open",
				dueDate: "2026-09-15",
				postedAs: "Engineering"
			},
			{
				department: "design",
				title: "Close outstanding design documents",
				details: "Master Excel File — Design, ROC Sketch, and Vent Department Training still outstanding. PIPs 1.02.09 / 1.02.10 / 1.02.11 were released 21 Jul 2026.",
				priority: "high",
				status: "in_progress",
				dueDate: "2026-09-05",
				postedAs: "Design",
				updates: [{
					body: "PIP documents updated to show bulb gasket. Remaining risk: production may follow the PIP before the agreed changeover date.",
					postedAs: "Design"
				}]
			},
			{
				department: "design",
				title: "24 Jun New Products Meeting: bulb gasket previously tested internally. Air leakage down 40%, no water leakage, force of operation improved 15%.",
				details: "",
				kind: "note",
				priority: "low",
				status: "open",
				postedAs: "Design"
			},
			{
				department: "drafting",
				title: "Implement new gasket details on projects",
				details: "Once design supplies updated standard details, apply them on all new and existing projects. Shop drawings do not need to show the bulb gasket; record sets should.",
				priority: "low",
				status: "open",
				postedAs: "Drafting"
			},
			{
				department: "breakdown",
				title: "Show 86-403 / 86-403CRN on new MTOs",
				details: "All newly generated MTOs related to 8560 / 8560HT vent components should list 86-403 / 86-403CRN in place of 84-199.",
				priority: "low",
				status: "open",
				postedAs: "Breakdown"
			},
			{
				department: "scheduling",
				title: "Name the first production project for changeover",
				details: "Change can only occur on new projects entering production. Identify the next project and date so assembly, quality, and service can plan dual-gasket usage.",
				priority: "high",
				status: "follow_up",
				dueDate: "2026-08-20",
				postedAs: "Engineering",
				updates: [{
					body: "Waiting on scheduling to confirm the first job that should receive 86-403. Until then assembly cannot freeze the 84-199 list.",
					postedAs: "Fabrication"
				}]
			},
			{
				department: "purchasing",
				title: "Estimate leftover 84-199 after changeover",
				details: "Work with estimating to determine unused 84-199 that will remain in stock after the 86-403 changeover.",
				priority: "low",
				status: "open",
				postedAs: "Purchasing"
			},
			{
				department: "purchasing",
				title: "Disposition remaining 84-199 stock",
				details: "Decide what happens to remaining 84-199 once 86-403 is the production gasket.",
				priority: "low",
				status: "open",
				postedAs: "Purchasing"
			},
			{
				department: "fabrication",
				title: "Train vent assembly on dual gasket usage",
				details: "After the scheduling date, 8560 series vents receive 86-403 instead of 84-199. Both gaskets will be used simultaneously. Build the list of ongoing projects that still receive 84-199 and display it in the vent department.",
				priority: "high",
				status: "open",
				dueDate: "2026-09-12",
				postedAs: "Engineering"
			},
			{
				department: "fabrication",
				title: "22 Jul: changeover on new projects entering production only — avoid mixed gasket on the same site if the change is identified mid-project.",
				details: "",
				kind: "note",
				priority: "low",
				status: "open",
				postedAs: "Fabrication"
			},
			{
				department: "quality",
				title: "Track and enforce correct gasket per project",
				details: "Incorrect gasket usage is a live risk during the dual-gasket window. Need a project-level check in the vent department.",
				priority: "high",
				status: "open",
				postedAs: "Quality"
			},
			{
				department: "service",
				title: "Use 86-403 for replacements after changeover",
				details: "Gasket replacement on vent frames manufactured after the agreed-upon date must use 86-403, not 84-199.",
				priority: "low",
				status: "open",
				postedAs: "Service"
			}
		]
	},
	{
		rocNumber: "TBD-002",
		title: "F97 / 8560 / 8560HT vent frame spacer fit",
		description: "85-401 (Std) and 85-406 (HT) have fit issues during installation in the vent department. The part was designed to snap into the vent frame but the fit is too tight. New dies generated: 85-401 replaced by 85-408, 85-406 replaced by 85-409.",
		overallStatus: "in_progress",
		criticalReleaseDate: null,
		actualReleaseDate: null,
		releaseDescription: "Cannot be completed until release has occurred.",
		implementationNotes: "TBD — changeover will occur mid-project.",
		additionalNotes: "Parts have been replaced in the PIP documents, but may cause confusion with current production as the change has not yet taken effect. No clear instruction noted regarding delayed implementation / reference by production.",
		affectedProjects: "TBD",
		meetings: [
			{
				date: "2026-05-06",
				notes: "No record of discussion. Date taken from the Date Added column of the Quality Meeting Tracker. Notes between 6 May and 6 Aug were taken from that tracker."
			},
			{
				date: "2026-05-21",
				notes: "Possibility of using lubricants was discussed between design / quality, but health and safety concerns prevented the idea from proceeding."
			},
			{
				date: "2026-06-16",
				notes: "New dies have been generated. 85-401 to be replaced by 85-408 / 85-406 to be replaced by 85-409."
			},
			{
				date: "2026-06-25",
				notes: "Instructions were updated to show the new part design."
			},
			{
				date: "2026-08-06",
				notes: "Verification required for Winporte implementation."
			}
		],
		documents: [
			{
				title: "Master EX Listing",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "ROC Sketch",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "Winporte Updates",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "Master Excel File — Design",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "Machining Diagrams",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "Vent Department Training",
				kind: "outstanding",
				dateRequired: null,
				dateCompleted: null
			},
			{
				title: "PIP 1.02.09 — 8560/F97 Std & HT Gen Vent Info",
				kind: "released",
				dateRequired: null,
				dateCompleted: "2026-07-21"
			},
			{
				title: "PIP 1.02.10 — 8560/F97 Std & HT Vent Frame",
				kind: "released",
				dateRequired: null,
				dateCompleted: "2026-07-21"
			},
			{
				title: "PIP 1.02.11 — 8560/F97 Std & HT Vent Sash",
				kind: "released",
				dateRequired: null,
				dateCompleted: "2026-07-21"
			}
		],
		departments: [
			na("sales"),
			actionDept("estimating", "low_action", "Part numbers to be updated. Pricing does not need to change."),
			na("pre_construction"),
			na("project_management"),
			actionDept("winporte", "follow_up", "Needs to be updated. See notes recorded on 16 Jun 2026 for applicable die numbers."),
			actionDept("design", "high_action", "See outstanding documents list. Master EX list to be modified to show original PVC components are obsolete and to specify which parts they are being replaced by. Verify that new parts have been properly implemented into Winporte."),
			na("engineering"),
			actionDept("drafting", "low_action", "Implement new details on all new / existing projects once supplied by the design team."),
			actionDept("breakdown", "follow_up", "Needs to be aware of the change / implementation plan if Winporte update is delayed."),
			na("scheduling"),
			actionDept("purchasing", "high_action", "New parts to be ordered / old parts to become obsolete. Deplete 84-501 and 84-508 before using 84-509 / 84-510."),
			actionDept("cnc", "high_action", "Modifications required to Head / Jamb / Sill vent perimeter frame assembly. Notch required to allow PVC to slide in from end."),
			actionDept("fabrication", "high_action", "Changeover to new material will occur mid-project."),
			actionDept("quality", "low_action", "Team to be notified of incoming material change. Ensure parts are installed correctly."),
			na("installation"),
			na("service")
		],
		actions: [
			{
				department: "estimating",
				title: "Update spacer part numbers (pricing unchanged)",
				details: "85-401 → 85-408, 85-406 → 85-409. Pricing does not need to change.",
				priority: "low",
				status: "open",
				postedAs: "Estimating"
			},
			{
				department: "winporte",
				title: "Verify Winporte implementation of new dies",
				details: "New dies generated 16 Jun 2026. Verification required as of 6 Aug 2026. Applicable die numbers recorded in the 16 Jun notes.",
				priority: "high",
				status: "follow_up",
				postedAs: "Engineering",
				updates: [{
					body: "Please confirm 85-408 and 85-409 are live in Winporte before breakdown starts using them on MTOs.",
					postedAs: "Breakdown"
				}]
			},
			{
				department: "design",
				title: "Mark original PVC components obsolete on Master EX",
				details: "Specify which parts they are being replaced by. Confirm new parts are properly implemented in Winporte.",
				priority: "high",
				status: "in_progress",
				postedAs: "Design"
			},
			{
				department: "drafting",
				title: "Apply new spacer details once issued",
				details: "Implement new details on all new / existing projects once supplied by the design team.",
				priority: "low",
				status: "open",
				postedAs: "Drafting"
			},
			{
				department: "breakdown",
				title: "Hold MTO change until Winporte is confirmed",
				details: "If the Winporte update is delayed, breakdown still needs a clear implementation plan so MTOs do not mix old and new spacers.",
				priority: "low",
				status: "open",
				postedAs: "Breakdown"
			},
			{
				department: "purchasing",
				title: "Order 85-408 / 85-409 and obsolete old parts",
				details: "New parts to be ordered. 85-401 and 85-406 become obsolete.",
				priority: "high",
				status: "open",
				postedAs: "Purchasing"
			},
			{
				department: "purchasing",
				title: "Deplete 84-501 / 84-508 before 84-509 / 84-510",
				details: "Stock of 84-501 and 84-508 to be depleted prior to usage of 84-509 / 84-510.",
				priority: "low",
				status: "in_progress",
				postedAs: "Purchasing"
			},
			{
				department: "cnc",
				title: "Add end-slide notch to vent perimeter frame",
				details: "Modifications required to Head / Jamb / Sill vent perimeter frame assembly. Notch required to allow PVC to slide in from the end.",
				priority: "high",
				status: "open",
				postedAs: "CNC"
			},
			{
				department: "fabrication",
				title: "Plan mid-project spacer changeover",
				details: "Changeover to the new material will occur mid-project. Coordinate with scheduling, materials, and quality so the floor is not mixing parts without a list.",
				priority: "high",
				status: "open",
				postedAs: "Fabrication"
			},
			{
				department: "quality",
				title: "Notify install team and check fit of new spacers",
				details: "Team to be notified of incoming material change. Ensure parts are installed correctly.",
				priority: "low",
				status: "open",
				postedAs: "Quality"
			}
		]
	},
	{
		rocNumber: "TBD-003",
		title: "Test",
		description: "Demo ROC for the Gantt chart: a handoff chain from Sales through Design, Pre-Construction, Winporte, and Fabrication.",
		overallStatus: "in_progress",
		criticalReleaseDate: null,
		actualReleaseDate: "2026-08-27",
		deadline: "2026-11-06",
		releaseDescription: "",
		implementationNotes: "",
		additionalNotes: "Each task is a successor of the one before it, so the Gantt reads as a staircase across departments.",
		affectedProjects: "",
		meetings: [],
		documents: [],
		departments: [
			actionDept("sales", "in_progress", "Kick off and confirm the change with the customer."),
			na("estimating"),
			actionDept("pre_construction", "in_progress", "Starts after Design issues the last drawing package."),
			na("project_management"),
			actionDept("winporte", "in_progress", "Die / tooling work follows Pre-Construction."),
			actionDept("design", "in_progress", "Three sequential drawing packages."),
			na("engineering"),
			na("drafting"),
			na("breakdown"),
			na("scheduling"),
			na("purchasing"),
			na("cnc"),
			actionDept("fabrication", "in_progress", "Shop implementation after Winporte."),
			na("quality"),
			na("installation"),
			na("service")
		],
		actions: [
			{
				department: "sales",
				title: "Test",
				details: "First activity in the demo chain. Unlocks Sales Test 2.",
				priority: "high",
				status: "open",
				dueDate: "2026-09-02",
				postedAs: "Sales"
			},
			{
				department: "sales",
				title: "Test 2",
				details: "Successor of Test. Hands off to Design.",
				priority: "low",
				status: "open",
				dueDate: "2026-09-08",
				postedAs: "Sales",
				predecessorTitle: "Test"
			},
			{
				department: "design",
				title: "Test 3",
				details: "First Design package. Successor of Sales Test 2.",
				priority: "high",
				status: "open",
				dueDate: "2026-09-14",
				postedAs: "Design",
				predecessorTitle: "Test 2"
			},
			{
				department: "design",
				title: "Test 4",
				details: "Second Design package. Successor of Test 3.",
				priority: "low",
				status: "open",
				dueDate: "2026-09-21",
				postedAs: "Design",
				predecessorTitle: "Test 3"
			},
			{
				department: "design",
				title: "Test 5",
				details: "Last Design package. Unlocks Pre-Construction.",
				priority: "low",
				status: "open",
				dueDate: "2026-09-28",
				postedAs: "Design",
				predecessorTitle: "Test 4"
			},
			{
				department: "pre_construction",
				title: "Test 6",
				details: "Successor of Design Test 5. Hands off to Winporte.",
				priority: "low",
				status: "open",
				dueDate: "2026-10-05",
				postedAs: "Pre-Construction",
				predecessorTitle: "Test 5"
			},
			{
				department: "winporte",
				title: "Test 7",
				details: "Successor of Pre-Construction Test 6. Hands off to Fabrication.",
				priority: "low",
				status: "open",
				dueDate: "2026-10-12",
				postedAs: "Winporte",
				predecessorTitle: "Test 6"
			},
			{
				department: "fabrication",
				title: "Test 8",
				details: "Last activity in the demo chain. Successor of Winporte Test 7.",
				priority: "low",
				status: "open",
				dueDate: "2026-10-19",
				postedAs: "Fabrication",
				predecessorTitle: "Test 7"
			}
		]
	}
];
var SEED_CONTACTS = {
	drafting: {
		contact_name: "Clyde / Justin",
		email: "",
		phone: "",
		role: "Drafting leads"
	},
	breakdown: {
		contact_name: "Manish",
		email: "",
		phone: "",
		role: "Breakdown"
	},
	scheduling: {
		contact_name: "Dimble",
		email: "",
		phone: "",
		role: "Scheduling"
	},
	purchasing: {
		contact_name: "Amit",
		email: "",
		phone: "",
		role: "Purchasing"
	}
};
var STEEL = "1E4A56";
var INK = "1A1814";
var MUTED = "6B6458";
var LINE = "D8D0C0";
var PAPER = "F3EFE6";
var WHITE = "FFFFFF";
var thin = {
	top: {
		style: BorderStyle.SINGLE,
		size: 4,
		color: LINE
	},
	bottom: {
		style: BorderStyle.SINGLE,
		size: 4,
		color: LINE
	},
	left: {
		style: BorderStyle.SINGLE,
		size: 4,
		color: LINE
	},
	right: {
		style: BorderStyle.SINGLE,
		size: 4,
		color: LINE
	}
};
function rowsOf(tables, name) {
	const list = tables[name];
	return Array.isArray(list) ? list : [];
}
function text(value) {
	if (value == null) return "";
	if (value instanceof Date) return value.toISOString();
	return String(value).trim();
}
function display(value, empty = "—") {
	return text(value) || empty;
}
function asId(value) {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? Math.trunc(n) : 0;
}
function asBool$1(value) {
	return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}
function actionStatusLabel(status) {
	return ACTION_STATUSES.find((s) => s.key === status)?.label ?? status;
}
function actionPriorityLabel(priority) {
	return ACTION_PRIORITIES.find((p) => p.key === priority)?.label ?? priority;
}
function itemKindLabel(kind) {
	return ITEM_KINDS.find((k) => k.key === kind)?.label ?? kind;
}
function run(content, opts = {}) {
	return new TextRun({
		text: content,
		font: "Calibri",
		size: opts.size ?? 22,
		bold: opts.bold,
		italics: opts.italics,
		color: opts.color ?? INK
	});
}
function body(textValue) {
	return new Paragraph({
		spacing: { after: 160 },
		children: [run(textValue)]
	});
}
function muted(textValue) {
	return new Paragraph({
		spacing: { after: 160 },
		children: [run(textValue, {
			color: MUTED,
			italics: true
		})]
	});
}
function heading1(id, title) {
	return new Paragraph({
		heading: HeadingLevel.HEADING_1,
		spacing: {
			before: 80,
			after: 200
		},
		children: [new Bookmark({
			id,
			children: [new TextRun({
				text: title,
				font: "Calibri",
				size: 32,
				bold: true,
				color: STEEL
			})]
		})]
	});
}
function heading2(title) {
	return new Paragraph({
		heading: HeadingLevel.HEADING_2,
		spacing: {
			before: 280,
			after: 120
		},
		border: { bottom: {
			style: BorderStyle.SINGLE,
			size: 8,
			color: STEEL,
			space: 4
		} },
		children: [new TextRun({
			text: title,
			font: "Calibri",
			size: 26,
			bold: true,
			color: STEEL
		})]
	});
}
function heading3(title) {
	return new Paragraph({
		heading: HeadingLevel.HEADING_3,
		spacing: {
			before: 200,
			after: 80
		},
		children: [new TextRun({
			text: title,
			font: "Calibri",
			size: 24,
			bold: true,
			color: INK
		})]
	});
}
function cell(content, opts = {}) {
	return new TableCell({
		borders: thin,
		width: {
			size: opts.width ?? 50,
			type: WidthType.PERCENTAGE
		},
		shading: opts.fill ? {
			type: ShadingType.CLEAR,
			fill: opts.fill
		} : void 0,
		verticalAlign: VerticalAlign.CENTER,
		margins: {
			top: 60,
			bottom: 60,
			left: 80,
			right: 80
		},
		children: [new Paragraph({ children: [new TextRun({
			text: content || " ",
			font: "Calibri",
			size: opts.header ? 18 : 20,
			bold: Boolean(opts.bold || opts.header),
			color: opts.color ?? (opts.header ? WHITE : INK)
		})] })]
	});
}
function kvTable(pairs) {
	return new Table({
		width: {
			size: 100,
			type: WidthType.PERCENTAGE
		},
		columnWidths: [2800, 6560],
		rows: pairs.map(([label, value]) => new TableRow({ children: [cell(label, {
			fill: PAPER,
			bold: true,
			width: 30,
			color: MUTED
		}), cell(value, { width: 70 })] }))
	});
}
function gridTable(headers, data) {
	const col = Math.max(1, Math.floor(100 / headers.length));
	return new Table({
		width: {
			size: 100,
			type: WidthType.PERCENTAGE
		},
		rows: [new TableRow({
			tableHeader: true,
			children: headers.map((h) => cell(h, {
				fill: STEEL,
				header: true,
				width: col
			}))
		}), ...data.map((row) => new TableRow({ children: row.map((value) => cell(value, { width: col })) }))]
	});
}
function spacer() {
	return new Paragraph({
		spacing: { after: 200 },
		children: []
	});
}
function pageBreak() {
	return new Paragraph({
		pageBreakBefore: true,
		children: []
	});
}
function tocLink(anchor, label) {
	return new Paragraph({
		spacing: { after: 80 },
		children: [new TextRun({
			text: "  ",
			font: "Calibri",
			size: 22
		}), new InternalHyperlink({
			anchor,
			children: [new TextRun({
				text: label,
				font: "Calibri",
				size: 22,
				color: STEEL,
				underline: {}
			})]
		})]
	});
}
function longText(value, cap = 8e3) {
	const next = text(value);
	if (!next) return "—";
	if (next.length <= cap) return next;
	return `${next.slice(0, cap)}\n\n… (truncated)`;
}
function paragraphsFromMultiline(value) {
	const parts = value.split(/\n+/).map((p) => p.trim()).filter(Boolean);
	if (!parts.length) return [muted("—")];
	return parts.map((part) => body(part));
}
function sortRocs(rocs) {
	return [...rocs].sort((a, b) => text(a.roc_number).localeCompare(text(b.roc_number), void 0, { numeric: true }));
}
function buildCover(meta, rocCount) {
	const captured = meta.capturedAt ? formatDateTime(meta.capturedAt) : formatDate(meta.day);
	return [
		new Paragraph({
			spacing: { after: 80 },
			children: [new TextRun({
				text: "ROC TRACKER",
				font: "Calibri",
				size: 20,
				bold: true,
				color: STEEL,
				characterSpacing: 240
			})]
		}),
		new Paragraph({
			spacing: { after: 80 },
			children: [new TextRun({
				text: "Restore archive",
				font: "Calibri",
				size: 56,
				bold: true,
				color: INK
			})]
		}),
		new Paragraph({
			spacing: { after: 40 },
			children: [new TextRun({
				text: formatDate(meta.day),
				font: "Calibri",
				size: 28,
				color: STEEL
			})]
		}),
		muted(`Captured ${captured}  ·  ${meta.summary || `${rocCount} projects`}`),
		body("This Word file is a complete, readable copy of the tracker on this date. Open it in Microsoft Word. If automated restore is ever unavailable — or the tracker itself has changed — use these pages to re-enter every project, status, date, note, task, dependency, file, and contact by hand."),
		heading2("How to use this file"),
		body("1. Table of contents — jump to a project.  2. Team & notices — contacts and late-email settings.  3. Each project — details, then department notes/status, then that department’s tasks and comments."),
		body("Automated restore still lives in Settings → Restore: pick this date and choose Restore tracker. This document is the durable copy you can keep outside the app.")
	];
}
function buildContacts(tables) {
	const rows = rowsOf(tables, "department_contacts");
	const byDept = new Map(rows.map((row) => [text(row.department), row]));
	const data = DEPARTMENTS.map((dept) => {
		const row = byDept.get(dept.key);
		return [
			dept.label,
			display(row?.contact_name),
			display(row?.role),
			display(row?.email),
			display(row?.phone)
		];
	});
	return [
		heading1("contacts", "Team contacts"),
		muted("Late-task notices use the email on each row."),
		gridTable([
			"Department",
			"Name",
			"Role",
			"Email",
			"Phone"
		], data)
	];
}
function buildNotices(tables) {
	const row = rowsOf(tables, "notice_settings")[0];
	const mode = NOTICE_MODES.find((m) => m.key === text(row?.mode)) ?? NOTICE_MODES[0];
	const remind = REMIND_OPTIONS.find((o) => o.hours === Number(row?.remind_every_hours)) ?? REMIND_OPTIONS.find((o) => o.hours === 24);
	const weekday = WEEKDAYS.find((d) => d.value === Number(row?.weekly_day)) ?? WEEKDAYS[0];
	const zone = NOTICE_TIMEZONES.find((z) => z.value === text(row?.timezone)) ?? NOTICE_TIMEZONES[0];
	return [
		heading1("notices", "Notification settings"),
		spacer(),
		kvTable([
			["Schedule", mode?.title ?? display(row?.mode)],
			["What it does", mode?.body ?? "—"],
			["Reminders", remind?.label ?? display(row?.remind_every_hours)],
			["End of day time", display(row?.daily_time)],
			["Weekly day / time", `${weekday?.label ?? "Monday"}  ${display(row?.weekly_time)}`],
			["Time zone", zone?.label ?? display(row?.timezone)]
		])
	];
}
function rocDetails(roc) {
	const flagged = asBool$1(roc.single_project);
	const pairs = [
		["ROC number", display(roc.roc_number)],
		["Project name", display(roc.title)],
		["Status", rocStatusLabel(text(roc.overall_status) || "not_started")],
		["Start date", formatDate(text(roc.actual_release_date) || null)],
		["Deadline", formatDate(text(roc.deadline) || text(roc.critical_release_date) || null)],
		["Single-project ROC", flagged ? "Yes" : "No"]
	];
	if (flagged) pairs.push(["Applies to project", display(roc.project_name)]);
	const extras = [
		["Release description", roc.release_description],
		["Implementation notes", roc.implementation_notes],
		["Affected projects", roc.affected_projects]
	];
	for (const [label, value] of extras) if (text(value)) pairs.push([label, text(value)]);
	return pairs;
}
function buildAttachments(attachments) {
	if (!attachments.length) return [heading2("Attached files"), muted("No files attached.")];
	const blocks = [heading2("Attached files"), muted("Filenames and extracted text. Binary file contents are not printed here.")];
	for (const file of attachments) {
		blocks.push(heading3(display(file.filename, "Untitled file")));
		blocks.push(kvTable([
			["File name", display(file.filename)],
			["Type", display(file.mime)],
			["Added", formatDateTime(text(file.created_at) || null)]
		]));
		blocks.push(spacer());
		const extract = text(file.extract_text);
		if (extract) {
			blocks.push(new Paragraph({
				spacing: { after: 80 },
				children: [run("Extracted text", {
					bold: true,
					color: MUTED,
					size: 18
				})]
			}));
			blocks.push(...paragraphsFromMultiline(longText(extract)));
		} else blocks.push(muted("No extracted text (binary file)."));
	}
	return blocks;
}
function buildDepartment(deptKey, status, items, updatesByItem, titleById) {
	const notes = text(status?.notes);
	const statusKey = text(status?.status) || "not_started";
	if (!notes && (statusKey === "na" || statusKey === "not_started") && items.length === 0) return [];
	const actions = items.filter((item) => text(item.kind) !== "note");
	const notesItems = items.filter((item) => text(item.kind) === "note");
	const blocks = [
		heading2(departmentLabel(deptKey)),
		spacer(),
		kvTable([["Department status", deptStatusLabel(statusKey)], ["Department notes", notes || "—"]])
	];
	const renderItem = (item, index) => {
		const id = asId(item.id);
		const predId = asId(item.predecessor_id);
		const kind = text(item.kind) || "action";
		const title = display(item.title, kind === "note" ? "Note" : "Untitled task");
		blocks.push(heading3(`${index}.  ${title}`));
		const pairs = [["Type", itemKindLabel(kind)], ["Status", actionStatusLabel(text(item.status) || "open")]];
		if (kind !== "note") {
			pairs.push(["Importance", actionPriorityLabel(text(item.priority) || "low")]);
			pairs.push(["Due date", formatDate(text(item.due_date) || null)]);
		}
		pairs.push(["Posted as", display(item.posted_as)]);
		if (predId) pairs.push(["Depends on", titleById.get(predId) ?? `Task #${predId}`]);
		pairs.push(["Created", formatDateTime(text(item.created_at) || null)]);
		pairs.push(["Updated", formatDateTime(text(item.updated_at) || null)]);
		blocks.push(kvTable(pairs));
		blocks.push(spacer());
		const details = text(item.details);
		if (details) {
			blocks.push(new Paragraph({
				spacing: { after: 80 },
				children: [run("Details", {
					bold: true,
					color: MUTED,
					size: 18
				})]
			}));
			blocks.push(...paragraphsFromMultiline(details));
		}
		const comments = updatesByItem.get(id) ?? [];
		if (comments.length) {
			blocks.push(new Paragraph({
				spacing: {
					before: 80,
					after: 80
				},
				children: [run("Comments", {
					bold: true,
					color: MUTED,
					size: 18
				})]
			}));
			for (const comment of comments) {
				const who = display(comment.posted_as, "Team");
				const when = formatDateTime(text(comment.created_at) || null);
				blocks.push(new Paragraph({
					spacing: { after: 40 },
					children: [run(`${who}  ·  ${when}`, {
						italics: true,
						color: MUTED,
						size: 18
					})]
				}));
				blocks.push(...paragraphsFromMultiline(text(comment.body) || "—"));
			}
		}
	};
	if (actions.length) {
		blocks.push(heading3("Tasks"));
		actions.forEach((item, i) => renderItem(item, i + 1));
	} else blocks.push(muted("No tasks for this department."));
	if (notesItems.length) {
		blocks.push(heading3("Notes"));
		notesItems.forEach((item, i) => renderItem(item, i + 1));
	}
	return blocks;
}
function buildRoc(roc, tables, titleById, updatesByItem) {
	const id = asId(roc.id);
	const number = display(roc.roc_number, `ROC ${id}`);
	const title = display(roc.title, "Untitled");
	const depts = rowsOf(tables, "department_statuses").filter((row) => asId(row.roc_id) === id);
	const deptByKey = new Map(depts.map((row) => [text(row.department), row]));
	const items = rowsOf(tables, "action_items").filter((row) => asId(row.roc_id) === id).sort((a, b) => asId(a.id) - asId(b.id));
	const itemsByDept = /* @__PURE__ */ new Map();
	for (const item of items) {
		const key = text(item.department);
		const list = itemsByDept.get(key) ?? [];
		list.push(item);
		itemsByDept.set(key, list);
	}
	const attachments = rowsOf(tables, "roc_attachments").filter((row) => asId(row.roc_id) === id);
	const meetings = rowsOf(tables, "roc_meetings").filter((row) => asId(row.roc_id) === id);
	const documents = rowsOf(tables, "roc_documents").filter((row) => asId(row.roc_id) === id);
	const blocks = [
		pageBreak(),
		heading1(`roc-${id}`, `${number}  —  ${title}`),
		heading2("Project details"),
		spacer(),
		kvTable(rocDetails(roc)),
		spacer(),
		heading3("Description"),
		...paragraphsFromMultiline(longText(roc.description)),
		heading3("Additional notes"),
		...paragraphsFromMultiline(longText(roc.additional_notes)),
		...buildAttachments(attachments)
	];
	if (meetings.length) {
		blocks.push(heading2("Meetings"));
		blocks.push(gridTable(["Date", "Notes"], meetings.map((row) => [formatDate(text(row.meeting_date) || null), display(row.notes)])));
	}
	if (documents.length) {
		blocks.push(heading2("Documents log"));
		blocks.push(gridTable([
			"Title",
			"Kind",
			"Required",
			"Completed"
		], documents.map((row) => [
			display(row.title),
			display(row.kind),
			formatDate(text(row.date_required) || null),
			formatDate(text(row.date_completed) || null)
		])));
	}
	blocks.push(heading2("Departments"));
	let deptBlocks = 0;
	for (const dept of DEPARTMENTS) {
		const section = buildDepartment(dept.key, deptByKey.get(dept.key), itemsByDept.get(dept.key) ?? [], updatesByItem, titleById);
		if (section.length) {
			deptBlocks += 1;
			blocks.push(...section);
		}
	}
	if (!deptBlocks) blocks.push(muted("No department work recorded on this project."));
	return blocks;
}
async function buildRestoreDocxBase64(tables, meta) {
	const rocs = sortRocs(rowsOf(tables, "rocs"));
	const titleById = /* @__PURE__ */ new Map();
	for (const item of rowsOf(tables, "action_items")) titleById.set(asId(item.id), display(item.title, `Task #${asId(item.id)}`));
	const updatesByItem = /* @__PURE__ */ new Map();
	for (const update of rowsOf(tables, "action_updates")) {
		const id = asId(update.action_item_id);
		const list = updatesByItem.get(id) ?? [];
		list.push(update);
		updatesByItem.set(id, list);
	}
	const toc = [
		heading2("Table of contents"),
		tocLink("contacts", "Team contacts"),
		tocLink("notices", "Notification settings"),
		...rocs.map((roc) => tocLink(`roc-${asId(roc.id)}`, `${display(roc.roc_number)}  ·  ${display(roc.title, "Untitled")}${asBool$1(roc.single_project) ? "  ·  Project" : ""}`))
	];
	const children = [
		...buildCover(meta, rocs.length),
		...toc,
		pageBreak(),
		...buildContacts(tables),
		spacer(),
		...buildNotices(tables)
	];
	for (const roc of rocs) children.push(...buildRoc(roc, tables, titleById, updatesByItem));
	const doc = new File({
		creator: "ROC Tracker",
		title: `ROC Tracker restore — ${formatDate(meta.day)}`,
		description: meta.summary,
		styles: { default: { document: { run: {
			font: "Calibri",
			size: 22,
			color: INK
		} } } },
		sections: [{
			properties: { page: { margin: {
				top: 720,
				bottom: 720,
				left: 720,
				right: 720
			} } },
			headers: { default: new Header({ children: [new Paragraph({
				border: { bottom: {
					style: BorderStyle.SINGLE,
					size: 8,
					color: STEEL,
					space: 6
				} },
				spacing: { after: 200 },
				children: [new TextRun({
					text: "ROC TRACKER  ·  RESTORE ARCHIVE",
					font: "Calibri",
					size: 16,
					bold: true,
					color: STEEL,
					characterSpacing: 80
				}), new TextRun({
					text: `          ${formatDate(meta.day)}`,
					font: "Calibri",
					size: 16,
					color: MUTED
				})]
			})] }) },
			footers: { default: new Footer({ children: [new Paragraph({
				alignment: AlignmentType.RIGHT,
				border: { top: {
					style: BorderStyle.SINGLE,
					size: 6,
					color: LINE,
					space: 6
				} },
				children: [
					new TextRun({
						text: "Keep this file — it is the readable copy of the tracker    ",
						font: "Calibri",
						size: 16,
						color: MUTED,
						italics: true
					}),
					new TextRun({
						children: [PageNumber.CURRENT],
						font: "Calibri",
						size: 16,
						color: STEEL
					}),
					new TextRun({
						text: " / ",
						font: "Calibri",
						size: 16,
						color: MUTED
					}),
					new TextRun({
						children: [PageNumber.TOTAL_PAGES],
						font: "Calibri",
						size: 16,
						color: STEEL
					})
				]
			})] }) },
			children
		}]
	});
	const base64 = await Packer.toBase64String(doc);
	return {
		filename: `ROC-Tracker-Restore-${text(meta.day) || "snapshot"}.docx`,
		base64
	};
}
var ACTION_PRIORITY_SET = new Set(ACTION_PRIORITIES.map((p) => p.key));
var ACTION_STATUS_SET = new Set(ACTION_STATUSES.map((s) => s.key));
var DOC_KIND_SET = new Set(DOC_KINDS.map((d) => d.key));
var ITEM_KIND_SET = /* @__PURE__ */ new Set(["action", "note"]);
function asRocStatus(value) {
	return ROC_STATUS_SET.has(value) ? value : "not_started";
}
function asDeptStatus(value) {
	return DEPT_STATUS_SET.has(value) ? value : "not_started";
}
function asDept(value) {
	if (!isDepartmentKey(value)) throw new Error("Unknown department");
	return value;
}
function asPriority(value) {
	return ACTION_PRIORITY_SET.has(value) ? value : "low";
}
function asActionStatus(value) {
	return ACTION_STATUS_SET.has(value) ? value : "open";
}
function asItemKind(value) {
	return ITEM_KIND_SET.has(value ?? "") && value === "note" ? "note" : "action";
}
function asDueDate(value) {
	if (!value) return null;
	const text = value.trim();
	return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}
function asPredecessorId(value) {
	if (value == null || value === "") return null;
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}
function asBool(value) {
	return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}
function mapRoc(row) {
	return {
		...row,
		overall_status: asRocStatus(row.overall_status),
		critical_release_date: row.critical_release_date || null,
		actual_release_date: row.actual_release_date || null,
		deadline: row.deadline || row.critical_release_date || null,
		single_project: asBool(row.single_project),
		project_name: row.project_name ?? ""
	};
}
var globalSeed = globalThis;
async function ensureSeed() {
	const sql = await getSql();
	await ensureSchema(sql);
	globalSeed.__rocEnsureSeed__ ??= runSeedData(sql).catch((error) => {
		globalSeed.__rocEnsureSeed__ = void 0;
		throw error;
	});
	await globalSeed.__rocEnsureSeed__;
}
async function ensureSchema(sql) {
	await sql.query("alter table roc_attachments add column if not exists content_base64 text not null default ''");
	await sql.query("alter table rocs add column if not exists single_project boolean not null default false");
	await sql.query("alter table rocs add column if not exists project_name text not null default ''");
	await sql.query(`
    create table if not exists activity_events (
      id serial primary key,
      occurred_at timestamptz not null default now(),
      kind text not null,
      roc_id integer not null references rocs(id) on delete cascade,
      action_item_id integer references action_items(id) on delete set null,
      department text,
      title text not null,
      details text not null default '',
      posted_as text not null default 'Engineering'
    )
  `);
	await sql.query("create index if not exists activity_events_occurred_idx on activity_events (occurred_at desc)");
	await sql.query(`
    create table if not exists department_contacts (
      department text primary key,
      contact_name text not null default '',
      email text not null default '',
      phone text not null default '',
      role text not null default '',
      updated_at timestamptz not null default now()
    )
  `);
	await sql.query(`
    create table if not exists late_notices (
      action_item_id integer primary key references action_items(id) on delete cascade,
      to_email text not null,
      sent_at timestamptz not null default now()
    )
  `);
	await sql.query(`
    create table if not exists notice_settings (
      id integer primary key default 1,
      mode text not null default 'immediate',
      remind_every_hours integer not null default 24,
      daily_time text not null default '17:00',
      weekly_day integer not null default 1,
      weekly_time text not null default '09:00',
      timezone text not null default 'America/New_York',
      updated_at timestamptz not null default now(),
      constraint notice_settings_singleton check (id = 1)
    )
  `);
	await sql.query(`
    insert into notice_settings (id) values (1)
    on conflict (id) do nothing
  `);
	await sql.query(`
    create table if not exists notice_digests (
      department text not null,
      period_key text not null,
      to_email text not null,
      sent_at timestamptz not null default now(),
      primary key (department, period_key)
    )
  `);
	await sql.query(`
    create table if not exists tracker_states (
      id serial primary key,
      day text not null unique,
      captured_at timestamptz not null default now(),
      payload text not null,
      summary text not null default ''
    )
  `);
	await sql.query("create index if not exists tracker_states_day_idx on tracker_states (day desc)");
	if (!(await sql.query("select 1 as n from rocs group by roc_number having count(*) > 1 limit 1")).length) await sql.query("create unique index if not exists rocs_roc_number_uidx on rocs (roc_number)");
	await ensureDepartmentContacts(sql);
	await sql.query(`
    insert into late_notices (action_item_id, to_email)
    select i.id, trim(c.email)
    from action_items i
    join department_contacts c on c.department = i.department
    where i.department = 'scheduling'
      and i.title = 'Name the first production project for changeover'
      and trim(c.email) <> ''
    on conflict (action_item_id) do nothing
  `);
}
async function runSeedData(sql) {
	if ((await sql`
    insert into app_meta (key, value) values ('retired_materials', '1')
    on conflict (key) do nothing
    returning key
  `).length) {
		await sql`update action_items set department = 'purchasing' where department = ${"materials"}`;
		await sql`delete from department_statuses where department = ${"materials"}`;
	}
	if ((await sql`
    insert into app_meta (key, value) values ('retired_depts_v2', '1')
    on conflict (key) do nothing
    returning key
  `).length) {
		await sql`update action_items set department = ${"cnc"} where department = ${"programming"}`;
		await sql`update action_items set department = ${"fabrication"} where department in (${"production"}, ${"assembly"}, ${"glazing"})`;
		await sql`update department_statuses set department = ${"cnc"} where department = ${"programming"}`;
		await sql.query(`update department_statuses as fab
       set status = asm.status, notes = asm.notes
       from department_statuses as asm
       where fab.roc_id = asm.roc_id
         and fab.department = 'fabrication'
         and asm.department = 'assembly'
         and fab.status in ('na', 'not_started')`);
		await sql`delete from department_statuses where department in (${"programming"}, ${"production"}, ${"assembly"}, ${"glazing"})`;
	}
	if (!(await sql`
    insert into app_meta (key, value) values ('seeded', '1')
    on conflict (key) do nothing
    returning key
  `).length) {
		await ensureTbd003(sql);
		await backfillActivity(sql);
		return;
	}
	try {
		for (const seed of SEED_ROCS) await insertSeedRoc(sql, seed);
	} catch (error) {
		await sql`delete from app_meta where key = ${"seeded"}`;
		throw error;
	}
	await ensureTbd003(sql);
	await backfillActivity(sql);
}
async function logActivity(sql, event) {
	await sql`
    insert into activity_events (
      kind, roc_id, action_item_id, department, title, details, posted_as
    ) values (
      ${event.kind},
      ${event.rocId},
      ${event.actionItemId ?? null},
      ${event.department ?? null},
      ${event.title},
      ${event.details ?? ""},
      ${event.postedAs?.trim() || "Engineering"}
    )
  `;
}
async function backfillActivity(sql) {
	await sql.query(`
    insert into activity_events (occurred_at, kind, roc_id, title, details, posted_as)
    select r.created_at, 'roc_created', r.id, r.title, r.roc_number, 'Engineering'
    from rocs r
    where not exists (
      select 1 from activity_events e
      where e.roc_id = r.id and e.kind = 'roc_created'
    )
  `);
	await sql.query(`
    insert into activity_events (
      occurred_at, kind, roc_id, action_item_id, department, title, details, posted_as
    )
    select
      i.created_at,
      case when coalesce(i.kind, 'action') = 'note' then 'note_created' else 'action_created' end,
      i.roc_id,
      i.id,
      i.department,
      i.title,
      i.details,
      i.posted_as
    from action_items i
    where not exists (
      select 1 from activity_events e
      where e.action_item_id = i.id and e.kind in ('action_created', 'note_created')
    )
  `);
	await sql.query(`
    insert into activity_events (
      occurred_at, kind, roc_id, action_item_id, department, title, details, posted_as
    )
    select
      i.updated_at,
      'action_completed',
      i.roc_id,
      i.id,
      i.department,
      i.title,
      i.details,
      i.posted_as
    from action_items i
    where i.status = 'complete'
      and not exists (
        select 1 from activity_events e
        where e.action_item_id = i.id and e.kind = 'action_completed'
      )
  `);
	await sql.query(`
    insert into activity_events (
      occurred_at, kind, roc_id, action_item_id, department, title, details, posted_as
    )
    select
      u.created_at,
      'follow_up',
      i.roc_id,
      i.id,
      i.department,
      i.title,
      u.body,
      u.posted_as
    from action_updates u
    join action_items i on i.id = u.action_item_id
    where not exists (
      select 1 from activity_events e
      where e.action_item_id = i.id
        and e.kind = 'follow_up'
        and e.details = u.body
    )
  `);
	await stampSeedActivity(sql);
}
async function stampSeedActivity(sql) {
	if (!(await sql`
    insert into app_meta (key, value) values ('activity_stamp_v1', '1')
    on conflict (key) do nothing
    returning key
  `).length) return;
	const seedNumbers = new Set(SEED_ROCS.map((row) => row.rocNumber));
	const rocs = (await sql`
    select id, roc_number from rocs order by id
  `).filter((row) => seedNumbers.has(row.roc_number));
	if (!rocs.length) return;
	const seedIds = new Set(rocs.map((row) => row.id));
	const events = await sql`
    select id, roc_id from activity_events order by roc_id, id
  `;
	const rocIndex = new Map(rocs.map((row, index) => [row.id, index]));
	const seq = /* @__PURE__ */ new Map();
	const now = Date.now();
	const dayOffsets = rocs.length === 3 ? [
		18,
		4,
		0
	] : rocs.map((_, index) => Math.max(0, (rocs.length - 1 - index) * 6));
	try {
		for (const event of events) {
			if (!seedIds.has(event.roc_id)) continue;
			const rocPos = rocIndex.get(event.roc_id) ?? 0;
			const n = seq.get(event.roc_id) ?? 0;
			seq.set(event.roc_id, n + 1);
			const daysAgo = dayOffsets[rocPos] ?? 0;
			await sql`
        update activity_events set occurred_at = ${(/* @__PURE__ */ new Date(now - daysAgo * 864e5 - 18e6 + n * 18 * 6e4)).toISOString()} where id = ${event.id}
      `;
		}
	} catch (error) {
		await sql`delete from app_meta where key = ${"activity_stamp_v1"}`;
		throw error;
	}
}
async function ensureTbd003(sql) {
	if (!(await sql`
    insert into app_meta (key, value) values ('seeded_tbd003', '1')
    on conflict (key) do nothing
    returning key
  `).length) return;
	if ((await sql`
    select id from rocs where roc_number = ${"TBD-003"}
  `).length) return;
	const seed = SEED_ROCS.find((row) => row.rocNumber === "TBD-003");
	if (seed) await insertSeedRoc(sql, seed);
}
async function ensureDepartmentContacts(sql) {
	for (const dept of DEPARTMENTS) {
		const seed = SEED_CONTACTS[dept.key];
		await sql`
      insert into department_contacts (department, contact_name, email, phone, role)
      values (
        ${dept.key},
        ${seed?.contact_name ?? ""},
        ${seed?.email ?? ""},
        ${seed?.phone ?? ""},
        ${seed?.role ?? ""}
      )
      on conflict (department) do nothing
    `;
	}
}
async function insertSeedRoc(sql, seed) {
	if ((await sql`
    select id from rocs where roc_number = ${seed.rocNumber} limit 1
  `)[0]) return;
	const rocId = (await sql`
        insert into rocs (
          roc_number, title, description, overall_status,
          critical_release_date, actual_release_date, release_description,
          implementation_notes, additional_notes, affected_projects, deadline
        ) values (
          ${seed.rocNumber}, ${seed.title}, ${seed.description}, ${seed.overallStatus},
          ${seed.criticalReleaseDate}, ${seed.actualReleaseDate}, ${seed.releaseDescription},
          ${seed.implementationNotes}, ${seed.additionalNotes}, ${seed.affectedProjects},
          ${seed.deadline ?? null}
        )
        returning id
      `)[0]?.id;
	if (!rocId) return;
	await logActivity(sql, {
		kind: "roc_created",
		rocId,
		title: seed.title,
		details: seed.rocNumber
	});
	for (const meeting of seed.meetings) await sql`
          insert into roc_meetings (roc_id, meeting_date, notes)
          values (${rocId}, ${meeting.date}, ${meeting.notes})
        `;
	for (const doc of seed.documents) await sql`
          insert into roc_documents (roc_id, title, kind, date_required, date_completed)
          values (${rocId}, ${doc.title}, ${doc.kind}, ${doc.dateRequired}, ${doc.dateCompleted})
        `;
	const deptMap = new Map(seed.departments.map((d) => [d.department, d]));
	for (const dept of DEPARTMENTS) {
		const row = deptMap.get(dept.key);
		await sql`
          insert into department_statuses (roc_id, department, status, notes)
          values (
            ${rocId},
            ${dept.key},
            ${row?.status ?? "not_started"},
            ${row?.notes ?? ""}
          )
        `;
	}
	const idsByTitle = /* @__PURE__ */ new Map();
	for (const action of seed.actions) {
		const actionId = (await sql`
          insert into action_items (
            roc_id, department, title, details, kind, due_date, priority, status, posted_as
          ) values (
            ${rocId}, ${action.department}, ${action.title}, ${action.details},
            ${action.kind ?? "action"}, ${action.dueDate ?? null},
            ${action.priority}, ${action.status}, ${action.postedAs ?? "Engineering"}
          )
          returning id
        `)[0]?.id;
		if (!actionId) continue;
		idsByTitle.set(action.title, actionId);
		await logActivity(sql, {
			kind: (action.kind ?? "action") === "note" ? "note_created" : "action_created",
			rocId,
			actionItemId: actionId,
			department: action.department,
			title: action.title,
			details: action.details,
			postedAs: action.postedAs
		});
		if (action.status === "complete") await logActivity(sql, {
			kind: "action_completed",
			rocId,
			actionItemId: actionId,
			department: action.department,
			title: action.title,
			details: action.details,
			postedAs: action.postedAs
		});
		for (const update of action.updates ?? []) {
			await sql`
            insert into action_updates (action_item_id, body, posted_as)
            values (${actionId}, ${update.body}, ${update.postedAs})
          `;
			await logActivity(sql, {
				kind: "follow_up",
				rocId,
				actionItemId: actionId,
				department: action.department,
				title: action.title,
				details: update.body,
				postedAs: update.postedAs
			});
		}
	}
	for (const action of seed.actions) {
		if (!action.predecessorTitle) continue;
		const id = idsByTitle.get(action.title);
		const pred = idsByTitle.get(action.predecessorTitle);
		if (!id || !pred) continue;
		await sql`
      update action_items set predecessor_id = ${pred} where id = ${id}
    `;
	}
}
function assembleSummaries(rocs, depts, actions) {
	const deptsByRoc = /* @__PURE__ */ new Map();
	for (const d of depts) {
		const list = deptsByRoc.get(d.roc_id) ?? [];
		list.push(d);
		deptsByRoc.set(d.roc_id, list);
	}
	const actionsByRoc = /* @__PURE__ */ new Map();
	for (const a of actions) {
		const list = actionsByRoc.get(a.roc_id) ?? [];
		list.push(a);
		actionsByRoc.set(a.roc_id, list);
	}
	return rocs.map((roc) => {
		const rocDepts = deptsByRoc.get(roc.id) ?? [];
		const rocActions = actionsByRoc.get(roc.id) ?? [];
		const statusById = new Map(rocActions.map((action) => [action.id, action.status]));
		const byDept = new Map(rocDepts.map((d) => [d.department, d]));
		const departments = DEPARTMENTS.map((meta) => {
			const row = byDept.get(meta.key);
			const tasks = rocActions.filter((a) => a.department === meta.key).filter((a) => a.kind !== "note");
			const open = tasks.filter((a) => a.status !== "complete");
			const lateCount = open.filter((a) => isDueOverdue(a.due_date)).length;
			const waiting = open.length > 0 && open.every((action) => {
				const pred = asPredecessorId(action.predecessor_id);
				if (!pred) return false;
				const predStatus = statusById.get(pred);
				return Boolean(predStatus && predStatus !== "complete");
			});
			return {
				department: meta.key,
				status: asDeptStatus(row?.status ?? "not_started"),
				notes: row?.notes ?? "",
				openCount: open.length,
				highOpen: open.filter((a) => a.priority === "high").length,
				lateCount,
				actionCount: tasks.length,
				allComplete: tasks.length > 0 && open.length === 0,
				waiting
			};
		});
		const openActions = rocActions.filter((a) => a.kind !== "note" && a.status !== "complete").length;
		const highOpen = rocActions.filter((a) => a.kind !== "note" && a.status !== "complete" && a.priority === "high").length;
		return {
			...mapRoc(roc),
			departments,
			openActions,
			highOpen
		};
	});
}
var listRocs_createServerFn_handler = createServerRpc({
	id: "24ae18c9d2846592a69e999fe9d9dfff2ab6d0f6039583fd76ee732fb0759d26",
	name: "listRocs",
	filename: "src/lib/roc/api.ts"
}, (opts) => listRocs.__executeServer(opts));
var listRocs = createServerFn({ method: "GET" }).handler(listRocs_createServerFn_handler, async () => {
	await ensureSeed();
	const sql = await getSql();
	return assembleSummaries(await sql`select * from rocs order by id desc`, await sql`select * from department_statuses`, await sql`select id, roc_id, department, priority, status, kind, due_date, predecessor_id from action_items`);
});
var listOpenActions_createServerFn_handler = createServerRpc({
	id: "62c773c4d062c26a7748ac6fba89f806ce09d7023db36a8b6392ad7818d1434e",
	name: "listOpenActions",
	filename: "src/lib/roc/api.ts"
}, (opts) => listOpenActions.__executeServer(opts));
var listOpenActions = createServerFn({ method: "GET" }).handler(listOpenActions_createServerFn_handler, async () => {
	await ensureSeed();
	return (await (await getSql())`
      select
        i.id, i.roc_id, i.department, i.title, i.details, i.kind, i.due_date,
        i.priority, i.status, i.posted_as, i.predecessor_id, i.created_at, i.updated_at,
        r.roc_number, r.title as roc_title,
        p.status as predecessor_status,
        p.title as predecessor_title
      from action_items i
      join rocs r on r.id = i.roc_id
      left join action_items p on p.id = i.predecessor_id
      where coalesce(i.kind, 'action') <> 'note'
        and i.status <> 'complete'
    `).filter((row) => isDepartmentKey(row.department)).map((row) => {
		const predecessorId = asPredecessorId(row.predecessor_id);
		const predecessorStatus = row.predecessor_status ? asActionStatus(row.predecessor_status) : null;
		return {
			id: row.id,
			roc_id: row.roc_id,
			roc_number: row.roc_number,
			roc_title: row.roc_title,
			department: asDept(row.department),
			title: row.title,
			details: row.details,
			kind: asItemKind(row.kind),
			due_date: asDueDate(row.due_date),
			priority: asPriority(row.priority),
			status: asActionStatus(row.status),
			posted_as: row.posted_as,
			predecessor_id: predecessorId,
			blocked: Boolean(predecessorId && predecessorStatus !== "complete"),
			predecessor_title: row.predecessor_title ?? null,
			created_at: row.created_at,
			updated_at: row.updated_at
		};
	});
});
var getRoc_createServerFn_handler = createServerRpc({
	id: "01900cc0009760f719d78a7813dd6c60fdfe6bd35877200ee48c8456d9461b45",
	name: "getRoc",
	filename: "src/lib/roc/api.ts"
}, (opts) => getRoc.__executeServer(opts));
var getRoc = createServerFn({ method: "GET" }).validator((data) => data).handler(getRoc_createServerFn_handler, async ({ data }) => {
	await ensureSeed();
	const sql = await getSql();
	const roc = (await sql`select * from rocs where id = ${data.id}`)[0];
	if (!roc) throw new Error("ROC not found");
	const departments = await sql`
      select * from department_statuses where roc_id = ${data.id}
    `;
	const actionItems = await sql`
      select * from action_items where roc_id = ${data.id} order by
        case when kind = 'note' then 1 when status = 'complete' then 2 else 0 end,
        case when priority = 'high' then 0 else 1 end,
        case when due_date is null or due_date = '' then 1 else 0 end,
        due_date asc,
        id asc
    `;
	const updates = await sql`
      select u.* from action_updates u
      join action_items i on i.id = u.action_item_id
      where i.roc_id = ${data.id}
      order by u.created_at asc, u.id asc
    `;
	const attachments = await sql`
      select
        id, roc_id, filename, mime, extract_text, created_at,
        case when coalesce(content_base64, '') = '' then false else true end as has_content
      from roc_attachments
      where roc_id = ${data.id}
      order by created_at desc, id desc
    `;
	const updatesByItem = /* @__PURE__ */ new Map();
	for (const u of updates) {
		const list = updatesByItem.get(u.action_item_id) ?? [];
		list.push(u);
		updatesByItem.set(u.action_item_id, list);
	}
	const deptByKey = new Map(departments.map((d) => [d.department, d]));
	const orderedDepts = DEPARTMENTS.map((meta) => {
		return deptByKey.get(meta.key) ?? {
			id: 0,
			roc_id: roc.id,
			department: meta.key,
			status: "not_started",
			notes: ""
		};
	}).map((d) => ({
		...d,
		status: asDeptStatus(d.status),
		department: asDept(d.department)
	}));
	const items = actionItems.filter((item) => isDepartmentKey(item.department)).map((item) => ({
		...item,
		department: asDept(item.department),
		kind: asItemKind(item.kind),
		due_date: asDueDate(item.due_date),
		priority: asPriority(item.priority),
		status: asActionStatus(item.status),
		predecessor_id: asPredecessorId(item.predecessor_id),
		updates: updatesByItem.get(item.id) ?? []
	}));
	return {
		roc: mapRoc(roc),
		departments: orderedDepts,
		actionItems: items,
		attachments: attachments.map((row) => ({
			id: row.id,
			roc_id: row.roc_id,
			filename: row.filename,
			mime: row.mime,
			extract_text: row.extract_text,
			created_at: row.created_at,
			has_content: row.has_content === true || row.has_content === "t" || row.has_content === 1 || row.has_content === "1"
		}))
	};
});
var createRoc_createServerFn_handler = createServerRpc({
	id: "3c1c53c526c177623d077bb986579c3ce5d5323176ae24fc5d130746948d53ac",
	name: "createRoc",
	filename: "src/lib/roc/api.ts"
}, (opts) => createRoc.__executeServer(opts));
var createRoc = createServerFn({ method: "POST" }).validator((data) => data).handler(createRoc_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const title = data.title.trim();
	if (!title) throw new Error("Project name is required");
	const numbers = await sql`select roc_number from rocs`;
	const rocNumber = (data.rocNumber ?? "").trim() || nextRocNumber(numbers.map((row) => row.roc_number));
	if (numbers.some((row) => row.roc_number.toLowerCase() === rocNumber.toLowerCase())) throw new Error(`${rocNumber} is already in use`);
	const status = data.overallStatus && ROC_STATUS_SET.has(data.overallStatus) ? data.overallStatus : "not_started";
	const id = (await sql`
      insert into rocs (
        roc_number, title, description, overall_status,
        critical_release_date, actual_release_date, release_description,
        implementation_notes, additional_notes, affected_projects
      ) values (
        ${rocNumber}, ${title}, ${data.description ?? ""}, ${status},
        ${data.criticalReleaseDate || null}, ${data.actualReleaseDate || null},
        ${data.releaseDescription ?? ""}, ${data.implementationNotes ?? ""},
        ${data.additionalNotes ?? ""}, ${data.affectedProjects ?? ""}
      )
      returning id
    `)[0]?.id;
	if (!id) throw new Error("Failed to create ROC");
	for (const dept of DEPARTMENTS) await sql`
        insert into department_statuses (roc_id, department, status, notes)
        values (${id}, ${dept.key}, ${"not_started"}, ${""})
      `;
	if (data.attachment?.filename) {
		const extract = (data.attachment.extractText ?? "").slice(0, 2e4);
		await sql`
        insert into roc_attachments (roc_id, filename, mime, extract_text)
        values (
          ${id},
          ${data.attachment.filename},
          ${data.attachment.mime || "application/octet-stream"},
          ${extract}
        )
      `;
		if (extract && !data.additionalNotes) await sql`
          update rocs set additional_notes = ${extract.slice(0, 4e3)}, updated_at = now()
          where id = ${id}
        `;
	}
	await logActivity(sql, {
		kind: "roc_created",
		rocId: id,
		title,
		details: rocNumber
	});
	return { id };
});
var updateRoc_createServerFn_handler = createServerRpc({
	id: "01595cfe90ff45f57d2e4d31e712a58749d27f8310738acdd229cc46a112394e",
	name: "updateRoc",
	filename: "src/lib/roc/api.ts"
}, (opts) => updateRoc.__executeServer(opts));
var updateRoc = createServerFn({ method: "POST" }).validator((data) => data).handler(updateRoc_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const roc = (await sql`select * from rocs where id = ${data.id}`)[0];
	if (!roc) throw new Error("ROC not found");
	const overall = data.overallStatus && ROC_STATUS_SET.has(data.overallStatus) ? data.overallStatus : roc.overall_status;
	await sql`
      update rocs set
        roc_number = ${data.rocNumber ?? roc.roc_number},
        title = ${data.title ?? roc.title},
        description = ${data.description ?? roc.description},
        overall_status = ${overall},
        critical_release_date = ${data.criticalReleaseDate === void 0 ? roc.critical_release_date : data.criticalReleaseDate},
        actual_release_date = ${data.actualReleaseDate === void 0 ? roc.actual_release_date : data.actualReleaseDate},
        deadline = ${data.deadline === void 0 ? roc.deadline : data.deadline},
        release_description = ${data.releaseDescription ?? roc.release_description},
        implementation_notes = ${data.implementationNotes ?? roc.implementation_notes},
        additional_notes = ${data.additionalNotes ?? roc.additional_notes},
        affected_projects = ${data.affectedProjects ?? roc.affected_projects},
        single_project = ${data.singleProject === void 0 ? asBool(roc.single_project) : data.singleProject},
        project_name = ${data.projectName === void 0 ? roc.project_name ?? "" : data.projectName.trim()},
        updated_at = now()
      where id = ${data.id}
    `;
	return { ok: true };
});
var addMeeting_createServerFn_handler = createServerRpc({
	id: "bd5a7843fbeb3cb22afbb3c26946459826ed90c37ecb260a78a9919ccecc88a5",
	name: "addMeeting",
	filename: "src/lib/roc/api.ts"
}, (opts) => addMeeting.__executeServer(opts));
var addMeeting = createServerFn({ method: "POST" }).validator((data) => data).handler(addMeeting_createServerFn_handler, async ({ data }) => {
	if (!data.notes.trim()) throw new Error("Notes are required");
	return { id: (await (await getSql())`
      insert into roc_meetings (roc_id, meeting_date, notes)
      values (${data.rocId}, ${data.meetingDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}, ${data.notes.trim()})
      returning id
    `)[0].id };
});
var addDocument_createServerFn_handler = createServerRpc({
	id: "a4b38eda3416892281c9cd733bea2f5786fa24623e7b2853633129401a1a2b23",
	name: "addDocument",
	filename: "src/lib/roc/api.ts"
}, (opts) => addDocument.__executeServer(opts));
var addDocument = createServerFn({ method: "POST" }).validator((data) => data).handler(addDocument_createServerFn_handler, async ({ data }) => {
	if (!data.title.trim()) throw new Error("Document title is required");
	const kind = DOC_KIND_SET.has(data.kind) ? data.kind : "outstanding";
	return { id: (await (await getSql())`
      insert into roc_documents (roc_id, title, kind, date_required, date_completed)
      values (
        ${data.rocId}, ${data.title.trim()}, ${kind},
        ${data.dateRequired || null}, ${data.dateCompleted || null}
      )
      returning id
    `)[0].id };
});
var updateDocument_createServerFn_handler = createServerRpc({
	id: "a90666914e2f5d370582f0770c2942ee15fe0838cbe1b2211116fa0a0806460c",
	name: "updateDocument",
	filename: "src/lib/roc/api.ts"
}, (opts) => updateDocument.__executeServer(opts));
var updateDocument = createServerFn({ method: "POST" }).validator((data) => data).handler(updateDocument_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const doc = (await sql`select * from roc_documents where id = ${data.id}`)[0];
	if (!doc) throw new Error("Document not found");
	await sql`
      update roc_documents set
        title = ${data.title ?? doc.title},
        kind = ${data.kind && DOC_KIND_SET.has(data.kind) ? data.kind : doc.kind},
        date_required = ${data.dateRequired === void 0 ? doc.date_required : data.dateRequired},
        date_completed = ${data.dateCompleted === void 0 ? doc.date_completed : data.dateCompleted}
      where id = ${data.id}
    `;
	return { ok: true };
});
var addAttachment_createServerFn_handler = createServerRpc({
	id: "2acb811467fcf0386221db4ca9d8ba5f3ccacba71b31a53ccd47d0292df505dd",
	name: "addAttachment",
	filename: "src/lib/roc/api.ts"
}, (opts) => addAttachment.__executeServer(opts));
var addAttachment = createServerFn({ method: "POST" }).validator((data) => data).handler(addAttachment_createServerFn_handler, async ({ data }) => {
	const filename = data.filename.trim();
	if (!filename) throw new Error("File name is required");
	const content = data.contentBase64 ?? "";
	if (content.length > 9e6) throw new Error("File is too large (6 MB max)");
	return { id: (await (await getSql())`
      insert into roc_attachments (roc_id, filename, mime, extract_text, content_base64)
      values (
        ${data.rocId},
        ${filename},
        ${data.mime || "application/octet-stream"},
        ${(data.extractText ?? "").slice(0, 2e4)},
        ${content}
      )
      returning id
    `)[0].id };
});
var getAttachment_createServerFn_handler = createServerRpc({
	id: "76e8bae5951733008faf7b5fa5082e83b03f98ad1d261745b3ee72a24e04e1cd",
	name: "getAttachment",
	filename: "src/lib/roc/api.ts"
}, (opts) => getAttachment.__executeServer(opts));
var getAttachment = createServerFn({ method: "GET" }).validator((data) => data).handler(getAttachment_createServerFn_handler, async ({ data }) => {
	const row = (await (await getSql())`
        select id, filename, mime, extract_text, content_base64
        from roc_attachments
        where id = ${data.id}
      `)[0];
	if (!row) throw new Error("File not found");
	return {
		id: row.id,
		filename: row.filename,
		mime: row.mime,
		extract_text: row.extract_text,
		content_base64: row.content_base64 ?? ""
	};
});
var deleteAttachment_createServerFn_handler = createServerRpc({
	id: "4b3d21071a52baffec0f62e549812c6378df39a498d340311305e82c2898ba91",
	name: "deleteAttachment",
	filename: "src/lib/roc/api.ts"
}, (opts) => deleteAttachment.__executeServer(opts));
var deleteAttachment = createServerFn({ method: "POST" }).validator((data) => data).handler(deleteAttachment_createServerFn_handler, async ({ data }) => {
	await (await getSql())`delete from roc_attachments where id = ${data.id}`;
	return { ok: true };
});
var setDepartmentStatus_createServerFn_handler = createServerRpc({
	id: "7ae66d3bb73f4c74c89a6e6fd6470177894a56a1820997b18480bb1ac4dce6e8",
	name: "setDepartmentStatus",
	filename: "src/lib/roc/api.ts"
}, (opts) => setDepartmentStatus.__executeServer(opts));
var setDepartmentStatus = createServerFn({ method: "POST" }).validator((data) => data).handler(setDepartmentStatus_createServerFn_handler, async ({ data }) => {
	const department = asDept(data.department);
	const status = asDeptStatus(data.status);
	await (await getSql())`
      insert into department_statuses (roc_id, department, status, notes)
      values (${data.rocId}, ${department}, ${status}, ${data.notes ?? ""})
      on conflict (roc_id, department)
      do update set
        status = excluded.status,
        notes = case
          when ${data.notes ?? ""} = '' then department_statuses.notes
          else excluded.notes
        end
    `;
	return { ok: true };
});
var addActionItem_createServerFn_handler = createServerRpc({
	id: "0b0190b25f7932abfddf1054fc79a192e936b2557b083ae6a18aedfe608d2559",
	name: "addActionItem",
	filename: "src/lib/roc/api.ts"
}, (opts) => addActionItem.__executeServer(opts));
var addActionItem = createServerFn({ method: "POST" }).validator((data) => data).handler(addActionItem_createServerFn_handler, async ({ data }) => {
	if (!data.title.trim()) throw new Error("Title is required");
	const department = asDept(data.department);
	const kind = asItemKind(data.kind);
	const sql = await getSql();
	let predecessorId = kind === "note" ? null : asPredecessorId(data.predecessorId);
	if (predecessorId) {
		if (!(await sql`
        select id from action_items
        where id = ${predecessorId}
          and roc_id = ${data.rocId}
          and coalesce(kind, 'action') <> 'note'
      `)[0]) throw new Error("Predecessor must be an action in this project");
	}
	const rows = await sql`
      insert into action_items (
        roc_id, department, title, details, kind, due_date, priority, status, posted_as, predecessor_id
      ) values (
        ${data.rocId}, ${department}, ${data.title.trim()}, ${data.details ?? ""},
        ${kind}, ${kind === "note" ? null : asDueDate(data.dueDate)},
        ${asPriority(data.priority ?? "low")}, ${asActionStatus(data.status ?? "open")},
        ${data.postedAs?.trim() || "Engineering"}, ${predecessorId}
      )
      returning id
    `;
	if (kind !== "note") {
		const currentStatus = (await sql`
        select * from department_statuses
        where roc_id = ${data.rocId} and department = ${department}
      `)[0]?.status;
		if (currentStatus && currentStatus !== "na" && currentStatus !== "complete") {
			const next = data.priority === "high" ? "high_action" : currentStatus === "not_started" ? "low_action" : currentStatus;
			if (next !== currentStatus) await sql`
            update department_statuses set status = ${next}
            where roc_id = ${data.rocId} and department = ${department}
          `;
		}
	}
	await logActivity(sql, {
		kind: kind === "note" ? "note_created" : "action_created",
		rocId: data.rocId,
		actionItemId: rows[0].id,
		department,
		title: data.title.trim(),
		details: data.details ?? "",
		postedAs: data.postedAs
	});
	const notices = await maybeDispatchLateNotices(sql, {
		kind,
		status: asActionStatus(data.status ?? "open"),
		due_date: kind === "note" ? null : asDueDate(data.dueDate)
	});
	return {
		id: rows[0].id,
		...notices
	};
});
var updateActionItem_createServerFn_handler = createServerRpc({
	id: "5bd227cb6a7f13ec2016a7004e2118ce2aa4b40ba4fc4b72c2b3555c0c7ac739",
	name: "updateActionItem",
	filename: "src/lib/roc/api.ts"
}, (opts) => updateActionItem.__executeServer(opts));
var updateActionItem = createServerFn({ method: "POST" }).validator((data) => data).handler(updateActionItem_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const item = (await sql`select * from action_items where id = ${data.id}`)[0];
	if (!item) throw new Error("Action item not found");
	const kind = data.kind ? asItemKind(data.kind) : asItemKind(item.kind);
	const dueDate = data.dueDate === void 0 ? asDueDate(item.due_date) : kind === "note" ? null : asDueDate(data.dueDate);
	let predecessorId = asPredecessorId(item.predecessor_id);
	if (data.predecessorId !== void 0) {
		predecessorId = asPredecessorId(data.predecessorId);
		if (predecessorId) {
			if (predecessorId === item.id) throw new Error("A task cannot follow itself");
			const siblings = await sql`
          select id, predecessor_id from action_items
          where roc_id = ${item.roc_id} and coalesce(kind, 'action') <> 'note'
        `;
			if (!siblings.find((row) => row.id === predecessorId)) throw new Error("Predecessor must be an action in this project");
			const byId = new Map(siblings.map((row) => [row.id, asPredecessorId(row.predecessor_id)]));
			const seen = /* @__PURE__ */ new Set([item.id]);
			let walk = predecessorId;
			while (walk) {
				if (seen.has(walk)) throw new Error("That sequence would loop");
				seen.add(walk);
				walk = byId.get(walk) ?? null;
			}
		}
	}
	await sql`
      update action_items set
        title = ${data.title ?? item.title},
        details = ${data.details ?? item.details},
        kind = ${kind},
        due_date = ${dueDate},
        priority = ${data.priority ? asPriority(data.priority) : item.priority},
        status = ${data.status ? asActionStatus(data.status) : item.status},
        predecessor_id = ${predecessorId},
        updated_at = now()
      where id = ${data.id}
    `;
	const nextStatus = data.status ? asActionStatus(data.status) : item.status;
	if (nextStatus === "complete" && item.status !== "complete") await logActivity(sql, {
		kind: "action_completed",
		rocId: item.roc_id,
		actionItemId: item.id,
		department: item.department,
		title: data.title ?? item.title,
		details: data.details ?? item.details,
		postedAs: item.posted_as
	});
	else if (item.status === "complete" && nextStatus !== "complete") await logActivity(sql, {
		kind: "action_reopened",
		rocId: item.roc_id,
		actionItemId: item.id,
		department: item.department,
		title: data.title ?? item.title,
		details: data.details ?? item.details,
		postedAs: item.posted_as
	});
	return {
		ok: true,
		...await maybeDispatchLateNotices(sql, {
			kind,
			status: nextStatus,
			due_date: dueDate
		})
	};
});
var addActionUpdate_createServerFn_handler = createServerRpc({
	id: "e7403f6493309a728f2f3d2be44fbdb27cac835092925d06d5023bda8f710d5a",
	name: "addActionUpdate",
	filename: "src/lib/roc/api.ts"
}, (opts) => addActionUpdate.__executeServer(opts));
var addActionUpdate = createServerFn({ method: "POST" }).validator((data) => data).handler(addActionUpdate_createServerFn_handler, async ({ data }) => {
	if (!data.body.trim()) throw new Error("Update cannot be empty");
	const sql = await getSql();
	const rows = await sql`
      insert into action_updates (action_item_id, body, posted_as)
      values (
        ${data.actionItemId},
        ${data.body.trim()},
        ${data.postedAs?.trim() || "Engineering"}
      )
      returning id
    `;
	await sql`
      update action_items set updated_at = now() where id = ${data.actionItemId}
    `;
	const row = (await sql`
      select * from action_items where id = ${data.actionItemId}
    `)[0];
	if (row) await logActivity(sql, {
		kind: "follow_up",
		rocId: row.roc_id,
		actionItemId: row.id,
		department: row.department,
		title: row.title,
		details: data.body.trim(),
		postedAs: data.postedAs
	});
	return { id: rows[0].id };
});
var deleteActionItem_createServerFn_handler = createServerRpc({
	id: "42f962730530e50eda922f82e5064f9fc4a7d8c937ce474866bb307df0688620",
	name: "deleteActionItem",
	filename: "src/lib/roc/api.ts"
}, (opts) => deleteActionItem.__executeServer(opts));
var deleteActionItem = createServerFn({ method: "POST" }).validator((data) => data).handler(deleteActionItem_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	await sql`update action_items set predecessor_id = null where predecessor_id = ${data.id}`;
	await sql`delete from action_items where id = ${data.id}`;
	return { ok: true };
});
var ACTIVITY_KINDS = /* @__PURE__ */ new Set([
	"roc_created",
	"action_created",
	"note_created",
	"action_completed",
	"action_reopened",
	"follow_up"
]);
function asActivityKind(value) {
	return ACTIVITY_KINDS.has(value) ? value : "action_created";
}
function asIso(value) {
	if (!value) return (/* @__PURE__ */ new Date()).toISOString();
	if (value instanceof Date) return value.toISOString();
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}
var listActivity_createServerFn_handler = createServerRpc({
	id: "fcfa140a5ea33a7d9544363357e12d265829efdb72ab0ef955b428d218924f63",
	name: "listActivity",
	filename: "src/lib/roc/api.ts"
}, (opts) => listActivity.__executeServer(opts));
var listActivity = createServerFn({ method: "GET" }).handler(listActivity_createServerFn_handler, async () => {
	await ensureSeed();
	return (await (await getSql())`
      select
        e.id, e.occurred_at, e.kind, e.roc_id, e.action_item_id, e.department,
        e.title, e.details, e.posted_as,
        r.roc_number, r.title as roc_title
      from activity_events e
      join rocs r on r.id = e.roc_id
      order by e.occurred_at desc, e.id desc
      limit 500
    `).map((row) => ({
		id: row.id,
		occurred_at: asIso(row.occurred_at),
		kind: asActivityKind(row.kind),
		roc_id: row.roc_id,
		roc_number: row.roc_number,
		roc_title: row.roc_title,
		action_item_id: row.action_item_id,
		department: row.department && isDepartmentKey(row.department) ? row.department : null,
		title: row.title,
		details: row.details,
		posted_as: row.posted_as
	}));
});
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function mapContact(row) {
	if (!isDepartmentKey(row.department)) return null;
	return {
		department: row.department,
		contact_name: row.contact_name ?? "",
		email: row.email ?? "",
		phone: row.phone ?? "",
		role: row.role ?? ""
	};
}
var listDepartmentContacts_createServerFn_handler = createServerRpc({
	id: "14f20063591989c3c298befe710687ebb603769ec55407e7f04578a9b04da781",
	name: "listDepartmentContacts",
	filename: "src/lib/roc/api.ts"
}, (opts) => listDepartmentContacts.__executeServer(opts));
var listDepartmentContacts = createServerFn({ method: "GET" }).handler(listDepartmentContacts_createServerFn_handler, async () => {
	await ensureSeed();
	const rows = await (await getSql())`select department, contact_name, email, phone, role from department_contacts`;
	const byDept = new Map(rows.map(mapContact).filter((row) => Boolean(row)).map((row) => [row.department, row]));
	return DEPARTMENTS.map((dept) => {
		return byDept.get(dept.key) ?? {
			department: dept.key,
			contact_name: "",
			email: "",
			phone: "",
			role: ""
		};
	});
});
var saveDepartmentContacts_createServerFn_handler = createServerRpc({
	id: "22fd423041c44dcf95f7cdcbf0ea0ed4349a32d738cbad77e9befa81db3ec326",
	name: "saveDepartmentContacts",
	filename: "src/lib/roc/api.ts"
}, (opts) => saveDepartmentContacts.__executeServer(opts));
var saveDepartmentContacts = createServerFn({ method: "POST" }).validator((data) => data).handler(saveDepartmentContacts_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	for (const row of data) {
		const department = asDept(row.department);
		const email = row.email.trim();
		if (email && !EMAIL_RE.test(email)) throw new Error(`Check the email for ${departmentLabel(department)}`);
		await sql`
        insert into department_contacts (
          department, contact_name, email, phone, role, updated_at
        ) values (
          ${department},
          ${row.contact_name.trim()},
          ${email},
          ${row.phone.trim()},
          ${row.role.trim()},
          now()
        )
        on conflict (department) do update set
          contact_name = excluded.contact_name,
          email = excluded.email,
          phone = excluded.phone,
          role = excluded.role,
          updated_at = now()
      `;
	}
	const settings = await loadNoticeSettings(sql);
	if (settings.mode !== "immediate") return {
		ok: true,
		noticesSent: 0,
		queued: 0
	};
	return {
		ok: true,
		...await dispatchLateNotices(sql, {
			force: false,
			settings
		})
	};
});
async function loadNoticeSettings(sql) {
	const row = (await sql`
    select mode, remind_every_hours, daily_time, weekly_day, weekly_time, timezone
    from notice_settings
    where id = 1
  `)[0];
	if (!row) return normalizeNoticeSettings(null);
	return normalizeNoticeSettings({
		mode: row.mode,
		remindEveryHours: Number(row.remind_every_hours),
		dailyTime: row.daily_time,
		weeklyDay: Number(row.weekly_day),
		weeklyTime: row.weekly_time,
		timezone: row.timezone
	});
}
var getNoticeSettings_createServerFn_handler = createServerRpc({
	id: "5fe946ccdfff213010489288ab343f010dc55a573cb749eedcc5ab213f062c40",
	name: "getNoticeSettings",
	filename: "src/lib/roc/api.ts"
}, (opts) => getNoticeSettings.__executeServer(opts));
var getNoticeSettings = createServerFn({ method: "GET" }).handler(getNoticeSettings_createServerFn_handler, async () => {
	await ensureSeed();
	return loadNoticeSettings(await getSql());
});
var saveNoticeSettings_createServerFn_handler = createServerRpc({
	id: "ec7ec9c2583c0d6aa0f3f589c817e98f0e72c42caaa601b89ae31515c23b80bb",
	name: "saveNoticeSettings",
	filename: "src/lib/roc/api.ts"
}, (opts) => saveNoticeSettings.__executeServer(opts));
var saveNoticeSettings = createServerFn({ method: "POST" }).validator((data) => normalizeNoticeSettings(data)).handler(saveNoticeSettings_createServerFn_handler, async ({ data }) => {
	await (await getSql())`
      insert into notice_settings (
        id, mode, remind_every_hours, daily_time, weekly_day, weekly_time, timezone, updated_at
      ) values (
        1,
        ${data.mode},
        ${data.remindEveryHours},
        ${data.dailyTime},
        ${data.weeklyDay},
        ${data.weeklyTime},
        ${data.timezone},
        now()
      )
      on conflict (id) do update set
        mode = excluded.mode,
        remind_every_hours = excluded.remind_every_hours,
        daily_time = excluded.daily_time,
        weekly_day = excluded.weekly_day,
        weekly_time = excluded.weekly_time,
        timezone = excluded.timezone,
        updated_at = now()
    `;
	return data;
});
function isLoopbackHost(host) {
	const h = host.toLowerCase();
	return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1";
}
function publicAppOrigin() {
	try {
		const req = getRequest();
		if (!req) return null;
		const host = (req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || req.headers.get("host") || "").split(":")[0]?.trim();
		if (!host || isLoopbackHost(host)) return null;
		return `${req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "http" ? "http" : "https"}://${host}`;
	} catch {
		return null;
	}
}
function actionItemUrl(origin, rocId, department, itemId) {
	if (!origin || !Number.isFinite(rocId) || !Number.isFinite(itemId) || itemId <= 0) return null;
	return `${origin}/roc/${rocId}?${new URLSearchParams({
		dept: department,
		item: String(itemId)
	}).toString()}`;
}
function lateEmailCopy(tasks, department, kind, origin) {
	const label = departmentLabel(department);
	const name = tasks[0]?.contact_name?.trim();
	const greeting = name ? `Hello ${name},` : `Hello ${label} team,`;
	const lines = tasks.map((task) => {
		const due = formatDate(task.due_date);
		const url = actionItemUrl(origin, Number(task.roc_id), task.department, Number(task.id));
		const head = `• ${task.title}\n  ${task.roc_number} · ${task.roc_title}\n  Due ${due}`;
		return url ? `${head}\n  ${url}` : head;
	});
	const intro = kind === "daily" ? tasks.length === 1 ? `End-of-day reminder — a task assigned to ${label} is past due:` : `End-of-day reminder — ${tasks.length} tasks assigned to ${label} are past due:` : kind === "weekly" ? tasks.length === 1 ? `Weekly reminder — a task assigned to ${label} is past due:` : `Weekly reminder — ${tasks.length} tasks assigned to ${label} are past due:` : kind === "reminder" ? tasks.length === 1 ? `A task assigned to ${label} is still past due:` : `${tasks.length} tasks assigned to ${label} are still past due:` : tasks.length === 1 ? `A task assigned to ${label} is past due:` : `${tasks.length} tasks assigned to ${label} are past due:`;
	const body = [
		greeting,
		"",
		intro,
		"",
		...lines,
		"",
		"Please update the ROC tracker when the work is complete.",
		"",
		"— ROC Tracker"
	].join("\n");
	const items = tasks.map((task) => {
		const due = formatDate(task.due_date);
		const url = actionItemUrl(origin, Number(task.roc_id), task.department, Number(task.id));
		return `<li style="margin:0 0 10px">${url ? `<a href="${escapeHtml(url)}" style="color:#1e4a56;text-decoration:underline"><strong>${escapeHtml(task.title)}</strong></a>` : `<strong>${escapeHtml(task.title)}</strong>`}<br/><span style="color:#6b6458">${escapeHtml(task.roc_number)} · ${escapeHtml(task.roc_title)}<br/>Due ${escapeHtml(due)}</span></li>`;
	}).join("");
	const html = `<div style="font-family:'IBM Plex Sans',system-ui,sans-serif;color:#1a1814;line-height:1.5">
<p>${escapeHtml(greeting)}</p>
<p>${escapeHtml(intro)}</p>
<ul style="padding-left:1.1rem">${items}</ul>
<p>Please update the ROC tracker when the work is complete.</p>
<p style="color:#6b6458">— ROC Tracker</p>
</div>`;
	return {
		subject: kind === "daily" ? `ROC Tracker — end-of-day late tasks for ${label}` : kind === "weekly" ? `ROC Tracker — weekly late tasks for ${label}` : kind === "reminder" ? `ROC Tracker — late task reminder for ${label}` : tasks.length === 1 ? `ROC Tracker — late task for ${label}` : `ROC Tracker — ${tasks.length} late tasks for ${label}`,
		body,
		html
	};
}
function escapeHtml(value) {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function friendlyMailError(raw, loginRequired) {
	if (loginRequired) return "Gmail is not connected, so the late-task email could not send.";
	const text = raw ?? "";
	if (text.includes("missing_connector_token") || text.includes("gate host") || text.includes("x-connector-access-token") || text.includes("cannot resolve gate")) return "Gmail is not connected, so the late-task email could not send.";
	return text || "Could not send the late-task email.";
}
async function sendDepartmentLateEmail(to, subject, body, html) {
	try {
		const { callTool, ConnectorType } = await import("./client.server-C4mOg1qf.mjs");
		const result = await callTool("gmail_send_message", {
			to: [to],
			subject,
			body,
			body_html: html
		}, { connectorType: ConnectorType.Gmail });
		if (result.ok) return { ok: true };
		return {
			ok: false,
			error: friendlyMailError(result.errorMessage, result.loginRequired)
		};
	} catch (error) {
		return {
			ok: false,
			error: friendlyMailError(error instanceof Error ? error.message : void 0)
		};
	}
}
async function dispatchLateNotices(sql, opts = {}) {
	const settings = opts.settings ?? await loadNoticeSettings(sql);
	const force = Boolean(opts.force);
	const origin = publicAppOrigin();
	const due = (await sql`
      select
        i.id, i.title, i.due_date, i.department,
        r.id as roc_id, r.roc_number, r.title as roc_title,
        c.email, c.contact_name,
        n.sent_at as last_sent
      from action_items i
      join rocs r on r.id = i.roc_id
      left join department_contacts c on c.department = i.department
      left join late_notices n on n.action_item_id = i.id
      where coalesce(i.kind, 'action') <> 'note'
        and i.status <> 'complete'
    `).filter((row) => isDepartmentKey(row.department) && isDueOverdue(row.due_date) && EMAIL_RE.test((row.email ?? "").trim()));
	const grouped = /* @__PURE__ */ new Map();
	for (const row of due) {
		const list = grouped.get(row.department) ?? [];
		list.push(row);
		grouped.set(row.department, list);
	}
	let eligible = grouped;
	let copyKind = settings.mode === "daily" || settings.mode === "weekly" ? settings.mode : "immediate";
	if (!force && settings.mode === "immediate") {
		const next = /* @__PURE__ */ new Map();
		let anyReminder = false;
		for (const [department, tasks] of grouped) {
			if (!tasks.some((task) => isReminderDue(task.last_sent, settings.remindEveryHours))) continue;
			if (tasks.some((task) => task.last_sent)) anyReminder = true;
			next.set(department, tasks);
		}
		eligible = next;
		if (anyReminder) copyKind = "reminder";
	} else if (!force && (settings.mode === "daily" || settings.mode === "weekly")) {
		if (!isDigestSlotOpen(settings)) return {
			noticesSent: 0,
			queued: 0
		};
		const period = digestPeriodKey(settings);
		if (!period) return {
			noticesSent: 0,
			queued: 0
		};
		const sent = await sql`
      select department from notice_digests where period_key = ${period}
    `;
		const done = new Set(sent.map((row) => row.department));
		eligible = new Map([...grouped.entries()].filter(([department]) => !done.has(department)));
	}
	let sentCount = 0;
	let error;
	const period = digestPeriodKey(settings);
	for (const [department, tasks] of eligible) {
		const to = tasks[0].email.trim();
		const copy = lateEmailCopy(tasks, department, copyKind, origin);
		const result = await sendDepartmentLateEmail(to, copy.subject, copy.body, copy.html);
		if (!result.ok) {
			error ??= result.error;
			continue;
		}
		for (const task of tasks) await sql`
          insert into late_notices (action_item_id, to_email, sent_at)
          values (${task.id}, ${to}, now())
          on conflict (action_item_id) do update set
            to_email = excluded.to_email,
            sent_at = now()
        `;
		if (period) await sql`
        insert into notice_digests (department, period_key, to_email)
        values (${department}, ${period}, ${to})
        on conflict (department, period_key) do nothing
      `;
		sentCount += 1;
	}
	return {
		noticesSent: sentCount,
		queued: eligible.size,
		...error ? { noticeError: error } : {}
	};
}
async function maybeDispatchLateNotices(sql, item) {
	if (asItemKind(item.kind) === "note") return {
		noticesSent: 0,
		queued: 0
	};
	if (asActionStatus(item.status) === "complete") return {
		noticesSent: 0,
		queued: 0
	};
	if (!isDueOverdue(item.due_date)) return {
		noticesSent: 0,
		queued: 0
	};
	const settings = await loadNoticeSettings(sql);
	if (settings.mode !== "immediate") return {
		noticesSent: 0,
		queued: 0
	};
	return dispatchLateNotices(sql, {
		force: false,
		settings
	});
}
var sendLateNotices_createServerFn_handler = createServerRpc({
	id: "ab5358d1733b31bac24651ee43bff5c28ef54d704ae10c8315ec35f3fa21ca0f",
	name: "sendLateNotices",
	filename: "src/lib/roc/api.ts"
}, (opts) => sendLateNotices.__executeServer(opts));
var sendLateNotices = createServerFn({ method: "POST" }).validator((data) => ({ force: Boolean(data?.force) })).handler(sendLateNotices_createServerFn_handler, async ({ data }) => {
	await ensureSeed();
	return dispatchLateNotices(await getSql(), { force: data.force });
});
var SNAPSHOT_MIN_MS = 18e5;
var SNAPSHOT_TABLES = [
	{
		name: "rocs",
		columns: [
			"id",
			"roc_number",
			"title",
			"description",
			"overall_status",
			"critical_release_date",
			"actual_release_date",
			"release_description",
			"implementation_notes",
			"additional_notes",
			"affected_projects",
			"deadline",
			"single_project",
			"project_name",
			"created_at",
			"updated_at"
		]
	},
	{
		name: "roc_meetings",
		columns: [
			"id",
			"roc_id",
			"meeting_date",
			"notes",
			"created_at"
		]
	},
	{
		name: "roc_documents",
		columns: [
			"id",
			"roc_id",
			"title",
			"kind",
			"date_required",
			"date_completed",
			"created_at"
		]
	},
	{
		name: "roc_attachments",
		columns: [
			"id",
			"roc_id",
			"filename",
			"mime",
			"extract_text",
			"created_at",
			"content_base64"
		]
	},
	{
		name: "department_statuses",
		columns: [
			"id",
			"roc_id",
			"department",
			"status",
			"notes"
		]
	},
	{
		name: "action_items",
		columns: [
			"id",
			"roc_id",
			"department",
			"title",
			"details",
			"kind",
			"due_date",
			"priority",
			"status",
			"posted_as",
			"predecessor_id",
			"created_at",
			"updated_at"
		]
	},
	{
		name: "action_updates",
		columns: [
			"id",
			"action_item_id",
			"body",
			"posted_as",
			"created_at"
		]
	},
	{
		name: "activity_events",
		columns: [
			"id",
			"occurred_at",
			"kind",
			"roc_id",
			"action_item_id",
			"department",
			"title",
			"details",
			"posted_as"
		]
	},
	{
		name: "department_contacts",
		columns: [
			"department",
			"contact_name",
			"email",
			"phone",
			"role",
			"updated_at"
		]
	},
	{
		name: "late_notices",
		columns: [
			"action_item_id",
			"to_email",
			"sent_at"
		]
	},
	{
		name: "notice_settings",
		columns: [
			"id",
			"mode",
			"remind_every_hours",
			"daily_time",
			"weekly_day",
			"weekly_time",
			"timezone",
			"updated_at"
		]
	},
	{
		name: "notice_digests",
		columns: [
			"department",
			"period_key",
			"to_email",
			"sent_at"
		]
	}
];
var SNAPSHOT_SERIALS = [
	"rocs",
	"roc_meetings",
	"roc_documents",
	"roc_attachments",
	"department_statuses",
	"action_items",
	"action_updates",
	"activity_events"
];
var SNAPSHOT_DELETE_ORDER = [
	"action_updates",
	"late_notices",
	"notice_digests",
	"activity_events",
	"action_items",
	"department_statuses",
	"roc_attachments",
	"roc_documents",
	"roc_meetings",
	"rocs",
	"department_contacts",
	"notice_settings"
];
function asIsoStamp(value) {
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
	if (typeof value === "string" && value.trim()) return value;
	return "";
}
function mapStateRow(row, today) {
	return {
		id: Number(row.id),
		day: row.day,
		captured_at: asIsoStamp(row.captured_at),
		summary: row.summary || "",
		isToday: row.day === today
	};
}
async function captureTrackerPayload(sql) {
	const tables = {};
	for (const table of SNAPSHOT_TABLES) tables[table.name] = await sql.query(`select ${table.columns.join(", ")} from ${table.name} order by 1`);
	const rocCount = tables.rocs?.length ?? 0;
	const actionCount = (tables.action_items ?? []).filter((row) => row.kind !== "note").length;
	const summary = `${rocCount} ROC${rocCount === 1 ? "" : "s"} · ${actionCount} action${actionCount === 1 ? "" : "s"}`;
	return {
		payload: JSON.stringify({
			version: 1,
			tables
		}),
		summary
	};
}
async function upsertDailyState(sql) {
	const settings = await loadNoticeSettings(sql);
	const today = zonedClock(settings.timezone).date;
	const existing = await sql`
    select id, captured_at from tracker_states where day = ${today} limit 1
  `;
	if (existing[0]) {
		const last = new Date(existing[0].captured_at).getTime();
		if (Number.isFinite(last) && Date.now() - last < SNAPSHOT_MIN_MS) {
			const row = await sql`
        select id, day, captured_at, summary from tracker_states where id = ${existing[0].id}
      `;
			if (row[0]) return mapStateRow(row[0], today);
		}
	}
	const { payload, summary } = await captureTrackerPayload(sql);
	const saved = await sql`
    insert into tracker_states (day, payload, summary, captured_at)
    values (${today}, ${payload}, ${summary}, now())
    on conflict (day) do update set
      payload = excluded.payload,
      summary = excluded.summary,
      captured_at = now()
    returning id, day, captured_at, summary
  `;
	if (!saved[0]) throw new Error("Could not save today's state.");
	return mapStateRow(saved[0], today);
}
var globalSnap = globalThis;
var saveDailyState_createServerFn_handler = createServerRpc({
	id: "45561b230ac07f84c651eb09d2a6a5b704afbefe3b31752ff305673dc4833868",
	name: "saveDailyState",
	filename: "src/lib/roc/api.ts"
}, (opts) => saveDailyState.__executeServer(opts));
var saveDailyState = createServerFn({ method: "POST" }).handler(saveDailyState_createServerFn_handler, async () => {
	await ensureSeed();
	const sql = await getSql();
	globalSnap.__rocDailyState__ ??= upsertDailyState(sql).finally(() => {
		globalSnap.__rocDailyState__ = void 0;
	});
	return globalSnap.__rocDailyState__;
});
var listTrackerStates_createServerFn_handler = createServerRpc({
	id: "874a1308b3f62ff71ab94ae9b7891aad27fe6deabef8a9078eca5d3308e630dd",
	name: "listTrackerStates",
	filename: "src/lib/roc/api.ts"
}, (opts) => listTrackerStates.__executeServer(opts));
var listTrackerStates = createServerFn({ method: "GET" }).handler(listTrackerStates_createServerFn_handler, async () => {
	await ensureSeed();
	const sql = await getSql();
	await upsertDailyState(sql);
	const settings = await loadNoticeSettings(sql);
	const today = zonedClock(settings.timezone).date;
	return (await sql`
      select id, day, captured_at, summary
      from tracker_states
      order by day desc
    `).map((row) => mapStateRow(row, today));
});
var exportTrackerStateDocx_createServerFn_handler = createServerRpc({
	id: "5bf53f4faa9409f9959d01c07e88310c87a450e9a9d6f88d2fd22d212bb8fa7c",
	name: "exportTrackerStateDocx",
	filename: "src/lib/roc/api.ts"
}, (opts) => exportTrackerStateDocx.__executeServer(opts));
var exportTrackerStateDocx = createServerFn({ method: "GET" }).validator((data) => {
	const id = Math.trunc(Number(data?.id));
	if (!Number.isFinite(id) || id <= 0) throw new Error("Choose a saved state.");
	return { id };
}).handler(exportTrackerStateDocx_createServerFn_handler, async ({ data }) => {
	await ensureSeed();
	const row = (await (await getSql())`
      select day, captured_at, summary, payload
      from tracker_states
      where id = ${data.id}
      limit 1
    `)[0];
	if (!row) throw new Error("That saved state is no longer available.");
	let parsed;
	try {
		parsed = JSON.parse(row.payload);
	} catch {
		throw new Error("That saved state cannot be read.");
	}
	if (parsed.version !== 1 || !parsed.tables || typeof parsed.tables !== "object") throw new Error("That saved state cannot be read.");
	return buildRestoreDocxBase64(parsed.tables, {
		day: row.day,
		capturedAt: asIsoStamp(row.captured_at),
		summary: row.summary || ""
	});
});
function snapshotCell(row, column) {
	const value = row[column];
	if (value === void 0) {
		if (column === "single_project") return false;
		if (column === "project_name") return "";
		return null;
	}
	if (value instanceof Date) return value.toISOString();
	return value;
}
async function insertSnapshotRows(sql, table, rows) {
	if (!Array.isArray(rows) || rows.length === 0) return;
	const placeholders = table.columns.map((_, i) => `$${i + 1}`).join(", ");
	const text = `insert into ${table.name} (${table.columns.join(", ")}) values (${placeholders})`;
	for (const raw of rows) {
		if (!raw || typeof raw !== "object") continue;
		const row = raw;
		await sql.query(text, table.columns.map((column) => snapshotCell(row, column)));
	}
}
async function resetSerial(sql, table) {
	await sql.query(`select setval(
      '${table}_id_seq',
      (select coalesce(max(id), 1) from ${table}),
      (select exists (select 1 from ${table}))
    )`);
}
var restoreTrackerState_createServerFn_handler = createServerRpc({
	id: "e61734259a90ace9bb21a0cb5bda54a47577e6726f540414160a3c5df5d524c8",
	name: "restoreTrackerState",
	filename: "src/lib/roc/api.ts"
}, (opts) => restoreTrackerState.__executeServer(opts));
var restoreTrackerState = createServerFn({ method: "POST" }).validator((data) => {
	const id = Math.trunc(Number(data?.id));
	if (!Number.isFinite(id) || id <= 0) throw new Error("Choose a saved state.");
	return { id };
}).handler(restoreTrackerState_createServerFn_handler, async ({ data }) => {
	await ensureSeed();
	const sql = await getSql();
	const settings = await loadNoticeSettings(sql);
	const today = zonedClock(settings.timezone).date;
	const row = (await sql`
      select id, day, captured_at, summary, payload
      from tracker_states
      where id = ${data.id}
      limit 1
    `)[0];
	if (!row) throw new Error("That saved state is no longer available.");
	let parsed;
	try {
		parsed = JSON.parse(row.payload);
	} catch {
		throw new Error("That saved state cannot be read.");
	}
	if (parsed.version !== 1 || !parsed.tables || typeof parsed.tables !== "object") throw new Error("That saved state cannot be read.");
	const tables = parsed.tables;
	for (const name of SNAPSHOT_DELETE_ORDER) await sql.query(`delete from ${name}`);
	for (const table of SNAPSHOT_TABLES) await insertSnapshotRows(sql, table, tables[table.name]);
	await sql.query("insert into notice_settings (id) values (1) on conflict (id) do nothing");
	await ensureDepartmentContacts(sql);
	for (const table of SNAPSHOT_SERIALS) await resetSerial(sql, table);
	return mapStateRow(row, today);
});
//#endregion
export { addActionItem_createServerFn_handler, addActionUpdate_createServerFn_handler, addAttachment_createServerFn_handler, addDocument_createServerFn_handler, addMeeting_createServerFn_handler, createRoc_createServerFn_handler, deleteActionItem_createServerFn_handler, deleteAttachment_createServerFn_handler, exportTrackerStateDocx_createServerFn_handler, getAttachment_createServerFn_handler, getNoticeSettings_createServerFn_handler, getRoc_createServerFn_handler, listActivity_createServerFn_handler, listDepartmentContacts_createServerFn_handler, listOpenActions_createServerFn_handler, listRocs_createServerFn_handler, listTrackerStates_createServerFn_handler, restoreTrackerState_createServerFn_handler, saveDailyState_createServerFn_handler, saveDepartmentContacts_createServerFn_handler, saveNoticeSettings_createServerFn_handler, sendLateNotices_createServerFn_handler, setDepartmentStatus_createServerFn_handler, updateActionItem_createServerFn_handler, updateDocument_createServerFn_handler, updateRoc_createServerFn_handler };
