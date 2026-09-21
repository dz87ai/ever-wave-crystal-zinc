import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { saveNoticeSettings, sendLateNotices, type LateNoticeResult } from "@/lib/roc/api";
import {
  NOTICE_MODES,
  NOTICE_TIMEZONES,
  REMIND_OPTIONS,
  WEEKDAYS,
  formatNoticeSummary,
  type NoticeMode,
  type NoticeSettings,
} from "@/lib/roc/notice-schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function toastLateResult(result: LateNoticeResult, emptyMessage?: string) {
  if (result.noticesSent) {
    toast.success(
      result.noticesSent === 1
        ? "Late-task notice emailed"
        : `${result.noticesSent} late-task notices emailed`,
    );
  } else if (result.noticeError) {
    toast.error(result.noticeError);
  } else if (emptyMessage) {
    toast.info(emptyMessage);
  }
}

export function NoticeSettingsForm({ initial }: { initial: NoticeSettings }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const save = useMutation({
    mutationFn: () => saveNoticeSettings({ data: form }),
    onSuccess: async (saved) => {
      setForm(saved);
      await queryClient.invalidateQueries({ queryKey: ["notice-settings"] });
      toast.success("Notice schedule saved");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not save schedule");
    },
  });

  const sendNow = useMutation({
    mutationFn: () => sendLateNotices({ data: { force: true } }),
    onSuccess: (result) => {
      toastLateResult(result, "No overdue tasks with an email on file");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not send notices");
    },
  });

  function setMode(mode: NoticeMode) {
    setForm((current) => ({ ...current, mode }));
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-panel sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-sm font-semibold">Late notices</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatNoticeSummary(form)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={sendNow.isPending || save.isPending}
          className="min-h-11"
          onClick={() => sendNow.mutate()}
        >
          {sendNow.isPending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Send overdue notices now
        </Button>
      </div>

      <fieldset className="mt-4 grid gap-2">
        <legend className="sr-only">When to send late notices</legend>
        {NOTICE_MODES.map((mode) => {
          const selected = form.mode === mode.key;
          return (
            <label
              key={mode.key}
              className={cn(
                "grid cursor-pointer gap-1 rounded-md border px-3 py-3 transition-colors",
                selected
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-background hover:bg-secondary/60",
              )}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="notice-mode"
                  value={mode.key}
                  checked={selected}
                  onChange={() => setMode(mode.key)}
                  className="size-4 accent-primary"
                />
                <span className="text-sm font-medium text-foreground">{mode.title}</span>
              </span>
              <span className="pl-6 text-xs leading-relaxed text-muted-foreground">
                {mode.body}
              </span>
            </label>
          );
        })}
      </fieldset>

      {form.mode !== "off" ? (
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {form.mode === "immediate" ? (
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="remind-every">Remind every</Label>
            <Select
              value={String(form.remindEveryHours)}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  remindEveryHours: Number(value),
                }))
              }
            >
              <SelectTrigger id="remind-every" className="h-11" aria-label="Reminder frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMIND_OPTIONS.map((option) => (
                  <SelectItem key={option.hours} value={String(option.hours)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {form.mode === "daily" ? (
          <div className="grid gap-1.5">
            <Label htmlFor="daily-time">Send at</Label>
            <Input
              id="daily-time"
              type="time"
              value={form.dailyTime}
              onChange={(event) =>
                setForm((current) => ({ ...current, dailyTime: event.target.value }))
              }
              className="h-11"
            />
          </div>
        ) : null}

        {form.mode === "weekly" ? (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="weekly-day">Day</Label>
              <Select
                value={String(form.weeklyDay)}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, weeklyDay: Number(value) }))
                }
              >
                <SelectTrigger id="weekly-day" className="h-11" aria-label="Weekday">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="weekly-time">Time</Label>
              <Input
                id="weekly-time"
                type="time"
                value={form.weeklyTime}
                onChange={(event) =>
                  setForm((current) => ({ ...current, weeklyTime: event.target.value }))
                }
                className="h-11"
              />
            </div>
          </>
        ) : null}

        {form.mode !== "immediate" ? (
          <div className="grid gap-1.5">
            <Label htmlFor="notice-tz">Time zone</Label>
            <Select
              value={form.timezone}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, timezone: value }))
              }
            >
              <SelectTrigger id="notice-tz" className="h-11" aria-label="Time zone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTICE_TIMEZONES.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          disabled={save.isPending}
          className="min-h-11"
          onClick={() => save.mutate()}
        >
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save notice schedule
        </Button>
      </div>
    </section>
  );
}
