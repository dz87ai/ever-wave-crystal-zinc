import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createRoc, listRocs } from "@/lib/roc/api";
import { extractFileText, suggestTitleFromFile } from "@/lib/roc/extract-file";
import { nextRocNumber } from "@/lib/roc/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useOpenTabs } from "@/lib/roc/open-tabs";

const DESCRIPTION_GUIDE = [
  "What is driving the change?",
  "What products does it impact?",
  "What projects does it impact? How is transition phased? (ie first jobs)",
  "What details should be considered for the design? What assumptions have been made that should be reconsidered later?",
];

export function AddRocDialog({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rocNumber, setRocNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [singleProject, setSingleProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [departmentsImpacted, setDepartmentsImpacted] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [extract, setExtract] = useState("");
  const [mime, setMime] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addTab = useOpenTabs((s) => s.add);
  const { data: rocs } = useQuery({
    queryKey: ["rocs"],
    queryFn: () => listRocs(),
  });

  function suggestedNumber() {
    return nextRocNumber((rocs ?? []).map((row) => row.roc_number));
  }

  const mutation = useMutation({
    mutationFn: () =>
      createRoc({
        data: {
          rocNumber: rocNumber.trim() || suggestedNumber(),
          title: title.trim(),
          description: description.trim(),
          actualReleaseDate: startDate || null,
          deadline: dueDate || null,
          singleProject,
          projectName: singleProject ? projectName : "",
          affectedProjects: departmentsImpacted.trim(),
          additionalNotes: additionalNotes.trim(),
          attachment: fileName
            ? { filename: fileName, mime, extractText: extract }
            : null,
        },
      }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["rocs"] });
      await queryClient.invalidateQueries({ queryKey: ["activity"] });
      const number = rocNumber.trim() || suggestedNumber();
      addTab({ id: result.id, rocNumber: number, title: title.trim() });
      toast.success("ROC added to the tracker");
      reset();
      setOpen(false);
      void navigate({ to: "/roc/$id", params: { id: String(result.id) } });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not add ROC");
    },
  });

  function reset() {
    setRocNumber("");
    setTitle("");
    setDescription("");
    setStartDate("");
    setDueDate("");
    setSingleProject(false);
    setProjectName("");
    setDepartmentsImpacted("");
    setAdditionalNotes("");
    setFileName(null);
    setExtract("");
    setMime("");
    setParsing(false);
  }

  async function handleFile(file: File | undefined) {
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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
        else setRocNumber(suggestedNumber());
      }}
    >
      <DialogTrigger asChild>
        <Button className={triggerClassName}>Add ROC</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a design change</DialogTitle>
          <DialogDescription>
            Name the ROC, set dates, and note which departments are involved.
            Departments pick up action items on the project tab.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5 sm:col-span-1">
              <Label htmlFor="roc-number">ROC number</Label>
              <Input
                id="roc-number"
                placeholder="ROC-001"
                value={rocNumber}
                onChange={(e) => setRocNumber(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="roc-title">Project name</Label>
              <Input
                id="roc-title"
                placeholder="Bulb gasket on 8560 vent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="roc-desc">Description</Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Should fully explain the objective and scope of the project.
            </p>
            <ul className="list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-muted-foreground">
              {DESCRIPTION_GUIDE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Textarea
              id="roc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-36"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="roc-start">Start date</Label>
              <Input
                id="roc-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="roc-due">Project due date</Label>
              <Input
                id="roc-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11"
              />
            </div>
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
              <div className="grid gap-1.5">
                <Label htmlFor="roc-project-flag">Project this change applies to</Label>
                <Input
                  id="roc-project-flag"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project this change applies to"
                />
              </div>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="roc-depts">Departments impacted</Label>
            <Textarea
              id="roc-depts"
              value={departmentsImpacted}
              onChange={(e) => setDepartmentsImpacted(e.target.value)}
              placeholder="Which departments are involved, and in what capacity."
              className="min-h-20"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="roc-notes">Additional notes</Label>
            <Textarea
              id="roc-notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-20"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Project details file</Label>
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
                "flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/40 px-4 py-6 text-center transition-colors",
                dragOver && "border-primary bg-accent",
              )}
            >
              {parsing ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <FileUp className="size-5 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground">
                {fileName ?? "Drop an Excel, CSV, or text file"}
              </span>
              <span className="text-xs text-muted-foreground">
                Extracted text is stored with the ROC for the team
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              accept=".xlsx,.xls,.xlsm,.csv,.txt,.md,.json,.tsv,text/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => {
                void handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {extract ? (
              <Textarea
                aria-label="Extracted file text"
                value={extract}
                onChange={(e) => setExtract(e.target.value)}
                className="max-h-40 min-h-24 font-mono text-xs"
              />
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!title.trim() || mutation.isPending || parsing}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Add to tracker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}