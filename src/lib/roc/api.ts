import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import {
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  DEPT_STATUS_SET,
  DEPARTMENTS,
  DOC_KINDS,
  ROC_STATUS_SET,
  isDepartmentKey,
  departmentLabel,
  type ActionPriority,
  type ActionStatus,
  type DepartmentKey,
  type DeptStatusKey,
  type DocKind,
  type ItemKind,
  type RocStatus,
} from "./constants";
import { SEED_CONTACTS, SEED_ROCS } from "./seed";
import { isDueOverdue, formatDate, nextRocNumber } from "./format";
import { buildRestoreDocxBase64 } from "./restore-docx";
import {
  digestPeriodKey,
  isDigestSlotOpen,
  isReminderDue,
  normalizeNoticeSettings,
  zonedClock,
  type NoticeSettings,
} from "./notice-schedule";
import type {
  ActionItemRow,
  ActionItemWithUpdates,
  ActionUpdateRow,
  ActivityEvent,
  ActivityKind,
  AttachmentRow,
  CreateRocInput,
  DepartmentContact,
  DepartmentStatusRow,
  DeptCell,
  DocumentRow,
  MeetingRow,
  OpenActionItem,
  RocDetail,
  RocRow,
  RocSummary,
} from "./types";

type SqlClient = Awaited<ReturnType<typeof getSql>>;

const ACTION_PRIORITY_SET = new Set<string>(ACTION_PRIORITIES.map((p) => p.key));
const ACTION_STATUS_SET = new Set<string>(ACTION_STATUSES.map((s) => s.key));
const DOC_KIND_SET = new Set<string>(DOC_KINDS.map((d) => d.key));
const ITEM_KIND_SET = new Set<string>(["action", "note"]);

function asRocStatus(value: string): RocStatus {
  return (ROC_STATUS_SET.has(value) ? value : "not_started") as RocStatus;
}

function asDeptStatus(value: string): DeptStatusKey {
  return (DEPT_STATUS_SET.has(value) ? value : "not_started") as DeptStatusKey;
}

function asDept(value: string): DepartmentKey {
  if (!isDepartmentKey(value)) throw new Error("Unknown department");
  return value;
}

function asPriority(value: string): ActionPriority {
  return (ACTION_PRIORITY_SET.has(value) ? value : "low") as ActionPriority;
}

function asActionStatus(value: string): ActionStatus {
  return (ACTION_STATUS_SET.has(value) ? value : "open") as ActionStatus;
}

function asItemKind(value: string | null | undefined): ItemKind {
  return ITEM_KIND_SET.has(value ?? "") && value === "note" ? "note" : "action";
}

function asDueDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function asPredecessorId(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

function mapRoc(row: RocRow): RocRow {
  return {
    ...row,
    overall_status: asRocStatus(row.overall_status),
    critical_release_date: row.critical_release_date || null,
    actual_release_date: row.actual_release_date || null,
    deadline: row.deadline || row.critical_release_date || null,
    single_project: asBool(row.single_project),
    project_name: row.project_name ?? "",
  };
}

const globalSeed = globalThis as typeof globalThis & {
  __rocEnsureSeed__?: Promise<void>;
};

async function ensureSeed() {
  const sql = await getSql();
  await ensureSchema(sql);
  globalSeed.__rocEnsureSeed__ ??= runSeedData(sql).catch((error) => {
    globalSeed.__rocEnsureSeed__ = undefined;
    throw error;
  });
  await globalSeed.__rocEnsureSeed__;
}

async function ensureSchema(sql: SqlClient) {
  await sql.query(
    "alter table roc_attachments add column if not exists content_base64 text not null default ''",
  );
  await sql.query(
    "alter table rocs add column if not exists single_project boolean not null default false",
  );
  await sql.query(
    "alter table rocs add column if not exists project_name text not null default ''",
  );
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
  await sql.query(
    "create index if not exists activity_events_occurred_idx on activity_events (occurred_at desc)",
  );
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
  await sql.query(
    "create index if not exists tracker_states_day_idx on tracker_states (day desc)",
  );
  const dupes = await sql.query<{ n: number }>(
    "select 1 as n from rocs group by roc_number having count(*) > 1 limit 1",
  );
  if (!dupes.length) {
    await sql.query(
      "create unique index if not exists rocs_roc_number_uidx on rocs (roc_number)",
    );
  }
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

async function runSeedData(sql: SqlClient) {
  const retired = await sql<{ key: string }>`
    insert into app_meta (key, value) values ('retired_materials', '1')
    on conflict (key) do nothing
    returning key
  `;
  if (retired.length) {
    await sql`update action_items set department = 'purchasing' where department = ${"materials"}`;
    await sql`delete from department_statuses where department = ${"materials"}`;
  }

  const retiredV2 = await sql<{ key: string }>`
    insert into app_meta (key, value) values ('retired_depts_v2', '1')
    on conflict (key) do nothing
    returning key
  `;
  if (retiredV2.length) {
    await sql`update action_items set department = ${"cnc"} where department = ${"programming"}`;
    await sql`update action_items set department = ${"fabrication"} where department in (${"production"}, ${"assembly"}, ${"glazing"})`;
    await sql`update department_statuses set department = ${"cnc"} where department = ${"programming"}`;
    await sql.query(
      `update department_statuses as fab
       set status = asm.status, notes = asm.notes
       from department_statuses as asm
       where fab.roc_id = asm.roc_id
         and fab.department = 'fabrication'
         and asm.department = 'assembly'
         and fab.status in ('na', 'not_started')`,
    );
    await sql`delete from department_statuses where department in (${"programming"}, ${"production"}, ${"assembly"}, ${"glazing"})`;
  }

  const claimed = await sql<{ key: string }>`
    insert into app_meta (key, value) values ('seeded', '1')
    on conflict (key) do nothing
    returning key
  `;
  if (!claimed.length) {
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

async function logActivity(
  sql: SqlClient,
  event: {
    kind: ActivityKind;
    rocId: number;
    actionItemId?: number | null;
    department?: string | null;
    title: string;
    details?: string;
    postedAs?: string;
  },
) {
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

async function backfillActivity(sql: SqlClient) {
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

async function stampSeedActivity(sql: SqlClient) {
  const claimed = await sql<{ key: string }>`
    insert into app_meta (key, value) values ('activity_stamp_v1', '1')
    on conflict (key) do nothing
    returning key
  `;
  if (!claimed.length) return;
  const seedNumbers = new Set(SEED_ROCS.map((row) => row.rocNumber));
  const allRocs = await sql<{ id: number; roc_number: string }>`
    select id, roc_number from rocs order by id
  `;
  const rocs = allRocs.filter((row) => seedNumbers.has(row.roc_number));
  if (!rocs.length) return;
  const seedIds = new Set(rocs.map((row) => row.id));
  const events = await sql<{ id: number; roc_id: number }>`
    select id, roc_id from activity_events order by roc_id, id
  `;
  const rocIndex = new Map(rocs.map((row, index) => [row.id, index]));
  const seq = new Map<number, number>();
  const now = Date.now();
  const dayOffsets =
    rocs.length === 3
      ? [18, 4, 0]
      : rocs.map((_, index) => Math.max(0, (rocs.length - 1 - index) * 6));
  try {
    for (const event of events) {
      if (!seedIds.has(event.roc_id)) continue;
      const rocPos = rocIndex.get(event.roc_id) ?? 0;
      const n = seq.get(event.roc_id) ?? 0;
      seq.set(event.roc_id, n + 1);
      const daysAgo = dayOffsets[rocPos] ?? 0;
      await sql`
        update activity_events set occurred_at = ${new Date(
          now - daysAgo * 86_400_000 - 18_000_000 + n * 18 * 60_000,
        ).toISOString()} where id = ${event.id}
      `;
    }
  } catch (error) {
    await sql`delete from app_meta where key = ${"activity_stamp_v1"}`;
    throw error;
  }
}

async function ensureTbd003(sql: SqlClient) {
  const claimed = await sql<{ key: string }>`
    insert into app_meta (key, value) values ('seeded_tbd003', '1')
    on conflict (key) do nothing
    returning key
  `;
  if (!claimed.length) return;
  const existing = await sql<{ id: number }>`
    select id from rocs where roc_number = ${"TBD-003"}
  `;
  if (existing.length) return;
  const seed = SEED_ROCS.find((row) => row.rocNumber === "TBD-003");
  if (seed) await insertSeedRoc(sql, seed);
}

async function ensureDepartmentContacts(sql: SqlClient) {
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

async function insertSeedRoc(sql: SqlClient, seed: (typeof SEED_ROCS)[number]) {
  const existing = await sql<{ id: number }>`
    select id from rocs where roc_number = ${seed.rocNumber} limit 1
  `;
  if (existing[0]) return;

  const inserted = await sql<{ id: number }>`
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
      `;
  const rocId = inserted[0]?.id;
  if (!rocId) return;

  await logActivity(sql, {
    kind: "roc_created",
    rocId,
    title: seed.title,
    details: seed.rocNumber,
  });

  for (const meeting of seed.meetings) {
    await sql`
          insert into roc_meetings (roc_id, meeting_date, notes)
          values (${rocId}, ${meeting.date}, ${meeting.notes})
        `;
  }
  for (const doc of seed.documents) {
    await sql`
          insert into roc_documents (roc_id, title, kind, date_required, date_completed)
          values (${rocId}, ${doc.title}, ${doc.kind}, ${doc.dateRequired}, ${doc.dateCompleted})
        `;
  }
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
  const idsByTitle = new Map<string, number>();
  for (const action of seed.actions) {
    const rows = await sql<{ id: number }>`
          insert into action_items (
            roc_id, department, title, details, kind, due_date, priority, status, posted_as
          ) values (
            ${rocId}, ${action.department}, ${action.title}, ${action.details},
            ${action.kind ?? "action"}, ${action.dueDate ?? null},
            ${action.priority}, ${action.status}, ${action.postedAs ?? "Engineering"}
          )
          returning id
        `;
    const actionId = rows[0]?.id;
    if (!actionId) continue;
    idsByTitle.set(action.title, actionId);
    await logActivity(sql, {
      kind: (action.kind ?? "action") === "note" ? "note_created" : "action_created",
      rocId,
      actionItemId: actionId,
      department: action.department,
      title: action.title,
      details: action.details,
      postedAs: action.postedAs,
    });
    if (action.status === "complete") {
      await logActivity(sql, {
        kind: "action_completed",
        rocId,
        actionItemId: actionId,
        department: action.department,
        title: action.title,
        details: action.details,
        postedAs: action.postedAs,
      });
    }
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
        postedAs: update.postedAs,
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

function assembleSummaries(
  rocs: RocRow[],
  depts: DepartmentStatusRow[],
  actions: Array<{
    id: number;
    roc_id: number;
    department: string;
    priority: string;
    status: string;
    kind: string | null;
    due_date: string | null;
    predecessor_id: number | null;
  }>,
): RocSummary[] {
  const deptsByRoc = new Map<number, DepartmentStatusRow[]>();
  for (const d of depts) {
    const list = deptsByRoc.get(d.roc_id) ?? [];
    list.push(d);
    deptsByRoc.set(d.roc_id, list);
  }
  const actionsByRoc = new Map<number, typeof actions>();
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
    const departments: DeptCell[] = DEPARTMENTS.map((meta) => {
      const row = byDept.get(meta.key);
      const tasks = rocActions
        .filter((a) => a.department === meta.key)
        .filter((a) => a.kind !== "note");
      const open = tasks.filter((a) => a.status !== "complete");
      const lateCount = open.filter((a) => isDueOverdue(a.due_date)).length;
      const waiting =
        open.length > 0 &&
        open.every((action) => {
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
        waiting,
      };
    });
    const openActions = rocActions.filter(
      (a) => a.kind !== "note" && a.status !== "complete",
    ).length;
    const highOpen = rocActions.filter(
      (a) => a.kind !== "note" && a.status !== "complete" && a.priority === "high",
    ).length;
    return {
      ...mapRoc(roc),
      departments,
      openActions,
      highOpen,
    };
  });
}

export const listRocs = createServerFn({ method: "GET" }).handler(
  async (): Promise<RocSummary[]> => {
    await ensureSeed();
    const sql = await getSql();
    const rocs = await sql<RocRow>`select * from rocs order by id desc`;
    const depts = await sql<DepartmentStatusRow>`select * from department_statuses`;
    const actions = await sql<{
      id: number;
      roc_id: number;
      department: string;
      priority: string;
      status: string;
      kind: string | null;
      due_date: string | null;
      predecessor_id: number | null;
    }>`select id, roc_id, department, priority, status, kind, due_date, predecessor_id from action_items`;
    return assembleSummaries(rocs, depts, actions);
  },
);

export const listOpenActions = createServerFn({ method: "GET" }).handler(
  async (): Promise<OpenActionItem[]> => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      roc_id: number;
      department: string;
      title: string;
      details: string;
      kind: string | null;
      due_date: string | null;
      priority: string;
      status: string;
      posted_as: string;
      predecessor_id: number | null;
      created_at: string;
      updated_at: string;
      roc_number: string;
      roc_title: string;
      predecessor_status: string | null;
      predecessor_title: string | null;
    }>`
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
    `;
    return rows
      .filter((row) => isDepartmentKey(row.department))
      .map((row) => {
        const predecessorId = asPredecessorId(row.predecessor_id);
        const predecessorStatus = row.predecessor_status
          ? asActionStatus(row.predecessor_status)
          : null;
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
          updated_at: row.updated_at,
        };
      });
  },
);

export const getRoc = createServerFn({ method: "GET" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }): Promise<RocDetail> => {
    await ensureSeed();
    const sql = await getSql();
    const found = await sql<RocRow>`select * from rocs where id = ${data.id}`;
    const roc = found[0];
    if (!roc) throw new Error("ROC not found");
    const departments = await sql<DepartmentStatusRow>`
      select * from department_statuses where roc_id = ${data.id}
    `;
    const actionItems = await sql<ActionItemRow>`
      select * from action_items where roc_id = ${data.id} order by
        case when kind = 'note' then 1 when status = 'complete' then 2 else 0 end,
        case when priority = 'high' then 0 else 1 end,
        case when due_date is null or due_date = '' then 1 else 0 end,
        due_date asc,
        id asc
    `;
    const updates = await sql<ActionUpdateRow>`
      select u.* from action_updates u
      join action_items i on i.id = u.action_item_id
      where i.roc_id = ${data.id}
      order by u.created_at asc, u.id asc
    `;
    const attachments = await sql<
      AttachmentRow & { has_content: boolean | string | number }
    >`
      select
        id, roc_id, filename, mime, extract_text, created_at,
        case when coalesce(content_base64, '') = '' then false else true end as has_content
      from roc_attachments
      where roc_id = ${data.id}
      order by created_at desc, id desc
    `;
    const updatesByItem = new Map<number, ActionUpdateRow[]>();
    for (const u of updates) {
      const list = updatesByItem.get(u.action_item_id) ?? [];
      list.push(u);
      updatesByItem.set(u.action_item_id, list);
    }
    const deptByKey = new Map(departments.map((d) => [d.department, d]));
    const orderedDepts = DEPARTMENTS.map((meta) => {
      return (
        deptByKey.get(meta.key) ?? {
          id: 0,
          roc_id: roc.id,
          department: meta.key,
          status: "not_started" as DeptStatusKey,
          notes: "",
        }
      );
    }).map((d) => ({
      ...d,
      status: asDeptStatus(d.status),
      department: asDept(d.department),
    }));
    const items: ActionItemWithUpdates[] = actionItems
      .filter((item) => isDepartmentKey(item.department))
      .map((item) => ({
        ...item,
        department: asDept(item.department),
        kind: asItemKind(item.kind),
        due_date: asDueDate(item.due_date),
        priority: asPriority(item.priority),
        status: asActionStatus(item.status),
        predecessor_id: asPredecessorId(item.predecessor_id),
        updates: updatesByItem.get(item.id) ?? [],
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
        has_content:
          row.has_content === true ||
          row.has_content === "t" ||
          row.has_content === 1 ||
          row.has_content === "1",
      })),
    };
  });

export const createRoc = createServerFn({ method: "POST" })
  .validator((data: CreateRocInput) => data)
  .handler(async ({ data }): Promise<{ id: number }> => {
    await ensureSeed();
    const sql = await getSql();
    const title = data.title.trim();
    if (!title) throw new Error("Project name is required");
    const numbers = await sql<{ roc_number: string }>`select roc_number from rocs`;
    const requested = (data.rocNumber ?? "").trim();
    const rocNumber = requested || nextRocNumber(numbers.map((row) => row.roc_number));
    if (
      numbers.some((row) => row.roc_number.toLowerCase() === rocNumber.toLowerCase())
    ) {
      throw new Error(`${rocNumber} is already in use`);
    }
    const status =
      data.overallStatus && ROC_STATUS_SET.has(data.overallStatus)
        ? data.overallStatus
        : "not_started";
    const inserted = await sql<{ id: number }>`
      insert into rocs (
        roc_number, title, description, overall_status,
        critical_release_date, actual_release_date, release_description,
        implementation_notes, additional_notes, affected_projects,
        deadline, single_project, project_name
      ) values (
        ${rocNumber}, ${title}, ${data.description ?? ""}, ${status},
        ${data.criticalReleaseDate || null}, ${asDueDate(data.actualReleaseDate)},
        ${data.releaseDescription ?? ""}, ${data.implementationNotes ?? ""},
        ${data.additionalNotes ?? ""}, ${data.affectedProjects ?? ""},
        ${asDueDate(data.deadline)}, ${Boolean(data.singleProject)},
        ${data.singleProject ? (data.projectName ?? "").trim() : ""}
      )
      returning id
    `;
    const id = inserted[0]?.id;
    if (!id) throw new Error("Failed to create ROC");
    for (const dept of DEPARTMENTS) {
      await sql`
        insert into department_statuses (roc_id, department, status, notes)
        values (${id}, ${dept.key}, ${"not_started"}, ${""})
      `;
    }
    if (data.attachment?.filename) {
      const extract = (data.attachment.extractText ?? "").slice(0, 20_000);
      await sql`
        insert into roc_attachments (roc_id, filename, mime, extract_text)
        values (
          ${id},
          ${data.attachment.filename},
          ${data.attachment.mime || "application/octet-stream"},
          ${extract}
        )
      `;
    }
    await logActivity(sql, {
      kind: "roc_created",
      rocId: id,
      title,
      details: rocNumber,
    });
    return { id };
  });

export const updateRoc = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: number;
      rocNumber?: string;
      title?: string;
      description?: string;
      overallStatus?: RocStatus;
      criticalReleaseDate?: string | null;
      actualReleaseDate?: string | null;
      deadline?: string | null;
      releaseDescription?: string;
      implementationNotes?: string;
      additionalNotes?: string;
      affectedProjects?: string;
      singleProject?: boolean;
      projectName?: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    const found = await sql<RocRow>`select * from rocs where id = ${data.id}`;
    const roc = found[0];
    if (!roc) throw new Error("ROC not found");
    const overall =
      data.overallStatus && ROC_STATUS_SET.has(data.overallStatus)
        ? data.overallStatus
        : roc.overall_status;
    await sql`
      update rocs set
        roc_number = ${data.rocNumber ?? roc.roc_number},
        title = ${data.title ?? roc.title},
        description = ${data.description ?? roc.description},
        overall_status = ${overall},
        critical_release_date = ${data.criticalReleaseDate === undefined ? roc.critical_release_date : data.criticalReleaseDate},
        actual_release_date = ${data.actualReleaseDate === undefined ? roc.actual_release_date : data.actualReleaseDate},
        deadline = ${data.deadline === undefined ? roc.deadline : data.deadline},
        release_description = ${data.releaseDescription ?? roc.release_description},
        implementation_notes = ${data.implementationNotes ?? roc.implementation_notes},
        additional_notes = ${data.additionalNotes ?? roc.additional_notes},
        affected_projects = ${data.affectedProjects ?? roc.affected_projects},
        single_project = ${data.singleProject === undefined ? asBool(roc.single_project) : data.singleProject},
        project_name = ${data.projectName === undefined ? (roc.project_name ?? "") : data.projectName.trim()},
        updated_at = now()
      where id = ${data.id}
    `;
    return { ok: true };
  });

export const addMeeting = createServerFn({ method: "POST" })
  .validator((data: { rocId: number; meetingDate?: string; notes: string }) => data)
  .handler(async ({ data }): Promise<{ id: number }> => {
    if (!data.notes.trim()) throw new Error("Notes are required");
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into roc_meetings (roc_id, meeting_date, notes)
      values (${data.rocId}, ${data.meetingDate || new Date().toISOString().slice(0, 10)}, ${data.notes.trim()})
      returning id
    `;
    return { id: rows[0]!.id };
  });

export const addDocument = createServerFn({ method: "POST" })
  .validator(
    (data: {
      rocId: number;
      title: string;
      kind: DocKind;
      dateRequired?: string | null;
      dateCompleted?: string | null;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ id: number }> => {
    if (!data.title.trim()) throw new Error("Document title is required");
    const kind = DOC_KIND_SET.has(data.kind) ? data.kind : "outstanding";
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into roc_documents (roc_id, title, kind, date_required, date_completed)
      values (
        ${data.rocId}, ${data.title.trim()}, ${kind},
        ${data.dateRequired || null}, ${data.dateCompleted || null}
      )
      returning id
    `;
    return { id: rows[0]!.id };
  });

export const updateDocument = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: number;
      title?: string;
      kind?: DocKind;
      dateRequired?: string | null;
      dateCompleted?: string | null;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    const found = await sql<DocumentRow>`select * from roc_documents where id = ${data.id}`;
    const doc = found[0];
    if (!doc) throw new Error("Document not found");
    await sql`
      update roc_documents set
        title = ${data.title ?? doc.title},
        kind = ${data.kind && DOC_KIND_SET.has(data.kind) ? data.kind : doc.kind},
        date_required = ${data.dateRequired === undefined ? doc.date_required : data.dateRequired},
        date_completed = ${data.dateCompleted === undefined ? doc.date_completed : data.dateCompleted}
      where id = ${data.id}
    `;
    return { ok: true };
  });

