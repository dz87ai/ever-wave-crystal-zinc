import { useEffect, useState } from "react";
import { POST_AS_OPTIONS, useIdentity } from "@/lib/roc/identity";
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

export function DepartmentGate() {
  const hydrated = useIdentity((s) => s.hydrated);
  const needsDepartment = useIdentity((s) => s.needsDepartment);
  const postedAs = useIdentity((s) => s.postedAs);
  const savedPostedAs = useIdentity((s) => s.savedPostedAs);
  const confirmDepartment = useIdentity((s) => s.confirmDepartment);
  const [choice, setChoice] = useState("");

  const open = hydrated && needsDepartment;

  useEffect(() => {
    if (!open) return;
    setChoice(
      savedPostedAs && POST_AS_OPTIONS.includes(savedPostedAs)
        ? savedPostedAs
        : "",
    );
  }, [open, savedPostedAs]);

  function continueAs() {
    if (!choice) return;
    confirmDepartment(choice);
  }

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        showClose={false}
        className="max-w-md"
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Select your department</DialogTitle>
          <DialogDescription>
            Comments and tasks are posted as this department. You can change it
            later from the top of the page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="department-choice">Department</Label>
          <Select value={choice || undefined} onValueChange={setChoice}>
            <SelectTrigger id="department-choice" className="h-11">
              <SelectValue placeholder="Choose a department" />
            </SelectTrigger>
            <SelectContent>
              {POST_AS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="min-h-11"
            disabled={!choice}
            onClick={continueAs}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}