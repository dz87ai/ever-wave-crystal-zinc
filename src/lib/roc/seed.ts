import { DEPARTMENTS } from "./constants";
import type {
  ActionPriority,
  ActionStatus,
  DepartmentKey,
  DeptStatusKey,
  DocKind,
  ItemKind,
} from "./constants";

type SeedAction = {
  department: DepartmentKey;
  title: string;
  details: string;
  kind?: ItemKind;
  dueDate?: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  postedAs?: string;
  predecessorTitle?: string;
  updates?: { body: string; postedAs: string }[];
};

type SeedDept = {
  department: DepartmentKey;
  status: DeptStatusKey;
  notes: string;
};

type SeedRoc = {
  rocNumber: string;
  title: string;
  description: string;
  overallStatus: string;
  criticalReleaseDate: string | null;
  actualReleaseDate: string | null;
  deadline?: string | null;
  releaseDescription: string;
  implementationNotes: string;
  additionalNotes: string;
  affectedProjects: string;
  meetings: { date: string; notes: string }[];
  documents: {
    title: string;
    kind: DocKind;
    dateRequired: string | null;
    dateCompleted: string | null;
  }[];
  departments: SeedDept[];
  actions: SeedAction[];
};

function na(department: DepartmentKey): SeedDept {
  return { department, status: "na", notes: "N/A" };
}

function actionDept(
  department: DepartmentKey,
  status: DeptStatusKey,
  notes: string,
): SeedDept {
  return { department, status, notes };
}

