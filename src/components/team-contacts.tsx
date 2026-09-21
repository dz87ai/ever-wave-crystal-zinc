import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { saveDepartmentContacts } from "@/lib/roc/api";
import { DEPARTMENTS } from "@/lib/roc/constants";
import type { DepartmentContact } from "@/lib/roc/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TeamContacts({ initial }: { initial: DepartmentContact[] }) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState(initial);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  const save = useMutation({
    mutationFn: () => saveDepartmentContacts({ data: rows }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["department-contacts"] });
      toast.success("Team contacts saved");
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
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not save contacts");
    },
  });

  function patch(department: DepartmentContact["department"], field: keyof DepartmentContact, value: string) {
    setRows((current) =>
      current.map((row) =>
        row.department === department ? { ...row, [field]: value } : row,
      ),
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <div className="flex flex-wrap items-center justify-end">
        <Button type="submit" disabled={save.isPending} className="min-h-11">
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save contacts
        </Button>
      </div>
      <div className="grid gap-3">
        {DEPARTMENTS.map((dept) => {
          const row = rows.find((item) => item.department === dept.key) ?? {
            department: dept.key,
            contact_name: "",
            email: "",
            phone: "",
            role: "",
          };
          return (
            <article
              key={dept.key}
              className="rounded-lg border border-border bg-card p-4 shadow-panel"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">{dept.label}</h2>
                {row.email ? (
                  <a
                    href={`mailto:${row.email}`}
                    className="inline-flex items-center gap-1 text-xs text-primary no-underline hover:underline"
                  >
                    <Mail className="size-3.5" />
                    {row.email}
                  </a>
                ) : (
                  <span className="font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                    {dept.short}
                  </span>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  id={`${dept.key}-name`}
                  label="Contact"
                  value={row.contact_name}
                  placeholder="Name"
                  onChange={(value) => patch(dept.key, "contact_name", value)}
                />
                <Field
                  id={`${dept.key}-role`}
                  label="Role"
                  value={row.role}
                  placeholder="Department manager"
                  onChange={(value) => patch(dept.key, "role", value)}
                />
                <Field
                  id={`${dept.key}-email`}
                  label="Email"
                  type="email"
                  value={row.email}
                  placeholder="name@company.com"
                  onChange={(value) => patch(dept.key, "email", value)}
                />
                <Field
                  id={`${dept.key}-phone`}
                  label="Phone"
                  type="tel"
                  value={row.phone}
                  placeholder="Ext. or mobile"
                  onChange={(value) => patch(dept.key, "phone", value)}
                />
              </div>
            </article>
          );
        })}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
