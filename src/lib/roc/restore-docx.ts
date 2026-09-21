import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  InternalHyperlink,
  Packer,
  PageNumber,
  Paragraph,
  Bookmark,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  type ITableCellBorders,
} from "docx";
import {
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  DEPARTMENTS,
  departmentLabel,
  ITEM_KINDS,
} from "./constants";
import {
  deptStatusLabel,
  formatDate,
  formatDateTime,
  rocStatusLabel,
} from "./format";
import {
  NOTICE_MODES,
  NOTICE_TIMEZONES,
  REMIND_OPTIONS,
  WEEKDAYS,
} from "./notice-schedule";

export type RestoreTables = Record<string, Record<string, unknown>[] | undefined>;

export type RestoreDocMeta = {
  day: string;
  capturedAt: string;
  summary: string;
};

const STEEL = "1E4A56";
const INK = "1A1814";
const MUTED = "6B6458";
const LINE = "D8D0C0";
const PAPER = "F3EFE6";
const WHITE = "FFFFFF";

const thin: ITableCellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
  left: { style: BorderStyle.SINGLE, size: 4, color: LINE },
  right: { style: BorderStyle.SINGLE, size: 4, color: LINE },
};

function rowsOf(tables: RestoreTables, name: string): Record<string, unknown>[] {
  const list = tables[name];
  return Array.isArray(list) ? list : [];
}

function text(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function display(value: unknown, empty = "—"): string {
  const next = text(value);
  return next || empty;
}

function asId(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

function actionStatusLabel(status: string): string {
  return ACTION_STATUSES.find((s) => s.key === status)?.label ?? status;
}

function actionPriorityLabel(priority: string): string {
  return ACTION_PRIORITIES.find((p) => p.key === priority)?.label ?? priority;
}

function itemKindLabel(kind: string): string {
  return ITEM_KINDS.find((k) => k.key === kind)?.label ?? kind;
}

function run(
  content: string,
  opts: { bold?: boolean; italics?: boolean; color?: string; size?: number } = {},
) {
  return new TextRun({
    text: content,
    font: "Calibri",
    size: opts.size ?? 22,
    bold: opts.bold,
    italics: opts.italics,
    color: opts.color ?? INK,
  });
}

function body(textValue: string) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [run(textValue)],
  });
}

function muted(textValue: string) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [run(textValue, { color: MUTED, italics: true })],
  });
}

function heading1(id: string, title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 80, after: 200 },
    children: [
      new Bookmark({
        id,
        children: [
          new TextRun({
            text: title,
            font: "Calibri",
            size: 32,
            bold: true,
            color: STEEL,
          }),
        ],
      }),
    ],
  });
}

function heading2(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: STEEL, space: 4 },
    },
    children: [
      new TextRun({
        text: title,
        font: "Calibri",
        size: 26,
        bold: true,
        color: STEEL,
      }),
    ],
  });
}

function heading3(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: "Calibri",
        size: 24,
        bold: true,
        color: INK,
      }),
    ],
  });
}

function cell(
  content: string,
  opts: {
    fill?: string;
    bold?: boolean;
    color?: string;
    width?: number;
    header?: boolean;
  } = {},
) {
  return new TableCell({
    borders: thin,
    width: { size: opts.width ?? 50, type: WidthType.PERCENTAGE },
    shading: opts.fill
      ? { type: ShadingType.CLEAR, fill: opts.fill }
      : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: content || " ",
            font: "Calibri",
            size: opts.header ? 18 : 20,
            bold: Boolean(opts.bold || opts.header),
            color: opts.color ?? (opts.header ? WHITE : INK),
          }),
        ],
      }),
    ],
  });
}

function kvTable(pairs: Array<[string, string]>) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2800, 6560],
    rows: pairs.map(
      ([label, value]) =>
        new TableRow({
          children: [
            cell(label, { fill: PAPER, bold: true, width: 30, color: MUTED }),
            cell(value, { width: 70 }),
          ],
        }),
    ),
  });
}

function gridTable(headers: string[], data: string[][]) {
  const col = Math.max(1, Math.floor(100 / headers.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h) =>
          cell(h, { fill: STEEL, header: true, width: col }),
        ),
      }),
      ...data.map(
        (row) =>
          new TableRow({
            children: row.map((value) => cell(value, { width: col })),
          }),
      ),
    ],
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 200 }, children: [] });
}

function pageBreak() {
  return new Paragraph({ pageBreakBefore: true, children: [] });
}

function tocLink(anchor: string, label: string) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: "  ", font: "Calibri", size: 22 }),
      new InternalHyperlink({
        anchor,
        children: [
          new TextRun({
            text: label,
            font: "Calibri",
            size: 22,
            color: STEEL,
            underline: {},
          }),
        ],
      }),
    ],
  });
}

