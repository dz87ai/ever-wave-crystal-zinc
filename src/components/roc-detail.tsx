import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartGantt, Download, FileUp, Loader2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addAttachment,
  deleteAttachment,
  getAttachment,
  updateRoc,
} from "@/lib/roc/api";
import { ROC_STATUSES, type DepartmentKey } from "@/lib/roc/constants";
import type {
  AttachmentListItem,
  RocDetail as RocDetailData,
} from "@/lib/roc/types";
import { formatDate, rocStatusLabel } from "@/lib/roc/format";
import { rocStatusVariant } from "@/lib/roc/status-style";
import {
  downloadBase64,
  extractFileText,
  fileToBase64,
  MAX_ATTACHMENT_BYTES,
} from "@/lib/roc/extract-file";
import { useOpenTabs } from "@/lib/roc/open-tabs";
import { cn } from "@/lib/utils";
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
import { DepartmentBoard } from "@/components/department-board";
import { GanttChart } from "@/components/gantt-chart";

export function RocDetail({
  data,
  selectedDept,
  focusItemId,
  onSelectDept,
  onFocusItem,
}: {
  data: RocDetailData;
  selectedDept: DepartmentKey;
  focusItemId?: number;
  onSelectDept: (key: DepartmentKey) => void;
  onFocusItem: (id: number, department: DepartmentKey) => void;
}) {
  const { roc } = data;
  const addTab = useOpenTabs((s) => s.add);
  const queryClient = useQueryClient();

  useEffect(() => {
    addTab({ id: roc.id, rocNumber: roc.roc_number, title: roc.title });
  }, [addTab, roc.id, roc.roc_number, roc.title]);

  const [editing, setEditing] = useState(false);
  const [showGantt, setShowGantt] = useState(false);
  const [number, setNumber] = useState(roc.roc_number);
  const [title, setTitle] = useState(roc.title);
  const [description, setDescription] = useState(roc.description);
  const [startDate, setStartDate] = useState(roc.actual_release_date ?? "");
  const [deadline, setDeadline] = useState(roc.deadline ?? "");
  const [additional, setAdditional] = useState(roc.additional_notes);
  const [singleProject, setSingleProject] = useState(roc.single_project);
  const [projectName, setProjectName] = useState(roc.project_name);
  const [departmentsImpacted, setDepartmentsImpacted] = useState(
    roc.affected_projects,
  );

  useEffect(() => {
    setNumber(roc.roc_number);
    setTitle(roc.title);
    setDescription(roc.description);
    setStartDate(roc.actual_release_date ?? "");
    setDeadline(roc.deadline ?? "");
    setAdditional(roc.additional_notes);
    setSingleProject(roc.single_project);
    setProjectName(roc.project_name);
    setDepartmentsImpacted(roc.affected_projects);
  }, [roc]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["roc", roc.id] });
    void queryClient.invalidateQueries({ queryKey: ["rocs"] });
    void queryClient.invalidateQueries({ queryKey: ["activity"] });
  };

  const save = useMutation({
    mutationFn: () =>
      updateRoc({
        data: {
          id: roc.id,
          rocNumber: number,
          title,
          description,
          actualReleaseDate: startDate || null,
          deadline: deadline || null,
          additionalNotes: additional,
          affectedProjects: departmentsImpacted,
          singleProject,
          projectName: singleProject ? projectName : "",
        },
      }),
    onSuccess: () => {
      toast.success("ROC updated");
      setEditing(false);
      invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Save failed"),
  });

  const deadlineMutation = useMutation({
    mutationFn: (next: string | null) =>
      updateRoc({ data: { id: roc.id, deadline: next } }),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save deadline"),
  });

  const statusMutation = useMutation({
    mutationFn: (overallStatus: (typeof ROC_STATUSES)[number]["key"]) =>
      updateRoc({ data: { id: roc.id, overallStatus } }),
    onSuccess: invalidate,
  });

  return (
    <div className="grid gap-6">
      <header className="rounded-xl border border-border bg-card p-5 shadow-panel">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-semibold tracking-wide text-primary">
              {roc.roc_number}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{roc.title}</h1>
          </div>
          <Select
            value={roc.overall_status}
            onValueChange={(v) =>
              statusMutation.mutate(v as (typeof ROC_STATUSES)[number]["key"])
            }
          >
            <SelectTrigger className="w-full sm:w-52" aria-label="ROC status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROC_STATUSES.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setEditing((v) => !v)}>
            {editing ? "Close editor" : "Edit details"}
          </Button>
          <Button
            variant={showGantt ? "secondary" : "outline"}
            onClick={() => setShowGantt((v) => !v)}
            aria-expanded={showGantt}
          >
            <ChartGantt className="size-4" />
            {showGantt ? "Hide Gantt" : "Gantt chart"}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={rocStatusVariant(roc.overall_status)}>
            {rocStatusLabel(roc.overall_status)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Start {formatDate(roc.actual_release_date)} · Deadline{" "}
            {formatDate(roc.deadline)}
          </span>
          {roc.single_project ? (
            <Badge variant="high">
              Project{roc.project_name.trim() ? ` · ${roc.project_name.trim()}` : ""}
            </Badge>
          ) : null}
        </div>
        {!roc.deadline && !editing ? (
          <div className="mt-3 grid max-w-xs gap-1.5">
            <Label htmlFor="header-deadline">Project deadline</Label>
            <Input
              id="header-deadline"
              type="date"
              value={deadline}
              onChange={(e) => {
                const next = e.target.value;
                setDeadline(next);
                deadlineMutation.mutate(next || null);
              }}
              className="h-10"
            />
          </div>
        ) : null}
        {!editing ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90">
            {roc.description}
          </p>
        ) : (
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="ROC number">
                <Input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="font-mono"
                />
              </Field>
              <Field label="Project name" className="sm:col-span-2">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start date">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field>
              <Field label="Project deadline">
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-3 rounded-md border border-border bg-secondary/40 p-3">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={singleProject}
                  onChange={(e) => setSingleProject(e.target.checked)}
                />
                Project
              </label>
              <p className="text-xs text-muted-foreground">
                This ROC applies to a change for a single project only.
              </p>
              {singleProject ? (
                <Field label="Project name">
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project this change applies to"
                  />
                </Field>
              ) : null}
            </div>
            <Field label="Departments impacted">
              <Textarea
                value={departmentsImpacted}
                onChange={(e) => setDepartmentsImpacted(e.target.value)}
                placeholder="Which departments are involved, and in what capacity."
              />
            </Field>
            <Field label="Additional notes">
              <Textarea
                value={additional}
                onChange={(e) => setAdditional(e.target.value)}
              />
            </Field>
            <RocFiles
              rocId={roc.id}
              attachments={data.attachments}
              editing
              onChanged={invalidate}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={save.isPending}>
                Save ROC
              </Button>
            </div>
          </form>
        )}
        {!editing && (roc.additional_notes || roc.affected_projects) ? (
          <dl className="mt-4 grid gap-3 text-sm">
            {roc.affected_projects ? (
              <div>
                <dt className="font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
                  Departments impacted
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-foreground/90">
                  {roc.affected_projects}
                </dd>
              </div>
            ) : null}
            {roc.additional_notes ? (
              <div>
                <dt className="font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
                  Additional notes
                </dt>
                <dd className="mt-1 line-clamp-6 text-foreground/90">
                  {roc.additional_notes}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {!editing ? (
          <div className="mt-4">
            <RocFiles
              rocId={roc.id}
              attachments={data.attachments}
              editing={false}
              onChanged={invalidate}
            />
          </div>
        ) : null}
      </header>

      {showGantt ? (
        <section className="rounded-xl border border-border bg-card p-5 shadow-panel">
          <h2 className="text-lg font-semibold tracking-tight">Schedule</h2>
          <div className="mt-4">
            <GanttChart
              items={data.actionItems}
              deadline={roc.deadline}
              onDeadlineChange={(value) => {
                setDeadline(value ?? "");
                deadlineMutation.mutate(value);
              }}
              onFocusItem={onFocusItem}
            />
          </div>
        </section>
      ) : null}

      <DepartmentBoard
        rocId={roc.id}
        departments={data.departments}
        actionItems={data.actionItems}
        selected={selectedDept}
        focusItemId={focusItemId}
        onSelect={onSelectDept}
      />
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RocFiles({
  rocId,
  attachments,
  editing,
  onChanged,
}: {
  rocId: number;
  attachments: AttachmentListItem[];
  editing: boolean;
  onChanged: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AttachmentListItem | null>(null);

  const upload = useMutation({
    mutationFn: (data: {
      filename: string;
      mime: string;
      extractText: string;
      contentBase64: string;
    }) => addAttachment({ data: { rocId, ...data } }),
    onSuccess: () => {
      toast.success("File added");
      onChanged();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not add file"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteAttachment({ data: { id } }),
    onSuccess: () => {
      toast.success("File deleted");
      setPendingDelete(null);
      onChanged();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not delete file"),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("File is too large (6 MB max)");
      return;
    }
    setParsing(true);
    try {
      const [extractText, contentBase64] = await Promise.all([
        extractFileText(file),
        fileToBase64(file),
      ]);
      await upload.mutateAsync({
        filename: file.name,
        mime: file.type || "application/octet-stream",
        extractText,
        contentBase64,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read file");
    } finally {
      setParsing(false);
    }
  }

  async function download(file: AttachmentListItem) {
    try {
      const row = await getAttachment({ data: { id: file.id } });
      if (row.content_base64) {
        downloadBase64(row.filename, row.mime, row.content_base64);
        return;
      }
      if (row.extract_text) {
        const blob = new Blob([row.extract_text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = row.filename.replace(/\.[^.]+$/, "") + ".txt";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }
      toast.error("No file content to download");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not download");
    }
  }

  return (
    <div className="grid gap-2">
      <Label>Files</Label>
      {attachments.length === 0 && !editing ? (
        <p className="text-sm text-muted-foreground">No files attached yet.</p>
      ) : (
        <ul className="grid gap-2">
          {attachments.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2"
            >
              <Paperclip className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm">{file.filename}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void download(file)}
              >
                <Download className="size-3.5" />
                Download
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Delete ${file.filename}`}
                  onClick={() => setPendingDelete(file)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {editing ? (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFile(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-5 text-center transition-colors",
              dragOver && "border-primary bg-accent",
            )}
          >
            {parsing || upload.isPending ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <FileUp className="size-5 text-muted-foreground" />
            )}
            <span className="text-sm text-foreground">
              Drop a file here or click to add
            </span>
            <span className="text-xs text-muted-foreground">
              Excel, PDF, images, or other documents · 6 MB max
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </>
      ) : null}

      <Dialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this file?</DialogTitle>
            <DialogDescription>
              This will permanently remove “{pendingDelete?.filename}”.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (pendingDelete) remove.mutate(pendingDelete.id);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}