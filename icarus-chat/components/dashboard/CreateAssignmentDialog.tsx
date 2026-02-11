import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AssignmentFormState {
  title: string;
  description: string;
  dueDate: string;
  level: number;
}

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentForm: AssignmentFormState;
  assignmentFile: File | null;
  creating: boolean;
  error: string | null;
  className?: string;
  classNameLabel: string;
  onChange: (updates: Partial<AssignmentFormState>) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

export function CreateAssignmentDialog({
  open,
  onOpenChange,
  assignmentForm,
  assignmentFile,
  creating,
  error,
  className,
  classNameLabel,
  onChange,
  onFileChange,
  onSubmit,
}: CreateAssignmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className ?? "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>Create assignment</DialogTitle>
          <DialogDescription>
            Publish a new assignment for {classNameLabel}. Analytics will be displayed once data is available.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="assignment-title">
              Title
            </label>
            <Input
              id="assignment-title"
              value={assignmentForm.title}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="Ex: Unit 3 comprehension check"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="assignment-description">
              Description
            </label>
            <Textarea
              id="assignment-description"
              value={assignmentForm.description}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder="What should students focus on?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select
                value={String(assignmentForm.level)}
                onValueChange={(val) => onChange({ level: parseInt(val, 10) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 (Hints)</SelectItem>
                  <SelectItem value="2">Level 2 (Hands-on)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="assignment-due">
                Due date (optional)
              </label>
              <Input
                id="assignment-due"
                type="date"
                value={assignmentForm.dueDate}
                onChange={(event) => onChange({ dueDate: event.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="assignment-file">
              Attachment (PDF only)
            </label>
            <Input
              id="assignment-file"
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                const file = event.target.files?.[0];
                onFileChange(file ?? null);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Optional: attach a PDF for students to reference. Uploads will be linked to the assignment.
            </p>
            {assignmentFile && <p className="text-xs">Selected file: {assignmentFile.name}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!assignmentForm.title || creating}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
