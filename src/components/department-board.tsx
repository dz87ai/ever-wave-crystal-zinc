import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { addActionItem, setDepartmentStatus } from "@/lib/roc/api";
import {
  DEPARTMENTS,
  DEPT_STATUSES,
  departmentLabel,
  type DepartmentKey,
  type DeptStatusKey,
  type ItemKind,
} from "@/lib/roc/constants";
import type { ActionItemWithUpdates, DepartmentStatusRow } from "@/lib/roc/types";
import { useIdentity } from "@/lib/roc/identity";
import { deptCellTone, deptDotClass } from "@/lib/roc/status-style";
import { deptStatusLabel } from "@/lib/roc/format";
import { cn } from "@/lib/utils";
import { ActionCard } from "@/components/action-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DepartmentBoard({
  rocId,
  departments,
  actionItems,
  selected,
  focusItemId,
  onSelect,
}: {
  rocId: number;
  departments: DepartmentStatusRow[];
  actionItems: ActionItemWithUpdates[];
  selected: DepartmentKey;
  focusItemId?: number;
  onSelect: (key: DepartmentKey) => void;
}) {
  const postedAs = useIdentity((s) => s.postedAs);
  const queryClient = useQueryClient();
  const current = departments.find((d) => d.department === selected);
  const items = actionItems.filter((a) => a.department === selected);
  const meta = DEPARTMENTS.find((d) => d.key === selected);

  useEffect(() => {
    if (!focusItemId) return;
    let cancelled = false;
    const scroll = () => {
      if (cancelled) return;
      const el = document.getElementById(`action-${focusItemId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const frame = window.requestAnimationFrame(scroll);
    const timer = window.setTimeout(scroll, 160);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [focusItemId, selected, items.length]);

  const [entryKind, setEntryKind] = useState<ItemKind>("action");
  const [title, setTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [details, setDetails] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"high" | "low">("low");
  const [successor, setSuccessor] = useState(false);
  const [predecessorId, setPredecessorId] = useState<number | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["roc", rocId] });
    void queryClient.invalidateQueries({ queryKey: ["rocs"] });
    void queryClient.invalidateQueries({ queryKey: ["open-actions"] });
    void queryClient.invalidateQueries({ queryKey: ["activity"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: DeptStatusKey) =>
      setDepartmentStatus({
        data: { rocId, department: selected, status },
      }),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not update status"),
  });

  const notesMutation = useMutation({
    mutationFn: (notes: string) =>
      setDepartmentStatus({
        data: {
          rocId,
          department: selected,
          status: current?.status ?? "not_started",
          notes,
        },
      }),
    onSuccess: () => {
      toast.success("Department notes saved");
      invalidate();
    },
  });

  const addMutation = useMutation({
    mutationFn: () =>
      addActionItem({
        data: {
          rocId,
          department: selected,
          title: (entryKind === "note" ? noteBody : title).trim(),
          details: entryKind === "note" ? "" : details,
          kind: entryKind,
          dueDate: entryKind === "action" && dueDate ? dueDate : null,
          priority: entryKind === "note" ? "low" : priority,
          postedAs,
          predecessorId:
            entryKind === "action" && successor ? predecessorId : null,
        },
      }),
    onSuccess: (result) => {
      setTitle("");
      setNoteBody("");
      setDetails("");
      setDueDate("");
      setPriority("low");
      setSuccessor(false);
      setPredecessorId(null);
      toast.success(entryKind === "note" ? "Note added" : "Action item added");
      if (result.noticesSent) {
        toast.success(
          result.noticesSent === 1
            ? "Late-task notice emailed"
            : `${result.noticesSent} late-task notices emailed`,
        );
      } else if (result.noticeError) {
        toast.error(result.noticeError);
      }
      invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not add item"),
  });

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of actionItems) {
      if (item.kind === "note" || item.status === "complete") continue;
      map.set(item.department, (map.get(item.department) ?? 0) + 1);
    }
    return map;
  }, [actionItems]);

  const [notes, setNotes] = useState(current?.notes ?? "");
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    setNotes(current?.notes ?? "");
  }, [selected, current?.notes]);

  useEffect(() => {
    setNotesOpen(false);
  }, [selected]);

  const canSubmit =
    entryKind === "note"
      ? noteBody.trim().length > 0
      : title.trim().length > 0 && (!successor || predecessorId != null);

  const predecessorOptions = actionItems.filter((item) => item.kind !== "note");

  return (
    <section className="grid gap-4">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {DEPARTMENTS.map((dept) => {
          const row = departments.find((d) => d.department === dept.key);
          const active = dept.key === selected;
          const open = counts.get(dept.key) ?? 0;
          return (
            <button
              key={dept.key}
              type="button"
              onClick={() => {
                onSelect(dept.key);
                setNotes(row?.notes ?? "");
              }}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors",
                active
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  deptDotClass(row?.status ?? "not_started"),
                )}
              />
              <span className="font-medium">{dept.short}</span>
              {open ? (
                <span className="font-mono text-[0.65rem] text-muted-foreground">
                  {open}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-panel sm:p-5">
        <div className="overflow-hidden rounded-md border border-border">
          <button
            type="button"
            aria-expanded={notesOpen}
            aria-controls="dept-notes-panel"
            onClick={() => setNotesOpen((open) => !open)}
            className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
          >
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                notesOpen ? "rotate-0" : "-rotate-90",
              )}
              aria-hidden
            />
            <span className="font-medium">Department notes and status</span>
            <span className="ml-auto truncate text-xs text-muted-foreground">
              {deptStatusLabel(current?.status ?? "not_started")}
            </span>
          </button>
          {notesOpen ? (
            <div id="dept-notes-panel" className="border-t border-border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{meta?.label}</h2>
                  <p className="text-sm text-muted-foreground">
                    Actions with due dates, or a simple note for this department.
                  </p>
                </div>
                <Select
                  value={current?.status ?? "not_started"}
                  onValueChange={(value) =>
                    statusMutation.mutate(value as DeptStatusKey)
                  }
                >
                  <SelectTrigger className="w-full sm:w-56" aria-label="Department status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPT_STATUSES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 grid gap-1.5">
                <Label htmlFor="dept-notes">Department notes</Label>
                <Textarea
                  id="dept-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Implementation notes visible to the whole team"
                  className="min-h-20"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={notesMutation.isPending || notes === (current?.notes ?? "")}
                    onClick={() => notesMutation.mutate(notes)}
                  >
                    Save notes
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          {items.length === 0 ? (
            <p className="rounded-md bg-secondary/60 px-3 py-4 text-sm text-muted-foreground">
              Nothing logged yet. Add an action or a note below.
            </p>
          ) : (
            items.map((item) => (
              <ActionCard
                key={item.id}
                item={item}
                rocId={rocId}
                focused={item.id === focusItemId}
                projectItems={actionItems}
              />
            ))
          )}
        </div>

        <form
          className="mt-6 grid gap-3 rounded-md bg-secondary/50 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            addMutation.mutate();
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">Add to this department</p>
            <Tabs
              value={entryKind}
              onValueChange={(value) => setEntryKind(value as ItemKind)}
            >
              <TabsList className="h-10 w-full sm:w-auto">
                <TabsTrigger value="action" className="min-h-8 flex-1 sm:flex-none">
                  Action
                </TabsTrigger>
                <TabsTrigger value="note" className="min-h-8 flex-1 sm:flex-none">
                  Note
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {entryKind === "action" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem]">
                <div className="grid gap-1.5">
                  <Label htmlFor="action-title">Title</Label>
                  <Input
                    id="action-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What does this department need to do?"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="action-due">Due date</Label>
                  <Input
                    id="action-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Importance</Label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as "high" | "low")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High importance</SelectItem>
                      <SelectItem value="low">Low importance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="action-details">Details</Label>
                <Textarea
                  id="action-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Context, constraints, or the question you need answered"
                />
              </div>
              <div className="grid gap-2 rounded-md bg-card/80 p-3">
                <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={successor}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setSuccessor(on);
                      if (!on) setPredecessorId(null);
                    }}
                  />
                  Successor task
                </label>
                {successor ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-pred">Comes after</Label>
                    {predecessorOptions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No other actions in this project yet.
                      </p>
                    ) : (
                      <Select
                        value={predecessorId ? String(predecessorId) : undefined}
                        onValueChange={(value) => setPredecessorId(Number(value))}
                      >
                        <SelectTrigger
                          id="new-pred"
                          className="h-9 text-xs"
                          aria-label="Preceding task"
                        >
                          <SelectValue placeholder="Select the task before this one" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[min(24rem,70vh)]">
                          {predecessorOptions.map((other) => (
                            <SelectItem key={other.id} value={String(other.id)}>
                              {departmentLabel(other.department)} · {other.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="grid gap-1.5">
              <Label htmlFor="note-body">Note</Label>
              <Textarea
                id="note-body"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="A meeting takeaway, decision, or anything worth recording"
                className="min-h-24"
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={!canSubmit || addMutation.isPending}>
              {entryKind === "note" ? "Add note" : "Add action"}
            </Button>
          </div>
        </form>
      </div>

      {current?.status === "na" ? (
        <p className={cn("text-sm text-muted-foreground", deptCellTone("na"))}>
          Marked {deptStatusLabel("na")} — still available if something comes up.
        </p>
      ) : null}
    </section>
  );
}
