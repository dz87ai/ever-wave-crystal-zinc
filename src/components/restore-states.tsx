import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  exportTrackerStateDocx,
  restoreTrackerState,
  type TrackerStateSummary,
} from "@/lib/roc/api";
import { downloadBase64 } from "@/lib/roc/extract-file";
import { formatDate } from "@/lib/roc/format";
import { useOpenTabs } from "@/lib/roc/open-tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatSavedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function stateLabel(state: TrackerStateSummary): string {
  const day = formatDate(state.day);
  return state.isToday ? `Today · ${day}` : day;
}

export function RestoreStates({ initial }: { initial: TrackerStateSummary[] }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(() =>
    initial[0] ? String(initial[0].id) : "",
  );
  const [confirmRestore, setConfirmRestore] = useState(false);

  useEffect(() => {
    if (!initial.length) {
      setSelectedId("");
      return;
    }
    if (!initial.some((state) => String(state.id) === selectedId)) {
      setSelectedId(String(initial[0].id));
    }
  }, [initial, selectedId]);

  const selected =
    initial.find((state) => String(state.id) === selectedId) ?? initial[0] ?? null;

  const restore = useMutation({
    mutationFn: (id: number) => restoreTrackerState({ data: { id } }),
    onSuccess: async (state) => {
      setConfirmRestore(false);
      useOpenTabs.setState({ tabs: [] });
      await queryClient.invalidateQueries();
      toast.success(`Restored ${formatDate(state.day)}`);
      void navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not restore.");
    },
  });

  const download = useMutation({
    mutationFn: (id: number) => exportTrackerStateDocx({ data: { id } }),
    onSuccess: (file) => {
      downloadBase64(
        file.filename,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        file.base64,
      );
      toast.success(`Downloaded ${file.filename}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not build the Word file.",
      );
    },
  });

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-sm font-semibold">Restore archive</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A snapshot is saved each day this tracker is in use. Download the Word
          file for a readable copy you can open in Microsoft Word and rebuild by
          hand if needed. Restore replaces every ROC, action, file, contact, and
          notice setting with that day’s copy.
        </p>
      </div>

      {initial.length === 0 || !selected ? (
        <div className="rounded-xl border border-dashed border-border bg-card/70 px-6 py-12 text-center shadow-panel">
          <p className="font-medium">No saved states yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep the tracker open during the day and a snapshot will appear
            here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-panel sm:p-5">
          <div className="grid max-w-lg gap-1.5">
            <Label htmlFor="restore-date">Restore date</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger id="restore-date" className="h-11">
                <SelectValue placeholder="Choose a date" />
              </SelectTrigger>
              <SelectContent>
                {initial.map((state) => (
                  <SelectItem key={state.id} value={String(state.id)}>
                    {stateLabel(state)}
                    {state.summary ? ` · ${state.summary}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selected.summary}
              {selected.captured_at
                ? ` · last saved ${formatSavedAt(selected.captured_at)}`
                : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={download.isPending}
              onClick={() => download.mutate(selected.id)}
            >
              <Download className="size-4" />
              {download.isPending
                ? "Preparing Word file…"
                : "Download Word file"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              disabled={restore.isPending}
              onClick={() => setConfirmRestore(true)}
            >
              Restore tracker to this date
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={confirmRestore}
        onOpenChange={(open) => {
          if (!open && !restore.isPending) setConfirmRestore(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Restore {selected ? formatDate(selected.day) : "this state"}?
            </DialogTitle>
            <DialogDescription>
              The tracker will match that day’s snapshot — projects, actions,
              files, contacts, and notice settings. This cannot be undone except
              by restoring another saved state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmRestore(false)}
              disabled={restore.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={restore.isPending || !selected}
              onClick={() => {
                if (selected) restore.mutate(selected.id);
              }}
            >
              {restore.isPending ? "Restoring…" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