export const addAttachment = createServerFn({ method: "POST" })
  .validator(
    (data: {
      rocId: number;
      filename: string;
      mime?: string;
      extractText?: string;
      contentBase64?: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ id: number }> => {
    const filename = data.filename.trim();
    if (!filename) throw new Error("File name is required");
    const content = data.contentBase64 ?? "";
    if (content.length > 9_000_000) throw new Error("File is too large (6 MB max)");
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into roc_attachments (roc_id, filename, mime, extract_text, content_base64)
      values (
        ${data.rocId},
        ${filename},
        ${data.mime || "application/octet-stream"},
        ${(data.extractText ?? "").slice(0, 20_000)},
        ${content}
      )
      returning id
    `;
    return { id: rows[0]!.id };
  });

export const getAttachment = createServerFn({ method: "GET" })
  .validator((data: { id: number }) => data)
  .handler(
    async ({
      data,
    }): Promise<{
      id: number;
      filename: string;
      mime: string;
      extract_text: string;
      content_base64: string;
    }> => {
      const sql = await getSql();
      const found = await sql<{
        id: number;
        filename: string;
        mime: string;
        extract_text: string;
        content_base64: string | null;
      }>`
        select id, filename, mime, extract_text, content_base64
        from roc_attachments
        where id = ${data.id}
      `;
      const row = found[0];
      if (!row) throw new Error("File not found");
      return {
        id: row.id,
        filename: row.filename,
        mime: row.mime,
        extract_text: row.extract_text,
        content_base64: row.content_base64 ?? "",
      };
    },
  );

export const deleteAttachment = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`delete from roc_attachments where id = ${data.id}`;
    return { ok: true };
  });

export const setDepartmentStatus = createServerFn({ method: "POST" })
  .validator(
    (data: {
      rocId: number;
      department: DepartmentKey;
      status: DeptStatusKey;
      notes?: string;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const department = asDept(data.department);
    const status = asDeptStatus(data.status);
    const sql = await getSql();
    await sql`
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

export const addActionItem = createServerFn({ method: "POST" })
  .validator(
    (data: {
      rocId: number;
      department: DepartmentKey;
      title: string;
      details?: string;
      kind?: ItemKind;
      dueDate?: string | null;
      priority?: ActionPriority;
      status?: ActionStatus;
      postedAs?: string;
      predecessorId?: number | null;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ id: number } & LateNoticeResult> => {
    if (!data.title.trim()) throw new Error("Title is required");
    const department = asDept(data.department);
    const kind = asItemKind(data.kind);
    const sql = await getSql();
    let predecessorId = kind === "note" ? null : asPredecessorId(data.predecessorId);
    if (predecessorId) {
      const pred = await sql<{ id: number }>`
        select id from action_items
        where id = ${predecessorId}
          and roc_id = ${data.rocId}
          and coalesce(kind, 'action') <> 'note'
      `;
      if (!pred[0]) throw new Error("Predecessor must be an action in this project");
    }
    const rows = await sql<{ id: number }>`
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
      const current = await sql<DepartmentStatusRow>`
        select * from department_statuses
        where roc_id = ${data.rocId} and department = ${department}
      `;
      const currentStatus = current[0]?.status;
      if (currentStatus && currentStatus !== "na" && currentStatus !== "complete") {
        const next =
          data.priority === "high"
            ? "high_action"
            : currentStatus === "not_started"
              ? "low_action"
              : currentStatus;
        if (next !== currentStatus) {
          await sql`
            update department_statuses set status = ${next}
            where roc_id = ${data.rocId} and department = ${department}
          `;
        }
      }
    }

    await logActivity(sql, {
      kind: kind === "note" ? "note_created" : "action_created",
      rocId: data.rocId,
      actionItemId: rows[0]!.id,
      department,
      title: data.title.trim(),
      details: data.details ?? "",
      postedAs: data.postedAs,
    });

    const notices = await maybeDispatchLateNotices(sql, {
      kind,
      status: asActionStatus(data.status ?? "open"),
      due_date: kind === "note" ? null : asDueDate(data.dueDate),
    });
    return { id: rows[0]!.id, ...notices };
  });

export const updateActionItem = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: number;
      title?: string;
      details?: string;
      kind?: ItemKind;
      dueDate?: string | null;
      priority?: ActionPriority;
      status?: ActionStatus;
      predecessorId?: number | null;
    }) => data,
  )
  .handler(async ({ data }): Promise<{ ok: true } & LateNoticeResult> => {
    const sql = await getSql();
    const existing = await sql<ActionItemRow>`select * from action_items where id = ${data.id}`;
    const item = existing[0];
    if (!item) throw new Error("Action item not found");
    const kind = data.kind ? asItemKind(data.kind) : asItemKind(item.kind);
    const dueDate =
      data.dueDate === undefined
        ? asDueDate(item.due_date)
        : kind === "note"
          ? null
          : asDueDate(data.dueDate);

    let predecessorId = asPredecessorId(item.predecessor_id);
    if (data.predecessorId !== undefined) {
      predecessorId = asPredecessorId(data.predecessorId);
      if (predecessorId) {
        if (predecessorId === item.id) {
          throw new Error("A task cannot follow itself");
        }
        const siblings = await sql<{ id: number; predecessor_id: number | null }>`
          select id, predecessor_id from action_items
          where roc_id = ${item.roc_id} and coalesce(kind, 'action') <> 'note'
        `;
        const pred = siblings.find((row) => row.id === predecessorId);
        if (!pred) throw new Error("Predecessor must be an action in this project");
        const byId = new Map(
          siblings.map((row) => [row.id, asPredecessorId(row.predecessor_id)]),
        );
        const seen = new Set<number>([item.id]);
        let walk: number | null = predecessorId;
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
    if (nextStatus === "complete" && item.status !== "complete") {
      await logActivity(sql, {
        kind: "action_completed",
        rocId: item.roc_id,
        actionItemId: item.id,
        department: item.department,
        title: data.title ?? item.title,
        details: data.details ?? item.details,
        postedAs: item.posted_as,
      });
    } else if (item.status === "complete" && nextStatus !== "complete") {
      await logActivity(sql, {
        kind: "action_reopened",
        rocId: item.roc_id,
        actionItemId: item.id,
        department: item.department,
        title: data.title ?? item.title,
        details: data.details ?? item.details,
        postedAs: item.posted_as,
      });
    }
    const notices = await maybeDispatchLateNotices(sql, {
      kind,
      status: nextStatus,
      due_date: dueDate,
    });
    return { ok: true, ...notices };
  });

export const addActionUpdate = createServerFn({ method: "POST" })
  .validator((data: { actionItemId: number; body: string; postedAs?: string }) => data)
  .handler(async ({ data }): Promise<{ id: number }> => {
    if (!data.body.trim()) throw new Error("Update cannot be empty");
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
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
    const found = await sql<ActionItemRow>`
      select * from action_items where id = ${data.actionItemId}
    `;
    const row = found[0];
    if (row) {
      await logActivity(sql, {
        kind: "follow_up",
        rocId: row.roc_id,
        actionItemId: row.id,
        department: row.department,
        title: row.title,
        details: data.body.trim(),
        postedAs: data.postedAs,
      });
    }
    return { id: rows[0]!.id };
  });

export const deleteActionItem = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`update action_items set predecessor_id = null where predecessor_id = ${data.id}`;
    await sql`delete from action_items where id = ${data.id}`;
    return { ok: true };
  });

const ACTIVITY_KINDS = new Set<string>([
  "roc_created",
  "action_created",
  "note_created",
  "action_completed",
  "action_reopened",
  "follow_up",
]);

function asActivityKind(value: string): ActivityKind {
  return (ACTIVITY_KINDS.has(value) ? value : "action_created") as ActivityKind;
}

function asIso(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

export const listActivity = createServerFn({ method: "GET" }).handler(
  async (): Promise<ActivityEvent[]> => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      occurred_at: string | Date;
      kind: string;
      roc_id: number;
      action_item_id: number | null;
      department: string | null;
      title: string;
      details: string;
      posted_as: string;
      roc_number: string;
      roc_title: string;
    }>`
      select
        e.id, e.occurred_at, e.kind, e.roc_id, e.action_item_id, e.department,
        e.title, e.details, e.posted_as,
        r.roc_number, r.title as roc_title
      from activity_events e
      join rocs r on r.id = e.roc_id
      order by e.occurred_at desc, e.id desc
      limit 500
    `;
    return rows.map((row) => ({
      id: row.id,
      occurred_at: asIso(row.occurred_at),
      kind: asActivityKind(row.kind),
      roc_id: row.roc_id,
      roc_number: row.roc_number,
      roc_title: row.roc_title,
      action_item_id: row.action_item_id,
      department:
        row.department && isDepartmentKey(row.department) ? row.department : null,
      title: row.title,
      details: row.details,
      posted_as: row.posted_as,
    }));
  },
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapContact(row: {
  department: string;
  contact_name: string;
  email: string;
  phone: string;
  role: string;
}): DepartmentContact | null {
  if (!isDepartmentKey(row.department)) return null;
  return {
    department: row.department,
    contact_name: row.contact_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    role: row.role ?? "",
  };
}

export const listDepartmentContacts = createServerFn({ method: "GET" }).handler(
  async (): Promise<DepartmentContact[]> => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<{
      department: string;
      contact_name: string;
      email: string;
      phone: string;
      role: string;
    }>`select department, contact_name, email, phone, role from department_contacts`;
    const byDept = new Map(
      rows
        .map(mapContact)
        .filter((row): row is DepartmentContact => Boolean(row))
        .map((row) => [row.department, row]),
    );
    return DEPARTMENTS.map((dept) => {
      const row = byDept.get(dept.key);
      return (
        row ?? {
          department: dept.key,
          contact_name: "",
          email: "",
          phone: "",
          role: "",
        }
      );
    });
  },
);

export const saveDepartmentContacts = createServerFn({ method: "POST" })
  .validator((data: DepartmentContact[]) => data)
  .handler(async ({ data }): Promise<{ ok: true } & LateNoticeResult> => {
    const sql = await getSql();
    for (const row of data) {
      const department = asDept(row.department);
      const email = row.email.trim();
      if (email && !EMAIL_RE.test(email)) {
        throw new Error(`Check the email for ${departmentLabel(department)}`);
      }
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
    if (settings.mode !== "immediate") {
      return { ok: true, noticesSent: 0, queued: 0 };
    }
    const notices = await dispatchLateNotices(sql, { force: false, settings });
    return { ok: true, ...notices };
  });

type LateTaskRow = {
  id: number;
  title: string;
  due_date: string | null;
  department: string;
  roc_id: number;
  roc_number: string;
  roc_title: string;
  email: string | null;
  contact_name: string | null;
  last_sent: string | Date | null;
};

export type LateNoticeResult = {
  noticesSent: number;
  queued: number;
  noticeError?: string;
};

type LateCopyKind = "immediate" | "reminder" | "daily" | "weekly";

async function loadNoticeSettings(sql: SqlClient): Promise<NoticeSettings> {
  const rows = await sql<{
    mode: string;
    remind_every_hours: number;
    daily_time: string;
    weekly_day: number;
    weekly_time: string;
    timezone: string;
  }>`
    select mode, remind_every_hours, daily_time, weekly_day, weekly_time, timezone
    from notice_settings
    where id = 1
  `;
  const row = rows[0];
  if (!row) return normalizeNoticeSettings(null);
  return normalizeNoticeSettings({
    mode: row.mode,
    remindEveryHours: Number(row.remind_every_hours),
    dailyTime: row.daily_time,
    weeklyDay: Number(row.weekly_day),
    weeklyTime: row.weekly_time,
    timezone: row.timezone,
  });
}

export const getNoticeSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<NoticeSettings> => {
    await ensureSeed();
    const sql = await getSql();
    return loadNoticeSettings(sql);
  },
);

export const saveNoticeSettings = createServerFn({ method: "POST" })
  .validator((data: NoticeSettings) => normalizeNoticeSettings(data))
  .handler(async ({ data }): Promise<NoticeSettings> => {
    const sql = await getSql();
    await sql`
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

function isLoopbackHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1";
}

function publicAppOrigin(): string | null {
  try {
    const req = getRequest();
    if (!req) return null;
    const xf = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = (xf || req.headers.get("host") || "").split(":")[0]?.trim();
    if (!host || isLoopbackHost(host)) return null;
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "http"
        ? "http"
        : "https";
    return `${proto}://${host}`;
  } catch {
    return null;
  }
}

function actionItemUrl(
  origin: string | null,
  rocId: number,
  department: string,
  itemId: number,
): string | null {
  if (!origin || !Number.isFinite(rocId) || !Number.isFinite(itemId) || itemId <= 0) {
    return null;
  }
  const params = new URLSearchParams({
    dept: department,
    item: String(itemId),
  });
  return `${origin}/roc/${rocId}?${params.toString()}`;
}

function lateEmailCopy(
  tasks: LateTaskRow[],
  department: string,
  kind: LateCopyKind,
  origin: string | null,
) {
  const label = departmentLabel(department);
  const name = tasks[0]?.contact_name?.trim();
  const greeting = name ? `Hello ${name},` : `Hello ${label} team,`;
  const lines = tasks.map((task) => {
    const due = formatDate(task.due_date);
    const url = actionItemUrl(
      origin,
      Number(task.roc_id),
      task.department,
      Number(task.id),
    );
    const head = `• ${task.title}\n  ${task.roc_number} · ${task.roc_title}\n  Due ${due}`;
    return url ? `${head}\n  ${url}` : head;
  });
  const intro =
    kind === "daily"
      ? tasks.length === 1
        ? `End-of-day reminder — a task assigned to ${label} is past due:`
        : `End-of-day reminder — ${tasks.length} tasks assigned to ${label} are past due:`
      : kind === "weekly"
        ? tasks.length === 1
          ? `Weekly reminder — a task assigned to ${label} is past due:`
          : `Weekly reminder — ${tasks.length} tasks assigned to ${label} are past due:`
        : kind === "reminder"
          ? tasks.length === 1
            ? `A task assigned to ${label} is still past due:`
            : `${tasks.length} tasks assigned to ${label} are still past due:`
          : tasks.length === 1
            ? `A task assigned to ${label} is past due:`
            : `${tasks.length} tasks assigned to ${label} are past due:`;
  const body = [
    greeting,
    "",
    intro,
    "",
    ...lines,
    "",
    "Please update the ROC tracker when the work is complete.",
    "",
    "— ROC Tracker",
  ].join("\n");
  const items = tasks
    .map((task) => {
      const due = formatDate(task.due_date);
      const url = actionItemUrl(
        origin,
        Number(task.roc_id),
        task.department,
        Number(task.id),
      );
      const title = url
        ? `<a href="${escapeHtml(url)}" style="color:#1e4a56;text-decoration:underline"><strong>${escapeHtml(task.title)}</strong></a>`
        : `<strong>${escapeHtml(task.title)}</strong>`;
      return `<li style="margin:0 0 10px">${title}<br/><span style="color:#6b6458">${escapeHtml(task.roc_number)} · ${escapeHtml(task.roc_title)}<br/>Due ${escapeHtml(due)}</span></li>`;
    })
    .join("");
  const html = `<div style="font-family:'IBM Plex Sans',system-ui,sans-serif;color:#1a1814;line-height:1.5">
<p>${escapeHtml(greeting)}</p>
<p>${escapeHtml(intro)}</p>
<ul style="padding-left:1.1rem">${items}</ul>
<p>Please update the ROC tracker when the work is complete.</p>
<p style="color:#6b6458">— ROC Tracker</p>
</div>`;
  const subject =
    kind === "daily"
      ? `ROC Tracker — end-of-day late tasks for ${label}`
      : kind === "weekly"
        ? `ROC Tracker — weekly late tasks for ${label}`
        : kind === "reminder"
          ? `ROC Tracker — late task reminder for ${label}`
          : tasks.length === 1
            ? `ROC Tracker — late task for ${label}`
            : `ROC Tracker — ${tasks.length} late tasks for ${label}`;
  return { subject, body, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function friendlyMailError(raw: string | undefined, loginRequired?: boolean): string {
  if (loginRequired) {
    return "Gmail is not connected, so the late-task email could not send.";
  }
  const text = raw ?? "";
  if (
    text.includes("missing_connector_token") ||
    text.includes("gate host") ||
    text.includes("x-connector-access-token") ||
    text.includes("cannot resolve gate")
  ) {
    return "Gmail is not connected, so the late-task email could not send.";
  }
  return text || "Could not send the late-task email.";
}

async function sendDepartmentLateEmail(
  to: string,
  subject: string,
  body: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { callTool, ConnectorType } = await import("@/lib/app-data/client.server");
    const result = await callTool(
      "gmail_send_message",
      { to: [to], subject, body, body_html: html },
      { connectorType: ConnectorType.Gmail },
    );
    if (result.ok) return { ok: true };
    return {
      ok: false,
      error: friendlyMailError(result.errorMessage, result.loginRequired),
    };
  } catch (error) {
    return {
      ok: false,
      error: friendlyMailError(error instanceof Error ? error.message : undefined),
    };
  }
}

async function dispatchLateNotices(
  sql: SqlClient,
  opts: { force?: boolean; settings?: NoticeSettings } = {},
): Promise<LateNoticeResult> {
  const settings = opts.settings ?? (await loadNoticeSettings(sql));
  const force = Boolean(opts.force);
  if (!force && settings.mode === "off") {
    return { noticesSent: 0, queued: 0 };
  }
  const origin = publicAppOrigin();
  const rows = await sql<LateTaskRow>`
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
    `;
  const due = rows.filter(
    (row) =>
      isDepartmentKey(row.department) &&
      isDueOverdue(row.due_date) &&
      EMAIL_RE.test((row.email ?? "").trim()),
  );
  const grouped = new Map<string, LateTaskRow[]>();
  for (const row of due) {
    const list = grouped.get(row.department) ?? [];
    list.push(row);
    grouped.set(row.department, list);
  }

  let eligible = grouped;
  let copyKind: LateCopyKind =
    settings.mode === "daily" || settings.mode === "weekly"
      ? settings.mode
      : "immediate";

  if (!force && settings.mode === "immediate") {
    const next = new Map<string, LateTaskRow[]>();
    let anyReminder = false;
    for (const [department, tasks] of grouped) {
      const ready = tasks.some((task) =>
        isReminderDue(task.last_sent, settings.remindEveryHours),
      );
      if (!ready) continue;
      if (tasks.some((task) => task.last_sent)) anyReminder = true;
      next.set(department, tasks);
    }
    eligible = next;
    if (anyReminder) copyKind = "reminder";
  } else if (!force && (settings.mode === "daily" || settings.mode === "weekly")) {
    if (!isDigestSlotOpen(settings)) {
      return { noticesSent: 0, queued: 0 };
    }
    const period = digestPeriodKey(settings);
    if (!period) return { noticesSent: 0, queued: 0 };
    const sent = await sql<{ department: string }>`
      select department from notice_digests where period_key = ${period}
    `;
    const done = new Set(sent.map((row) => row.department));
    eligible = new Map(
      [...grouped.entries()].filter(([department]) => !done.has(department)),
    );
  }

  let sentCount = 0;
  let error: string | undefined;
  const period = digestPeriodKey(settings);
  for (const [department, tasks] of eligible) {
    const to = tasks[0]!.email!.trim();
    const copy = lateEmailCopy(tasks, department, copyKind, origin);
    const result = await sendDepartmentLateEmail(to, copy.subject, copy.body, copy.html);
    if (!result.ok) {
      error ??= result.error;
      continue;
    }
    for (const task of tasks) {
      await sql`
          insert into late_notices (action_item_id, to_email, sent_at)
          values (${task.id}, ${to}, now())
          on conflict (action_item_id) do update set
            to_email = excluded.to_email,
            sent_at = now()
        `;
    }
    if (period) {
      await sql`
        insert into notice_digests (department, period_key, to_email)
        values (${department}, ${period}, ${to})
        on conflict (department, period_key) do nothing
      `;
    }
    sentCount += 1;
  }
  return {
    noticesSent: sentCount,
    queued: eligible.size,
    ...(error ? { noticeError: error } : {}),
  };
}

async function maybeDispatchLateNotices(
  sql: SqlClient,
  item: { kind?: string | null; status: string; due_date: string | null },
): Promise<LateNoticeResult> {
  if (asItemKind(item.kind) === "note") return { noticesSent: 0, queued: 0 };
  if (asActionStatus(item.status) === "complete") return { noticesSent: 0, queued: 0 };
  if (!isDueOverdue(item.due_date)) return { noticesSent: 0, queued: 0 };
  const settings = await loadNoticeSettings(sql);
  if (settings.mode !== "immediate") return { noticesSent: 0, queued: 0 };
  return dispatchLateNotices(sql, { force: false, settings });
}

export const sendLateNotices = createServerFn({ method: "POST" })
  .validator((data: { force?: boolean } | undefined) => ({
    force: Boolean(data?.force),
  }))
  .handler(async ({ data }): Promise<LateNoticeResult> => {
    await ensureSeed();
    const sql = await getSql();
    return dispatchLateNotices(sql, { force: data.force });
  });

export type TrackerStateSummary = {
  id: number;
  day: string;
  captured_at: string;
  summary: string;
  isToday: boolean;
};

const SNAPSHOT_MIN_MS = 30 * 60 * 1000;

const SNAPSHOT_TABLES: { name: string; columns: string[] }[] = [
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
      "updated_at",
    ],
  },
  {
    name: "roc_meetings",
    columns: ["id", "roc_id", "meeting_date", "notes", "created_at"],
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
      "created_at",
    ],
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
      "content_base64",
    ],
  },
  {
    name: "department_statuses",
    columns: ["id", "roc_id", "department", "status", "notes"],
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
      "updated_at",
    ],
  },
  {
    name: "action_updates",
    columns: ["id", "action_item_id", "body", "posted_as", "created_at"],
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
      "posted_as",
    ],
  },
  {
    name: "department_contacts",
    columns: [
      "department",
      "contact_name",
      "email",
      "phone",
      "role",
      "updated_at",
    ],
  },
  {
    name: "late_notices",
    columns: ["action_item_id", "to_email", "sent_at"],
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
      "updated_at",
    ],
  },
  {
    name: "notice_digests",
    columns: ["department", "period_key", "to_email", "sent_at"],
  },
];

