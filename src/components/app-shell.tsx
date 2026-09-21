import { useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIdentity, POST_AS_OPTIONS } from "@/lib/roc/identity";
import { useOpenTabs } from "@/lib/roc/open-tabs";
import { saveDailyState, sendLateNotices } from "@/lib/roc/api";
import { DepartmentGate } from "@/components/department-gate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrate = useIdentity((s) => s.hydrate);
  const postedAs = useIdentity((s) => s.postedAs);
  const setPostedAs = useIdentity((s) => s.setPostedAs);
  const tabs = useOpenTabs((s) => s.tabs);
  const remove = useOpenTabs((s) => s.remove);
  const actionsOpen = useOpenTabs((s) => s.actionsOpen);
  const closeActions = useOpenTabs((s) => s.closeActions);
  const activityOpen = useOpenTabs((s) => s.activityOpen);
  const closeActivity = useOpenTabs((s) => s.closeActivity);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function tick() {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      void sendLateNotices({ data: { force: false } }).catch(() => undefined);
      void saveDailyState().catch(() => undefined);
    }
    const first = window.setTimeout(tick, 4_000);
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  return (
    <div className="bg-draft flex min-h-dvh flex-col">
      <header className="border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full items-center gap-3 px-4 sm:px-6 xl:px-8">
          <nav
            aria-label="Open ROC tabs"
            className="flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto"
          >
            <TabLink
              to="/"
              active={pathname === "/"}
              label="Tracker"
            />
            {actionsOpen ? (
              <span className="flex shrink-0 items-stretch">
                <TabLink
                  to="/actions"
                  active={pathname === "/actions"}
                  label="Need action"
                />
                <button
                  type="button"
                  aria-label="Close Need action"
                  className={cn(
                    "flex items-center px-1 text-muted-foreground hover:text-foreground",
                    pathname === "/actions" && "bg-background",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    closeActions();
                    if (pathname === "/actions") void navigate({ to: "/" });
                  }}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ) : null}
            {activityOpen ? (
              <span className="flex shrink-0 items-stretch">
                <TabLink
                  to="/activity"
                  active={pathname === "/activity"}
                  label="Recent activity"
                />
                <button
                  type="button"
                  aria-label="Close Recent activity"
                  className={cn(
                    "flex items-center px-1 text-muted-foreground hover:text-foreground",
                    pathname === "/activity" && "bg-background",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    closeActivity();
                    if (pathname === "/activity") void navigate({ to: "/" });
                  }}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ) : null}
            {tabs.map((tab) => {
              const href = `/roc/${tab.id}`;
              const active = pathname === href;
              return (
                <span key={tab.id} className="flex shrink-0 items-stretch">
                  <TabLink
                    to="/roc/$id"
                    params={{ id: String(tab.id) }}
                    active={active}
                    label={`${tab.rocNumber} · ${tab.title}`}
                  />
                  <button
                    type="button"
                    aria-label={`Close ${tab.rocNumber}`}
                    className={cn(
                      "flex items-center px-1 text-muted-foreground hover:text-foreground",
                      active && "bg-background",
                    )}
                    onClick={(event) => {
                      event.preventDefault();
                      remove(tab.id);
                      if (active) void navigate({ to: "/" });
                    }}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2 py-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Posting as
            </span>
            <Select value={postedAs} onValueChange={setPostedAs}>
              <SelectTrigger
                aria-label="Posting as"
                className="h-10 w-36 bg-card text-xs sm:w-52"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_AS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link
              to="/settings"
              aria-label="Settings"
              title="Settings"
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-sm text-muted-foreground no-underline transition-colors",
                "hover:bg-secondary hover:text-foreground",
                pathname === "/settings" && "bg-secondary text-foreground",
              )}
            >
              <Settings className="size-5" />
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full flex-1 flex-col px-4 py-4 sm:px-6 sm:py-4 xl:px-8">
        {children}
      </div>
      <DepartmentGate />
    </div>
  );
}

function TabLink({
  to,
  params,
  active,
  label,
}: {
  to: "/" | "/roc/$id" | "/actions" | "/activity";
  params?: { id: string };
  active: boolean;
  label: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        "max-w-56 truncate border-b-2 px-3 py-3 text-xs font-medium no-underline transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