function longText(value: unknown, cap = 8000): string {
  const next = text(value);
  if (!next) return "—";
  if (next.length <= cap) return next;
  return `${next.slice(0, cap)}\n\n… (truncated)`;
}

function paragraphsFromMultiline(value: string) {
  const parts = value.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return [muted("—")];
  return parts.map((part) => body(part));
}

function sortRocs(rocs: Record<string, unknown>[]) {
  return [...rocs].sort((a, b) =>
    text(a.roc_number).localeCompare(text(b.roc_number), undefined, {
      numeric: true,
    }),
  );
}

function buildCover(meta: RestoreDocMeta, rocCount: number) {
  const captured = meta.capturedAt
    ? formatDateTime(meta.capturedAt)
    : formatDate(meta.day);
  return [
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "ROC TRACKER",
          font: "Calibri",
          size: 20,
          bold: true,
          color: STEEL,
          characterSpacing: 240,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "Restore archive",
          font: "Calibri",
          size: 56,
          bold: true,
          color: INK,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: formatDate(meta.day),
          font: "Calibri",
          size: 28,
          color: STEEL,
        }),
      ],
    }),
    muted(`Captured ${captured}  ·  ${meta.summary || `${rocCount} projects`}`),
    body(
      "This Word file is a complete, readable copy of the tracker on this date. Open it in Microsoft Word. If automated restore is ever unavailable — or the tracker itself has changed — use these pages to re-enter every project, status, date, note, task, dependency, file, and contact by hand.",
    ),
    heading2("How to use this file"),
    body(
      "1. Table of contents — jump to a project.  2. Team & notices — contacts and late-email settings.  3. Each project — details, then department notes/status, then that department’s tasks and comments.",
    ),
    body(
      "Automated restore still lives in Settings → Restore: pick this date and choose Restore tracker. This document is the durable copy you can keep outside the app.",
    ),
  ];
}

function buildContacts(tables: RestoreTables) {
  const rows = rowsOf(tables, "department_contacts");
  const byDept = new Map(rows.map((row) => [text(row.department), row]));
  const data = DEPARTMENTS.map((dept) => {
    const row = byDept.get(dept.key);
    return [
      dept.label,
      display(row?.contact_name),
      display(row?.role),
      display(row?.email),
      display(row?.phone),
    ];
  });
  return [
    heading1("contacts", "Team contacts"),
    muted("Late-task notices use the email on each row."),
    gridTable(["Department", "Name", "Role", "Email", "Phone"], data),
  ];
}

function buildNotices(tables: RestoreTables) {
  const row = rowsOf(tables, "notice_settings")[0];
  const mode = NOTICE_MODES.find((m) => m.key === text(row?.mode)) ?? NOTICE_MODES[0];
  const remind =
    REMIND_OPTIONS.find((o) => o.hours === Number(row?.remind_every_hours)) ??
    REMIND_OPTIONS.find((o) => o.hours === 24);
  const weekday =
    WEEKDAYS.find((d) => d.value === Number(row?.weekly_day)) ?? WEEKDAYS[0];
  const zone =
    NOTICE_TIMEZONES.find((z) => z.value === text(row?.timezone)) ??
    NOTICE_TIMEZONES[0];
  return [
    heading1("notices", "Notification settings"),
    spacer(),
    kvTable([
      ["Schedule", mode?.title ?? display(row?.mode)],
      ["What it does", mode?.body ?? "—"],
      ["Reminders", remind?.label ?? display(row?.remind_every_hours)],
      ["End of day time", display(row?.daily_time)],
      ["Weekly day / time", `${weekday?.label ?? "Monday"}  ${display(row?.weekly_time)}`],
      ["Time zone", zone?.label ?? display(row?.timezone)],
    ]),
  ];
}

function rocDetails(roc: Record<string, unknown>) {
  const flagged = asBool(roc.single_project);
  const pairs: Array<[string, string]> = [
    ["ROC number", display(roc.roc_number)],
    ["Project name", display(roc.title)],
    ["Status", rocStatusLabel(text(roc.overall_status) || "not_started")],
    ["Start date", formatDate(text(roc.actual_release_date) || null)],
    ["Deadline", formatDate(text(roc.deadline) || text(roc.critical_release_date) || null)],
    ["Single-project ROC", flagged ? "Yes" : "No"],
  ];
  if (flagged) pairs.push(["Applies to project", display(roc.project_name)]);
  const extras: Array<[string, unknown]> = [
    ["Release description", roc.release_description],
    ["Implementation notes", roc.implementation_notes],
    ["Departments impacted", roc.affected_projects],
  ];
  for (const [label, value] of extras) {
    if (text(value)) pairs.push([label, text(value)]);
  }
  return pairs;
}

