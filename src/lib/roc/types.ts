import type {
  ActionPriority,
  ActionStatus,
  DepartmentKey,
  DeptStatusKey,
  ItemKind,
  DocKind,
  RocStatus,
} from "./constants";

export type RocRow = {
  id: number;
  roc_number: string;
  title: string;
  description: string;
  overall_status: RocStatus;
  critical_release_date: string | null;
  actual_release_date: string | null;
  release_description: string;
  implementation_notes: string;
  additional_notes: string;
  affected_projects: string;
  deadline: string | null;
  single_project: boolean;
  project_name: string;
  created_at: string;
  updated_at: string;
};

export type MeetingRow = {
  id: number;
  roc_id: number;
  meeting_date: string;
  notes: string;
  created_at: string;
};

export type DocumentRow = {
  id: number;
  roc_id: number;
  title: string;
  kind: DocKind;
  date_required: string | null;
  date_completed: string | null;
  created_at: string;
};

export type AttachmentRow = {
  id: number;
  roc_id: number;
  filename: string;
  mime: string;
  extract_text: string;
  created_at: string;
};

export type AttachmentListItem = AttachmentRow & {
  has_content: boolean;
};

export type DepartmentStatusRow = {
  id: number;
  roc_id: number;
  department: DepartmentKey;
  status: DeptStatusKey;
  notes: string;
};

export type ActionItemRow = {
  id: number;
  roc_id: number;
  department: DepartmentKey;
  title: string;
  details: string;
  kind: ItemKind;
  due_date: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  posted_as: string;
  predecessor_id: number | null;
  created_at: string;
  updated_at: string;
};

export type ActionUpdateRow = {
  id: number;
  action_item_id: number;
  body: string;
  posted_as: string;
  created_at: string;
};

export type DeptCell = {
  department: DepartmentKey;
  status: DeptStatusKey;
  notes: string;
  openCount: number;
  highOpen: number;
  lateCount: number;
  actionCount: number;
  allComplete: boolean;
  waiting: boolean;
};

export type RocSummary = RocRow & {
  departments: DeptCell[];
  openActions: number;
  highOpen: number;
};

export type ActionItemWithUpdates = ActionItemRow & {
  updates: ActionUpdateRow[];
};

export type OpenActionItem = {
  id: number;
  roc_id: number;
  roc_number: string;
  roc_title: string;
  department: DepartmentKey;
  title: string;
  details: string;
  kind: ItemKind;
  due_date: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  posted_as: string;
  predecessor_id: number | null;
  blocked: boolean;
  predecessor_title: string | null;
  created_at: string;
  updated_at: string;
};

export type RocDetail = {
  roc: RocRow;
  departments: DepartmentStatusRow[];
  actionItems: ActionItemWithUpdates[];
  attachments: AttachmentListItem[];
};

export type CreateRocInput = {
  rocNumber: string;
  title: string;
  description: string;
  overallStatus?: RocStatus;
  criticalReleaseDate?: string | null;
  actualReleaseDate?: string | null;
  releaseDescription?: string;
  implementationNotes?: string;
  additionalNotes?: string;
  affectedProjects?: string;
  deadline?: string | null;
  singleProject?: boolean;
  projectName?: string;
  attachment?: {
    filename: string;
    mime: string;
    extractText: string;
  } | null;
};

export type ActivityKind =
  | "roc_created"
  | "action_created"
  | "note_created"
  | "action_completed"
  | "action_reopened"
  | "follow_up";

export type ActivityEvent = {
  id: number;
  occurred_at: string;
  kind: ActivityKind;
  roc_id: number;
  roc_number: string;
  roc_title: string;
  action_item_id: number | null;
  department: DepartmentKey | null;
  title: string;
  details: string;
  posted_as: string;
};

export type DepartmentContact = {
  department: DepartmentKey;
  contact_name: string;
  email: string;
  phone: string;
  role: string;
};