export const SEED_ROCS: SeedRoc[] = [
  {
    rocNumber: "TBD-001",
    title: "Bulb gasket on F97 / 8560 / 8560HT vent",
    description:
      "Replace flap gasket 84-199 with 86-403 bulb gasket (and 86-403 CRN) on F97 / 8560 / 8560HT vents. Current flap gasket requires mitre cuts and applied adhesive at corner joints which is difficult to control. The bulb gasket provides a better lineal seal and has pre-made corners for proper adhesion and a continuous seal around corners.",
    overallStatus: "in_progress",
    criticalReleaseDate: null,
    actualReleaseDate: null,
    releaseDescription: "Cannot be completed until release has occurred.",
    implementationNotes:
      "Change can only occur on new projects entering production. Bulb gasket does not need to be shown on submitted shop drawings but should be updated on the record set. Standard details to be updated and supplied to the drafting team for implementation on current / new projects.",
    additionalNotes:
      "Flap gasket has been replaced by bulb gasket in PIP documents, but may cause confusion with current production as the change has not yet taken effect. No clear instruction noted regarding delayed implementation / reference by production.",
    affectedProjects: "TBD",
    meetings: [
      {
        date: "2026-06-24",
        notes:
          "Discussion occurred with management team during bi-weekly New Products Meeting. Bulb gasket was previously tested internally for air / water / force of operation. Air leakage reduced by 40%. No water leakage identified. Force of operation improved (15% reduction).",
      },
      {
        date: "2026-07-22",
        notes:
          "Discussion occurred with management team during bi-weekly New Products Meeting. Determined that changeover will need to occur on new projects entering production only, due to potential risk of the change being identified mid-project on site / needing to replace flap gasket with bulb gasket on lower levels if the change was identified.",
      },
    ],
    documents: [
      {
        title: "Master Excel File — Design",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "ROC Sketch",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "Vent Department Training — Gasket Usage",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "PIP 1.02.09 — 8560/F97 Std & HT Gen Vent Info",
        kind: "released",
        dateRequired: null,
        dateCompleted: "2026-07-21",
      },
      {
        title: "PIP 1.02.10 — 8560/F97 Std & HT Vent Frame",
        kind: "released",
        dateRequired: null,
        dateCompleted: "2026-07-21",
      },
      {
        title: "PIP 1.02.11 — 8560/F97 Std & HT Vent Sash",
        kind: "released",
        dateRequired: null,
        dateCompleted: "2026-07-21",
      },
    ],
    departments: [
      na("sales"),
      actionDept(
        "estimating",
        "low_action",
        "Part number / pricing update required (only minor difference expected).",
      ),
      na("pre_construction"),
      na("project_management"),
      na("winporte"),
      actionDept("design", "follow_up", "See outstanding documents list."),
      na("engineering"),
      actionDept(
        "drafting",
        "low_action",
        "Implement new details on all new / existing projects once supplied by the design team.",
      ),
      actionDept(
        "breakdown",
        "low_action",
        "All newly generated MTOs are to show 86-403 / 86-403CRN in place of 84-199 related to 8560 / 8560HT vent components.",
      ),
      actionDept(
        "scheduling",
        "high_action",
        "Identify the next project to enter production / date to enter production.",
      ),
      actionDept(
        "purchasing",
        "low_action",
        "Need to determine unused 84-199 that will remain in stock after 86-403 changeover, and what to do with remaining stock.",
      ),
      na("cnc"),
      actionDept(
        "fabrication",
        "high_action",
        "All 8560 series vents entering production after the specified date (supplied by scheduling) receive gasket 86-403 in place of 84-199. Both 84-199 and 86-403 will be used in the vent assembly area simultaneously. Training required.",
      ),
      actionDept(
        "quality",
        "high_action",
        "Correct gasket usage per project needs to be tracked / enforced.",
      ),
      na("installation"),
      actionDept(
        "service",
        "low_action",
        "Need to be aware that 86-403 will be required for gasket replacement for vent frames manufactured after the agreed-upon date (supplied by scheduling).",
      ),
    ],
    actions: [
      {
        department: "estimating",
        title: "Update part number and pricing for 86-403",
        details:
          "Only a minor difference is expected versus 84-199. Confirm the new part number and pricing are reflected in estimating.",
        priority: "low",
        status: "open",
        dueDate: "2026-09-15",
        postedAs: "Engineering",
      },
      {
        department: "design",
        title: "Close outstanding design documents",
        details:
          "Master Excel File — Design, ROC Sketch, and Vent Department Training still outstanding. PIPs 1.02.09 / 1.02.10 / 1.02.11 were released 21 Jul 2026.",
        priority: "high",
        status: "in_progress",
        dueDate: "2026-09-05",
        postedAs: "Design",
        updates: [
          {
            body: "PIP documents updated to show bulb gasket. Remaining risk: production may follow the PIP before the agreed changeover date.",
            postedAs: "Design",
          },
        ],
      },
      {
        department: "design",
        title:
          "24 Jun New Products Meeting: bulb gasket previously tested internally. Air leakage down 40%, no water leakage, force of operation improved 15%.",
        details: "",
        kind: "note",
        priority: "low",
        status: "open",
        postedAs: "Design",
      },
      {
        department: "drafting",
        title: "Implement new gasket details on projects",
        details:
          "Once design supplies updated standard details, apply them on all new and existing projects. Shop drawings do not need to show the bulb gasket; record sets should.",
        priority: "low",
        status: "open",
        postedAs: "Drafting",
      },
      {
        department: "breakdown",
        title: "Show 86-403 / 86-403CRN on new MTOs",
        details:
          "All newly generated MTOs related to 8560 / 8560HT vent components should list 86-403 / 86-403CRN in place of 84-199.",
        priority: "low",
        status: "open",
        postedAs: "Breakdown",
      },
      {
        department: "scheduling",
        title: "Name the first production project for changeover",
        details:
          "Change can only occur on new projects entering production. Identify the next project and date so assembly, quality, and service can plan dual-gasket usage.",
        priority: "high",
        status: "follow_up",
        dueDate: "2026-08-20",
        postedAs: "Engineering",
        updates: [
          {
            body: "Waiting on scheduling to confirm the first job that should receive 86-403. Until then assembly cannot freeze the 84-199 list.",
            postedAs: "Fabrication",
          },
        ],
      },
      {
        department: "purchasing",
        title: "Estimate leftover 84-199 after changeover",
        details:
          "Work with estimating to determine unused 84-199 that will remain in stock after the 86-403 changeover.",
        priority: "low",
        status: "open",
        postedAs: "Purchasing",
      },
      {
        department: "purchasing",
        title: "Disposition remaining 84-199 stock",
        details:
          "Decide what happens to remaining 84-199 once 86-403 is the production gasket.",
        priority: "low",
        status: "open",
        postedAs: "Purchasing",
      },
      {
        department: "fabrication",
        title: "Train vent assembly on dual gasket usage",
        details:
          "After the scheduling date, 8560 series vents receive 86-403 instead of 84-199. Both gaskets will be used simultaneously. Build the list of ongoing projects that still receive 84-199 and display it in the vent department.",
        priority: "high",
        status: "open",
        dueDate: "2026-09-12",
        postedAs: "Engineering",
      },
      {
        department: "fabrication",
        title:
          "22 Jul: changeover on new projects entering production only — avoid mixed gasket on the same site if the change is identified mid-project.",
        details: "",
        kind: "note",
        priority: "low",
        status: "open",
        postedAs: "Fabrication",
      },
      {
        department: "quality",
        title: "Track and enforce correct gasket per project",
        details:
          "Incorrect gasket usage is a live risk during the dual-gasket window. Need a project-level check in the vent department.",
        priority: "high",
        status: "open",
        postedAs: "Quality",
      },
      {
        department: "service",
        title: "Use 86-403 for replacements after changeover",
        details:
          "Gasket replacement on vent frames manufactured after the agreed-upon date must use 86-403, not 84-199.",
        priority: "low",
        status: "open",
        postedAs: "Service",
      },
    ],
  },
  {
    rocNumber: "TBD-002",
    title: "F97 / 8560 / 8560HT vent frame spacer fit",
    description:
      "85-401 (Std) and 85-406 (HT) have fit issues during installation in the vent department. The part was designed to snap into the vent frame but the fit is too tight. New dies generated: 85-401 replaced by 85-408, 85-406 replaced by 85-409.",
    overallStatus: "in_progress",
    criticalReleaseDate: null,
    actualReleaseDate: null,
    releaseDescription: "Cannot be completed until release has occurred.",
    implementationNotes: "TBD — changeover will occur mid-project.",
    additionalNotes:
      "Parts have been replaced in the PIP documents, but may cause confusion with current production as the change has not yet taken effect. No clear instruction noted regarding delayed implementation / reference by production.",
    affectedProjects: "TBD",
    meetings: [
      {
        date: "2026-05-06",
        notes:
          "No record of discussion. Date taken from the Date Added column of the Quality Meeting Tracker. Notes between 6 May and 6 Aug were taken from that tracker.",
      },
      {
        date: "2026-05-21",
        notes:
          "Possibility of using lubricants was discussed between design / quality, but health and safety concerns prevented the idea from proceeding.",
      },
      {
        date: "2026-06-16",
        notes:
          "New dies have been generated. 85-401 to be replaced by 85-408 / 85-406 to be replaced by 85-409.",
      },
      {
        date: "2026-06-25",
        notes: "Instructions were updated to show the new part design.",
      },
      {
        date: "2026-08-06",
        notes: "Verification required for Winporte implementation.",
      },
    ],
    documents: [
      {
        title: "Master EX Listing",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "ROC Sketch",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "Winporte Updates",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "Master Excel File — Design",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "Machining Diagrams",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "Vent Department Training",
        kind: "outstanding",
        dateRequired: null,
        dateCompleted: null,
      },
      {
        title: "PIP 1.02.09 — 8560/F97 Std & HT Gen Vent Info",
        kind: "released",
        dateRequired: null,
        dateCompleted: "2026-07-21",
      },
      {
        title: "PIP 1.02.10 — 8560/F97 Std & HT Vent Frame",
        kind: "released",
        dateRequired: null,
        dateCompleted: "2026-07-21",
      },
      {
        title: "PIP 1.02.11 — 8560/F97 Std & HT Vent Sash",
        kind: "released",
        dateRequired: null,
        dateCompleted: "2026-07-21",
      },
    ],
    departments: [
      na("sales"),
      actionDept(
        "estimating",
        "low_action",
        "Part numbers to be updated. Pricing does not need to change.",
      ),
      na("pre_construction"),
      na("project_management"),
      actionDept(
        "winporte",
        "follow_up",
        "Needs to be updated. See notes recorded on 16 Jun 2026 for applicable die numbers.",
      ),
      actionDept(
        "design",
        "high_action",
        "See outstanding documents list. Master EX list to be modified to show original PVC components are obsolete and to specify which parts they are being replaced by. Verify that new parts have been properly implemented into Winporte.",
      ),
      na("engineering"),
      actionDept(
        "drafting",
        "low_action",
        "Implement new details on all new / existing projects once supplied by the design team.",
      ),
      actionDept(
        "breakdown",
        "follow_up",
        "Needs to be aware of the change / implementation plan if Winporte update is delayed.",
      ),
      na("scheduling"),
      actionDept(
        "purchasing",
        "high_action",
        "New parts to be ordered / old parts to become obsolete. Deplete 84-501 and 84-508 before using 84-509 / 84-510.",
      ),
      actionDept(
        "cnc",
        "high_action",
        "Modifications required to Head / Jamb / Sill vent perimeter frame assembly. Notch required to allow PVC to slide in from end.",
      ),
      actionDept(
        "fabrication",
        "high_action",
        "Changeover to new material will occur mid-project.",
      ),
      actionDept(
        "quality",
        "low_action",
        "Team to be notified of incoming material change. Ensure parts are installed correctly.",
      ),
      na("installation"),
      na("service"),
    ],
    actions: [
      {
        department: "estimating",
        title: "Update spacer part numbers (pricing unchanged)",
        details: "85-401 → 85-408, 85-406 → 85-409. Pricing does not need to change.",
        priority: "low",
        status: "open",
        postedAs: "Estimating",
      },
      {
        department: "winporte",
        title: "Verify Winporte implementation of new dies",
        details:
          "New dies generated 16 Jun 2026. Verification required as of 6 Aug 2026. Applicable die numbers recorded in the 16 Jun notes.",
        priority: "high",
        status: "follow_up",
        postedAs: "Engineering",
        updates: [
          {
            body: "Please confirm 85-408 and 85-409 are live in Winporte before breakdown starts using them on MTOs.",
            postedAs: "Breakdown",
          },
        ],
      },
      {
        department: "design",
        title: "Mark original PVC components obsolete on Master EX",
        details:
          "Specify which parts they are being replaced by. Confirm new parts are properly implemented in Winporte.",
        priority: "high",
        status: "in_progress",
        postedAs: "Design",
      },
      {
        department: "drafting",
        title: "Apply new spacer details once issued",
        details:
          "Implement new details on all new / existing projects once supplied by the design team.",
        priority: "low",
        status: "open",
        postedAs: "Drafting",
      },
      {
        department: "breakdown",
        title: "Hold MTO change until Winporte is confirmed",
        details:
          "If the Winporte update is delayed, breakdown still needs a clear implementation plan so MTOs do not mix old and new spacers.",
        priority: "low",
        status: "open",
        postedAs: "Breakdown",
      },
      {
        department: "purchasing",
        title: "Order 85-408 / 85-409 and obsolete old parts",
        details: "New parts to be ordered. 85-401 and 85-406 become obsolete.",
        priority: "high",
        status: "open",
        postedAs: "Purchasing",
      },
      {
        department: "purchasing",
        title: "Deplete 84-501 / 84-508 before 84-509 / 84-510",
        details:
          "Stock of 84-501 and 84-508 to be depleted prior to usage of 84-509 / 84-510.",
        priority: "low",
        status: "in_progress",
        postedAs: "Purchasing",
      },
      {
        department: "cnc",
        title: "Add end-slide notch to vent perimeter frame",
        details:
          "Modifications required to Head / Jamb / Sill vent perimeter frame assembly. Notch required to allow PVC to slide in from the end.",
        priority: "high",
        status: "open",
        postedAs: "CNC",
      },
      {
        department: "fabrication",
        title: "Plan mid-project spacer changeover",
        details:
          "Changeover to the new material will occur mid-project. Coordinate with scheduling, materials, and quality so the floor is not mixing parts without a list.",
        priority: "high",
        status: "open",
        postedAs: "Fabrication",
      },
      {
        department: "quality",
        title: "Notify install team and check fit of new spacers",
        details:
          "Team to be notified of incoming material change. Ensure parts are installed correctly.",
        priority: "low",
        status: "open",
        postedAs: "Quality",
      },
    ],
  },
  {
    rocNumber: "TBD-003",
    title: "Test",
    description:
      "Demo ROC for the Gantt chart: a handoff chain from Sales through Design, Pre-Construction, Winporte, and Fabrication.",
    overallStatus: "in_progress",
    criticalReleaseDate: null,
    actualReleaseDate: "2026-08-27",
    deadline: "2026-11-06",
    releaseDescription: "",
    implementationNotes: "",
    additionalNotes:
      "Each task is a successor of the one before it, so the Gantt reads as a staircase across departments.",
    affectedProjects: "",
    meetings: [],
    documents: [],
    departments: [
      actionDept("sales", "in_progress", "Kick off and confirm the change with the customer."),
      na("estimating"),
      actionDept(
        "pre_construction",
        "in_progress",
        "Starts after Design issues the last drawing package.",
      ),
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
      na("service"),
    ],
    actions: [
      {
        department: "sales",
        title: "Test",
        details: "First activity in the demo chain. Unlocks Sales Test 2.",
        priority: "high",
        status: "open",
        dueDate: "2026-09-02",
        postedAs: "Sales",
      },
      {
        department: "sales",
        title: "Test 2",
        details: "Successor of Test. Hands off to Design.",
        priority: "low",
        status: "open",
        dueDate: "2026-09-08",
        postedAs: "Sales",
        predecessorTitle: "Test",
      },
      {
        department: "design",
        title: "Test 3",
        details: "First Design package. Successor of Sales Test 2.",
        priority: "high",
        status: "open",
        dueDate: "2026-09-14",
        postedAs: "Design",
        predecessorTitle: "Test 2",
      },
      {
        department: "design",
        title: "Test 4",
        details: "Second Design package. Successor of Test 3.",
        priority: "low",
        status: "open",
        dueDate: "2026-09-21",
        postedAs: "Design",
        predecessorTitle: "Test 3",
      },
      {
        department: "design",
        title: "Test 5",
        details: "Last Design package. Unlocks Pre-Construction.",
        priority: "low",
        status: "open",
        dueDate: "2026-09-28",
        postedAs: "Design",
        predecessorTitle: "Test 4",
      },
      {
        department: "pre_construction",
        title: "Test 6",
        details: "Successor of Design Test 5. Hands off to Winporte.",
        priority: "low",
        status: "open",
        dueDate: "2026-10-05",
        postedAs: "Pre-Construction",
        predecessorTitle: "Test 5",
      },
      {
        department: "winporte",
        title: "Test 7",
        details: "Successor of Pre-Construction Test 6. Hands off to Fabrication.",
        priority: "low",
        status: "open",
        dueDate: "2026-10-12",
        postedAs: "Winporte",
        predecessorTitle: "Test 6",
      },
      {
        department: "fabrication",
        title: "Test 8",
        details: "Last activity in the demo chain. Successor of Winporte Test 7.",
        priority: "low",
        status: "open",
        dueDate: "2026-10-19",
        postedAs: "Fabrication",
        predecessorTitle: "Test 7",
      },
    ],
  },
];

export function defaultDepartmentRows(): SeedDept[] {
  return DEPARTMENTS.map((d) => ({
    department: d.key,
    status: "not_started" as DeptStatusKey,
    notes: "",
  }));
}

export const SEED_CONTACTS: Partial<
  Record<
    DepartmentKey,
    { contact_name: string; email: string; phone: string; role: string }
  >
> = {
  drafting: {
    contact_name: "Clyde / Justin",
    email: "",
    phone: "",
    role: "Drafting leads",
  },
  breakdown: {
    contact_name: "Manish",
    email: "",
    phone: "",
    role: "Breakdown",
  },
  scheduling: {
    contact_name: "Dimble",
    email: "",
    phone: "",
    role: "Scheduling",
  },
  purchasing: {
    contact_name: "Amit",
    email: "",
    phone: "",
    role: "Purchasing",
  },
};