function buildAttachments(
  attachments: Record<string, unknown>[],
): (Paragraph | Table)[] {
  if (!attachments.length) {
    return [heading2("Attached files"), muted("No files attached.")];
  }
  const blocks: (Paragraph | Table)[] = [
    heading2("Attached files"),
    muted("Filenames and extracted text. Binary file contents are not printed here."),
  ];
  for (const file of attachments) {
    blocks.push(heading3(display(file.filename, "Untitled file")));
    blocks.push(
      kvTable([
        ["File name", display(file.filename)],
        ["Type", display(file.mime)],
        ["Added", formatDateTime(text(file.created_at) || null)],
      ]),
    );
    blocks.push(spacer());
    const extract = text(file.extract_text);
    if (extract) {
      blocks.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [run("Extracted text", { bold: true, color: MUTED, size: 18 })],
        }),
      );
      blocks.push(...paragraphsFromMultiline(longText(extract)));
    } else {
      blocks.push(muted("No extracted text (binary file)."));
    }
  }
  return blocks;
}

function buildDepartment(
  deptKey: string,
  status: Record<string, unknown> | undefined,
  items: Record<string, unknown>[],
  updatesByItem: Map<number, Record<string, unknown>[]>,
  titleById: Map<number, string>,
): (Paragraph | Table)[] {
  const notes = text(status?.notes);
  const statusKey = text(status?.status) || "not_started";
  if (
    !notes &&
    (statusKey === "na" || statusKey === "not_started") &&
    items.length === 0
  ) {
    return [];
  }
  const actions = items.filter((item) => text(item.kind) !== "note");
  const notesItems = items.filter((item) => text(item.kind) === "note");
  const blocks: (Paragraph | Table)[] = [
    heading2(departmentLabel(deptKey)),
    spacer(),
    kvTable([
      ["Department status", deptStatusLabel(statusKey)],
      ["Department notes", notes || "—"],
    ]),
  ];

  const renderItem = (item: Record<string, unknown>, index: number) => {
    const id = asId(item.id);
    const predId = asId(item.predecessor_id);
    const kind = text(item.kind) || "action";
    const title = display(item.title, kind === "note" ? "Note" : "Untitled task");
    blocks.push(heading3(`${index}.  ${title}`));
    const pairs: Array<[string, string]> = [
      ["Type", itemKindLabel(kind)],
      ["Status", actionStatusLabel(text(item.status) || "open")],
    ];
    if (kind !== "note") {
      pairs.push(["Importance", actionPriorityLabel(text(item.priority) || "low")]);
      pairs.push(["Due date", formatDate(text(item.due_date) || null)]);
    }
    pairs.push(["Posted as", display(item.posted_as)]);
    if (predId) {
      pairs.push([
        "Depends on",
        titleById.get(predId) ?? `Task #${predId}`,
      ]);
    }
    pairs.push(["Created", formatDateTime(text(item.created_at) || null)]);
    pairs.push(["Updated", formatDateTime(text(item.updated_at) || null)]);
    blocks.push(kvTable(pairs));
    blocks.push(spacer());
    const details = text(item.details);
    if (details) {
      blocks.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [run("Details", { bold: true, color: MUTED, size: 18 })],
        }),
      );
      blocks.push(...paragraphsFromMultiline(details));
    }
    const comments = updatesByItem.get(id) ?? [];
    if (comments.length) {
      blocks.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [run("Comments", { bold: true, color: MUTED, size: 18 })],
        }),
      );
      for (const comment of comments) {
        const who = display(comment.posted_as, "Team");
        const when = formatDateTime(text(comment.created_at) || null);
        blocks.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [run(`${who}  ·  ${when}`, { italics: true, color: MUTED, size: 18 })],
          }),
        );
        blocks.push(...paragraphsFromMultiline(text(comment.body) || "—"));
      }
    }
  };

  if (actions.length) {
    blocks.push(heading3("Tasks"));
    actions.forEach((item, i) => renderItem(item, i + 1));
  } else {
    blocks.push(muted("No tasks for this department."));
  }
  if (notesItems.length) {
    blocks.push(heading3("Notes"));
    notesItems.forEach((item, i) => renderItem(item, i + 1));
  }
  return blocks;
}