const SNAPSHOT_SERIALS = [
  "rocs",
  "roc_meetings",
  "roc_documents",
  "roc_attachments",
  "department_statuses",
  "action_items",
  "action_updates",
  "activity_events",
] as const;

const SNAPSHOT_DELETE_ORDER = [
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
  "notice_settings",
] as const;

function asIsoStamp(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim()) return value;
  return "";
}

function mapStateRow(
  row: { id: number; day: string; captured_at: string | Date; summary: string },
  today: string,
): TrackerStateSummary {
  return {
    id: Number(row.id),
    day: row.day,
    captured_at: asIsoStamp(row.captured_at),
    summary: row.summary || "",
    isToday: row.day === today,
  };
}

async function captureTrackerPayload(sql: SqlClient): Promise<{
  payload: string;
  summary: string;
}> {
  const tables: Record<string, Record<string, unknown>[]> = {};
  for (const table of SNAPSHOT_TABLES) {
    tables[table.name] = await sql.query<Record<string, unknown>>(
      `select ${table.columns.join(", ")} from ${table.name} order by 1`,
    );
  }
  const rocCount = tables.rocs?.length ?? 0;
  const actionCount = (tables.action_items ?? []).filter(
    (row) => row.kind !== "note",
  ).length;
  const summary = `${rocCount} ROC${rocCount === 1 ? "" : "s"} · ${actionCount} action${actionCount === 1 ? "" : "s"}`;
  return {
    payload: JSON.stringify({ version: 1, tables }),
    summary,
  };
}

