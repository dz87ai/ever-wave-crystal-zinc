import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  getNoticeSettings,
  listDepartmentContacts,
  listTrackerStates,
} from "@/lib/roc/api";
import { TeamContacts } from "@/components/team-contacts";
import { NoticeSettingsForm } from "@/components/notice-settings";
import { RestoreStates } from "@/components/restore-states";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/settings")({
  loader: async () => {
    const [contacts, notice, states] = await Promise.all([
      listDepartmentContacts(),
      getNoticeSettings(),
      listTrackerStates(),
    ]);
    return { contacts, notice, states };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const initial = Route.useLoaderData();
  const contactsQuery = useQuery({
    queryKey: ["department-contacts"],
    queryFn: () => listDepartmentContacts(),
    initialData: initial.contacts,
  });
  const noticeQuery = useQuery({
    queryKey: ["notice-settings"],
    queryFn: () => getNoticeSettings(),
    initialData: initial.notice,
  });
  const statesQuery = useQuery({
    queryKey: ["tracker-states"],
    queryFn: () => listTrackerStates(),
    initialData: initial.states,
  });

  const isLoading =
    contactsQuery.isLoading || noticeQuery.isLoading || statesQuery.isLoading;
  const isError =
    contactsQuery.isError || noticeQuery.isError || statesQuery.isError;
  const error = contactsQuery.error ?? noticeQuery.error ?? statesQuery.error;

  return (
    <div className="grid gap-6">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tracker
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Late-task notices and a Word restore archive from each day.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-panel">
          <p className="font-medium">Could not load settings</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Try again."}
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              void contactsQuery.refetch();
              void noticeQuery.refetch();
              void statesQuery.refetch();
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <Tabs defaultValue="notifications">
          <TabsList className="h-11">
            <TabsTrigger value="notifications" className="min-h-11 px-4">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="restore" className="min-h-11 px-4">
              Restore
            </TabsTrigger>
          </TabsList>
          <TabsContent value="notifications" className="grid gap-6">
            <NoticeSettingsForm initial={noticeQuery.data ?? initial.notice} />
            <div className="grid gap-3">
              <div>
                <h2 className="text-sm font-semibold">Team contacts</h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Late-task notices use this email. Several overdue tasks for
                  the same department are always combined into one message.
                </p>
              </div>
              <TeamContacts initial={contactsQuery.data ?? []} />
            </div>
          </TabsContent>
          <TabsContent value="restore">
            <RestoreStates initial={statesQuery.data ?? initial.states} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
