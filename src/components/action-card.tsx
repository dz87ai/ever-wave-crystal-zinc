import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, MessageSquare, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addActionUpdate,
  deleteActionItem,
  updateActionItem,
} from "@/lib/roc/api";
import {
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  departmentLabel,
} from "@/lib/roc/constants";
import type { ActionItemWithUpdates } from "@/lib/roc/types";
import { wouldCreateCycle } from "@/lib/roc/gantt";
import { useIdentity } from "@/lib/roc/identity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatDate, isDueOverdue } from "@/lib/roc/format";
import { cn } from "@/lib/utils";

export function ActionCard({
  item,
  rocId,
  focused = false,
  projectItems,
}: {
  item: ActionItemWithUpdates;
  rocId: number;
  focused?: boolean;
  projectItems: ActionItemWithUpdates[];
}) {
  const postedAs = useIdentity((s) => s.postedAs);
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [showThread, setShowThread] = useState(item.updates.length > 0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [successor, setSuccessor] = useState(item.predecessor_id != null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDetails, setEditDetails] = useState(item.details);
  const [editDue, setEditDue] = useState(item.due_date ?? "");
  const [editPriority, setEditPriority] = useState(item.priority);
  const [editSuccessor, setEditSuccessor] = useState(item.predecessor_id != null);
  const [editPred, setEditPred] = useState<number | null>(item.predecessor_id);

  useEffect(() => {
    setSuccessor(item.predecessor_id != null);
  }, [item.predecessor_id]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["roc", rocId] });
    void queryClient.invalidateQueries({ queryKey: ["rocs"] });
    void queryClient.invalidateQueries({ queryKey: ["open-actions"] });
    void queryClient.invalidateQueries({ queryKey: ["activity"] });
  };

  const patch = useMutation({
    mutationFn: (data: Parameters<typeof updateActionItem>[0]["data"]) =>
      updateActionItem({ data }),
    onSuccess: (result) => {
      invalidate();
      if (result.noticesSent) {
        toast.success(
          result.noticesSent === 1
            ? "Late-task notice emailed"
            : `${result.noticesSent} late-task notices emailed`,
        );
      } else if (result.noticeError) {
        toast.error(result.noticeError);
      }
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Update failed"),
  });

  const comment = useMutation({
    mutationFn: () =>
      addActionUpdate({
        data: { actionItemId: item.id, body, postedAs },
      }),
    onSuccess: () => {
      setBody("");
      setShowThread(true);
      invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not post"),
  });

  const remove = useMutation({
    mutationFn: () => deleteActionItem({ data: { id: item.id } }),
    onSuccess: () => {
      setConfirmDelete(false);
      toast.success(item.kind === "note" ? "Note removed" : "Action removed");
      invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not delete"),
  });

  const done = item.status === "complete";
  const overdue = isDueOverdue(item.due_date, done);
  const isNote = item.kind === "note";
  const predecessors = projectItems.filter(
    (other) =>
      other.id !== item.id &&
      other.kind !== "note" &&
      !wouldCreateCycle(projectItems, item.id, other.id),
  );
  const predecessor = projectItems.find((other) => other.id === item.predecessor_id);

  function startEdit() {
    setEditTitle(item.title);
    setEditDetails(item.details);
    setEditDue(item.due_date ?? "");
    setEditPriority(item.priority);
    setEditSuccessor(item.predecessor_id != null);
    setEditPred(item.predecessor_id);
    setEditing(true);
  }

  function saveEdit() {
    if (!editTitle.trim()) {
      toast.error(isNote ? "Note cannot be empty" : "Title is required");
      return;
    }
    if (!isNote && editSuccessor && !editPred) {
      toast.error("Pick the task this comes after");
      return;
    }
    patch.mutate(
      {
        id: item.id,
        title: editTitle.trim(),
        details: isNote ? "" : editDetails,
        dueDate: isNote ? null : editDue || null,
        priority: isNote ? "low" : editPriority,
        predecessorId: isNote || !editSuccessor ? null : editPred,
      },
      {
        onSuccess: () => {
          setEditing(false);
          setSuccessor(Boolean(!isNote && editSuccessor && editPred));
          toast.success(isNote ? "Note updated" : "Action updated");
        },
      },
    );
  }

  return (
    <article
      id={`action-${item.id}`}
      className={cn(
        "scroll-mt-24 rounded-lg border border-border bg-card p-4 shadow-panel",
        isNote && "border-l-2 border-l-primary/50",
        focused && "ring-2 ring-primary/70 ring-offset-2 ring-offset-background",
      )}
    >
      <div className="flex flex-wrap items-start gap-2">
        <Badge variant={isNote ? "muted" : item.priority === "high" ? "high" : "low"}>
          {isNote ? "Note" : item.priority === "high" ? "High" : "Low"}
        </Badge>
        {editing ? (
          <div className="min-w-0 flex-1">
            {isNote ? (
              <Textarea
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                aria-label="Note"
                className="min-h-20"
              />
            ) : (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                aria-label="Title"
              />
            )}
          </div>
        ) : isNote ? (
          <p className="min-w-0 flex-1 text-sm leading-relaxed">{item.title}</p>
        ) : (
          <h3
            className={cn(
              "min-w-0 flex-1 text-sm font-medium",
              done && "text-muted-foreground line-through",
            )}
          >
            {item.title}
          </h3>
        )}
        <div className="ml-auto flex items-center gap-1">
          {editing ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={patch.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveEdit}
                disabled={patch.isPending}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={startEdit}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
              {!isNote && !done ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={patch.isPending}
                  onClick={() =>
                    patch.mutate(
                      { id: item.id, status: "complete" },
                      { onSuccess: () => toast.success("Marked complete") },
                    )
                  }
                >
                  <Check className="size-3.5" />
                  Mark complete
                </Button>
              ) : null}
              {!isNote && done ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={patch.isPending}
                  onClick={() =>
                    patch.mutate(
                      { id: item.id, status: "open" },
                      { onSuccess: () => toast.success("Reopened") },
                    )
                  }
                >
                  <RotateCcw className="size-3.5" />
                  Reopen
                </Button>
              ) : null}
            </>
          )}
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center text-muted-foreground hover:text-destructive"
            aria-label={isNote ? "Remove note" : "Remove action"}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      {!isNote && editing ? (
        <div className="mt-3 grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor={`edit-details-${item.id}`}>Details</Label>
            <Textarea
              id={`edit-details-${item.id}`}
              value={editDetails}
              onChange={(e) => setEditDetails(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor={`edit-due-${item.id}`}>Due date</Label>
              <Input
                id={`edit-due-${item.id}`}
                type="date"
                value={editDue}
                onChange={(e) => setEditDue(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Importance</Label>
              <Select
                value={editPriority}
                onValueChange={(value) =>
                  setEditPriority(value as (typeof ACTION_PRIORITIES)[number]["key"])
                }
              >
                <SelectTrigger className="h-9 text-xs" aria-label="Priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_PRIORITIES.map((p) => (
                    <SelectItem key={p.key} value={p.key}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2 rounded-md bg-secondary/40 p-3">
            <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={editSuccessor}
                onChange={(e) => {
                  const on = e.target.checked;
                  setEditSuccessor(on);
                  if (!on) setEditPred(null);
                }}
              />
              Successor task
            </label>
            {editSuccessor ? (
              <div className="grid gap-1.5">
                <Label htmlFor={`edit-pred-${item.id}`}>Comes after</Label>
                {predecessors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No other actions in this project yet.
                  </p>
                ) : (
                  <Select
                    value={editPred ? String(editPred) : undefined}
                    onValueChange={(value) => setEditPred(Number(value))}
                  >
                    <SelectTrigger
                      id={`edit-pred-${item.id}`}
                      className="h-9 text-xs"
                      aria-label="Preceding task"
                    >
                      <SelectValue placeholder="Select the task before this one" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[min(24rem,70vh)]">
                      {predecessors.map((other) => (
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
        </div>
      ) : null}
      {!isNote && !editing && item.details ? (
        <p className="mt-2 text-sm text-muted-foreground">{item.details}</p>
      ) : null}
      <p className="mt-2 font-mono text-[0.65rem] text-muted-foreground">
        Logged by {item.posted_as} · {formatDate(item.created_at)}
      </p>

      {!isNote && !editing ? (
        <>
          {!done && item.due_date ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 font-mono text-[0.65rem]",
                overdue ? "text-status-high" : "text-muted-foreground",
              )}
            >
              <CalendarDays className="size-3.5" />
              {overdue ? "Overdue" : "Due"} {formatDate(item.due_date)}
            </p>
          ) : null}

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Select
              value={item.priority}
              onValueChange={(value) =>
                patch.mutate({
                  id: item.id,
                  priority: value as (typeof ACTION_PRIORITIES)[number]["key"],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs" aria-label="Priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_PRIORITIES.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={item.status}
              onValueChange={(value) =>
                patch.mutate({
                  id: item.id,
                  status: value as (typeof ACTION_STATUSES)[number]["key"],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs" aria-label="Action status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_STATUSES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-1">
              <Label htmlFor={`due-${item.id}`} className="sr-only">
                Due date
              </Label>
              <Input
                id={`due-${item.id}`}
                type="date"
                value={item.due_date ?? ""}
                onChange={(e) =>
                  patch.mutate({
                    id: item.id,
                    dueDate: e.target.value || null,
                  })
                }
                className="h-9 text-xs"
                aria-label="Due date"
              />
            </div>
          </div>

          <div className="mt-3 grid gap-2 rounded-md bg-secondary/40 p-3">
            <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={successor}
                onChange={(e) => {
                  const on = e.target.checked;
                  setSuccessor(on);
                  if (!on && item.predecessor_id) {
                    patch.mutate({ id: item.id, predecessorId: null });
                  }
                }}
              />
              Successor task
            </label>
            {successor ? (
              <div className="grid gap-1.5">
                <Label htmlFor={`pred-${item.id}`}>Comes after</Label>
                {predecessors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No other actions in this project yet.
                  </p>
                ) : (
                  <Select
                    value={item.predecessor_id ? String(item.predecessor_id) : undefined}
                    onValueChange={(value) =>
                      patch.mutate({
                        id: item.id,
                        predecessorId: Number(value),
                      })
                    }
                  >
                    <SelectTrigger
                      id={`pred-${item.id}`}
                      className="h-9 text-xs"
                      aria-label="Preceding task"
                    >
                      <SelectValue placeholder="Select the task before this one" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[min(24rem,70vh)]">
                      {predecessors.map((other) => (
                        <SelectItem key={other.id} value={String(other.id)}>
                          {departmentLabel(other.department)} · {other.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {predecessor ? (
                  <p className="font-mono text-[0.65rem] text-muted-foreground">
                    Starts after {predecessor.title}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setShowThread((v) => !v)}
          >
            <MessageSquare className="size-3.5" />
            {item.updates.length
              ? `${item.updates.length} update${item.updates.length === 1 ? "" : "s"}`
              : "Add a follow-up"}
          </button>

          {showThread ? (
            <div className="mt-3 grid gap-3">
              {item.updates.length ? (
                <ol className="grid gap-2 border-l border-border pl-3">
                  {item.updates.map((update) => (
                    <li key={update.id} className="text-sm">
                      <p className="font-mono text-[0.65rem] text-muted-foreground">
                        {update.posted_as} · {formatDate(update.created_at)}
                      </p>
                      <p className="text-foreground">{update.body}</p>
                    </li>
                  ))}
                </ol>
              ) : null}
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Follow-up question or status note…"
                className="min-h-20"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!body.trim() || comment.isPending}
                  onClick={() => comment.mutate()}
                >
                  Post update
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isNote ? "Delete this note?" : "Delete this action?"}
            </DialogTitle>
            <DialogDescription>
              {item.title.trim()
                ? `“${item.title.trim()}” will be removed. This cannot be undone.`
                : "This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={remove.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