function buildRoc(
  roc: Record<string, unknown>,
  tables: RestoreTables,
  titleById: Map<number, string>,
  updatesByItem: Map<number, Record<string, unknown>[]>,
): (Paragraph | Table)[] {
  const id = asId(roc.id);
  const number = display(roc.roc_number, `ROC ${id}`);
  const title = display(roc.title, "Untitled");
  const depts = rowsOf(tables, "department_statuses").filter(
    (row) => asId(row.roc_id) === id,
  );
  const deptByKey = new Map(depts.map((row) => [text(row.department), row]));
  const items = rowsOf(tables, "action_items")
    .filter((row) => asId(row.roc_id) === id)
    .sort((a, b) => asId(a.id) - asId(b.id));
  const itemsByDept = new Map<string, Record<string, unknown>[]>();
  for (const item of items) {
    const key = text(item.department);
    const list = itemsByDept.get(key) ?? [];
    list.push(item);
    itemsByDept.set(key, list);
  }
  const attachments = rowsOf(tables, "roc_attachments").filter(
    (row) => asId(row.roc_id) === id,
  );
  const meetings = rowsOf(tables, "roc_meetings").filter(
    (row) => asId(row.roc_id) === id,
  );
  const documents = rowsOf(tables, "roc_documents").filter(
    (row) => asId(row.roc_id) === id,
  );

  const blocks: (Paragraph | Table)[] = [
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
    ...buildAttachments(attachments),
  ];

  if (meetings.length) {
    blocks.push(heading2("Meetings"));
    blocks.push(
      gridTable(
        ["Date", "Notes"],
        meetings.map((row) => [
          formatDate(text(row.meeting_date) || null),
          display(row.notes),
        ]),
      ),
    );
  }
  if (documents.length) {
    blocks.push(heading2("Documents log"));
    blocks.push(
      gridTable(
        ["Title", "Kind", "Required", "Completed"],
        documents.map((row) => [
          display(row.title),
          display(row.kind),
          formatDate(text(row.date_required) || null),
          formatDate(text(row.date_completed) || null),
        ]),
      ),
    );
  }

  blocks.push(heading2("Departments"));
  let deptBlocks = 0;
  for (const dept of DEPARTMENTS) {
    const section = buildDepartment(
      dept.key,
      deptByKey.get(dept.key),
      itemsByDept.get(dept.key) ?? [],
      updatesByItem,
      titleById,
    );
    if (section.length) {
      deptBlocks += 1;
      blocks.push(...section);
    }
  }
  if (!deptBlocks) {
    blocks.push(muted("No department work recorded on this project."));
  }
  return blocks;
}

export async function buildRestoreDocxBase64(
  tables: RestoreTables,
  meta: RestoreDocMeta,
): Promise<{ filename: string; base64: string }> {
  const rocs = sortRocs(rowsOf(tables, "rocs"));
  const titleById = new Map<number, string>();
  for (const item of rowsOf(tables, "action_items")) {
    titleById.set(asId(item.id), display(item.title, `Task #${asId(item.id)}`));
  }
  const updatesByItem = new Map<number, Record<string, unknown>[]>();
  for (const update of rowsOf(tables, "action_updates")) {
    const id = asId(update.action_item_id);
    const list = updatesByItem.get(id) ?? [];
    list.push(update);
    updatesByItem.set(id, list);
  }

  const toc: Paragraph[] = [
    heading2("Table of contents"),
    tocLink("contacts", "Team contacts"),
    tocLink("notices", "Notification settings"),
    ...rocs.map((roc) =>
      tocLink(
        `roc-${asId(roc.id)}`,
        `${display(roc.roc_number)}  ·  ${display(roc.title, "Untitled")}${
          asBool(roc.single_project) ? "  ·  Project" : ""
        }`,
      ),
    ),
  ];

  const children: (Paragraph | Table)[] = [
    ...buildCover(meta, rocs.length),
    ...toc,
    pageBreak(),
    ...buildContacts(tables),
    spacer(),
    ...buildNotices(tables),
  ];
  for (const roc of rocs) {
    children.push(...buildRoc(roc, tables, titleById, updatesByItem));
  }

  const doc = new Document({
    creator: "ROC Tracker",
    title: `ROC Tracker restore — ${formatDate(meta.day)}`,
    description: meta.summary,
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: INK },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: STEEL, space: 6 },
                },
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "ROC TRACKER  ·  RESTORE ARCHIVE",
                    font: "Calibri",
                    size: 16,
                    bold: true,
                    color: STEEL,
                    characterSpacing: 80,
                  }),
                  new TextRun({
                    text: `          ${formatDate(meta.day)}`,
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 6 },
                },
                children: [
                  new TextRun({
                    text: "Keep this file — it is the readable copy of the tracker    ",
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                    italics: true,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Calibri",
                    size: 16,
                    color: STEEL,
                  }),
                  new TextRun({
                    text: " / ",
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: "Calibri",
                    size: 16,
                    color: STEEL,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const base64 = await Packer.toBase64String(doc);
  const filename = `ROC-Tracker-Restore-${text(meta.day) || "snapshot"}.docx`;
  return { filename, base64 };
}