async function upsertDailyState(sql: SqlClient): Promise<TrackerStateSummary> {
  const settings = await loadNoticeSettings(sql);
  const today = zonedClock(settings.timezone).date;
  const existing = await sql<{
    id: number;
    captured_at: string | Date;
  }>`
    select id, captured_at from tracker_states where day = ${today} limit 1
  `;
  if (existing[0]) {
    const last = new Date(existing[0].captured_at).getTime();
    if (Number.isFinite(last) && Date.now() - last < SNAPSHOT_MIN_MS) {
      const row = await sql<{
        id: number;
        day: string;
        captured_at: string | Date;
        summary: string;
      }>`
        select id, day, captured_at, summary from tracker_states where id = ${existing[0].id}
      `;
      if (row[0]) return mapStateRow(row[0], today);
    }
  }
  const { payload, summary } = await captureTrackerPayload(sql);
  const saved = await sql<{
    id: number;
    day: string;
    captured_at: string | Date;
    summary: string;
  }>`
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

const globalSnap = globalThis as typeof globalThis & {
  __rocDailyState__?: Promise<TrackerStateSummary>;
};

export const saveDailyState = createServerFn({ method: "POST" }).handler(
  async (): Promise<TrackerStateSummary> => {
    await ensureSeed();
    const sql = await getSql();
    globalSnap.__rocDailyState__ ??= upsertDailyState(sql).finally(() => {
      globalSnap.__rocDailyState__ = undefined;
    });
    return globalSnap.__rocDailyState__;
  },
);

export const listTrackerStates = createServerFn({ method: "GET" }).handler(
  async (): Promise<TrackerStateSummary[]> => {
    await ensureSeed();
    const sql = await getSql();
    await upsertDailyState(sql);
    const settings = await loadNoticeSettings(sql);
    const today = zonedClock(settings.timezone).date;
    const rows = await sql<{
      id: number;
      day: string;
      captured_at: string | Date;
      summary: string;
    }>`
      select id, day, captured_at, summary
      from tracker_states
      order by day desc
    `;
    return rows.map((row) => mapStateRow(row, today));
  },
);

export const exportTrackerStateDocx = createServerFn({ method: "GET" })
  .validator((data: { id: number }) => {
    const id = Math.trunc(Number(data?.id));
    if (!Number.isFinite(id) || id <= 0) throw new Error("Choose a saved state.");
    return { id };
  })
  .handler(async ({ data }): Promise<{ filename: string; base64: string }> => {
    await ensureSeed();
    const sql = await getSql();
    const found = await sql<{
      day: string;
      captured_at: string | Date;
      summary: string;
      payload: string;
    }>`
      select day, captured_at, summary, payload
      from tracker_states
      where id = ${data.id}
      limit 1
    `;
    const row = found[0];
    if (!row) throw new Error("That saved state is no longer available.");
    let parsed: { version?: unknown; tables?: unknown };
    try {
      parsed = JSON.parse(row.payload) as { version?: unknown; tables?: unknown };
    } catch {
      throw new Error("That saved state cannot be read.");
    }
    if (parsed.version !== 1 || !parsed.tables || typeof parsed.tables !== "object") {
      throw new Error("That saved state cannot be read.");
    }
    return buildRestoreDocxBase64(parsed.tables as Record<string, Record<string, unknown>[]>, {
      day: row.day,
      capturedAt: asIsoStamp(row.captured_at),
      summary: row.summary || "",
    });
  });

function snapshotCell(row: Record<string, unknown>, column: string): unknown {
  const value = row[column];
  if (value === undefined) {
    if (column === "single_project") return false;
    if (column === "project_name") return "";
    return null;
  }
  if (value instanceof Date) return value.toISOString();
  return value;
}

async function insertSnapshotRows(
  sql: SqlClient,
  table: { name: string; columns: string[] },
  rows: unknown,
) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const placeholders = table.columns.map((_, i) => `$${i + 1}`).join(", ");
  const text = `insert into ${table.name} (${table.columns.join(", ")}) values (${placeholders})`;
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    await sql.query(
      text,
      table.columns.map((column) => snapshotCell(row, column)),
    );
  }
}

async function resetSerial(sql: SqlClient, table: string) {
  await sql.query(
    `select setval(
      '${table}_id_seq',
      (select coalesce(max(id), 1) from ${table}),
      (select exists (select 1 from ${table}))
    )`,
  );
}

export const restoreTrackerState = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => {
    const id = Math.trunc(Number(data?.id));
    if (!Number.isFinite(id) || id <= 0) throw new Error("Choose a saved state.");
    return { id };
  })
  .handler(async ({ data }): Promise<TrackerStateSummary> => {
    await ensureSeed();
    const sql = await getSql();
    const settings = await loadNoticeSettings(sql);
    const today = zonedClock(settings.timezone).date;
    const found = await sql<{
      id: number;
      day: string;
      captured_at: string | Date;
      summary: string;
      payload: string;
    }>`
      select id, day, captured_at, summary, payload
      from tracker_states
      where id = ${data.id}
      limit 1
    `;
    const row = found[0];
    if (!row) throw new Error("That saved state is no longer available.");
    let parsed: { version?: unknown; tables?: unknown };
    try {
      parsed = JSON.parse(row.payload) as { version?: unknown; tables?: unknown };
    } catch {
      throw new Error("That saved state cannot be read.");
    }
    if (parsed.version !== 1 || !parsed.tables || typeof parsed.tables !== "object") {
      throw new Error("That saved state cannot be read.");
    }
    const tables = parsed.tables as Record<string, unknown>;
    for (const name of SNAPSHOT_DELETE_ORDER) {
      await sql.query(`delete from ${name}`);
    }
    for (const table of SNAPSHOT_TABLES) {
      await insertSnapshotRows(sql, table, tables[table.name]);
    }
    await sql.query(
      "insert into notice_settings (id) values (1) on conflict (id) do nothing",
    );
    await ensureDepartmentContacts(sql);
    for (const table of SNAPSHOT_SERIALS) {
      await resetSerial(sql, table);
    }
    return mapStateRow(row, today);
  });
