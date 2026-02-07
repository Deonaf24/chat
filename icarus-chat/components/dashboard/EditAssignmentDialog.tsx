import { useEffect, useState } from "react";
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
import { AssignmentRead } from "@/app/types/school";
import { updateAssignment } from "@/app/lib/api/school";

interface EditAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignment: AssignmentRead;
    onAssignmentUpdated: (updated: AssignmentRead) => void;
}

export function EditAssignmentDialog({
    open,
    onOpenChange,
    assignment,
    onAssignmentUpdated,
}: EditAssignmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(assignment.title);
    const [description, setDescription] = useState(assignment.description || "");
    // Handle Date conversion safely
    const [dueDate, setDueDate] = useState(() => {
        if (!assignment.due_at) return "";
        try {
            const d = new Date(assignment.due_at);
            return d.toISOString().split("T")[0];
        } catch {
            return "";
        }
    });
    const [level, setLevel] = useState(assignment.level || 1);

    // Reset form when assignment changes
    useEffect(() => {
        if (open) {
            setTitle(assignment.title);
            setDescription(assignment.description || "");
            if (assignment.due_at) {
                try {
                    const d = new Date(assignment.due_at);
                    setDueDate(d.toISOString().split("T")[0]);
                } catch {
                    setDueDate("");
                }
            } else {
                setDueDate("");
            }
            setLevel(assignment.level || 1);
        }
    }, [assignment, open]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updated = await updateAssignment(Number(assignment.id), {
                title,
                description,
                due_at: dueDate ? new Date(dueDate) : null,
                level,
                class_id: assignment.class_id, // Helper to satisfy partial type if needed, though strictly not needed if partial is loose
            });
            onAssignmentUpdated(updated);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update assignment", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Assignment</DialogTitle>
                    <DialogDescription>
                        Update assignment details and settings.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">

                    {assignment.google_id && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                            <span>Synced from Google Classroom. Some fields are read-only.</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Assignment title"
                            disabled={!!assignment.google_id}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            disabled={!!assignment.google_id}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Level</label>
                            <Select
                                value={String(level)}
                                onValueChange={(val) => setLevel(parseInt(val, 10))}
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
                            <label className="text-sm font-medium">Due Date</label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                disabled={!!assignment.google_id}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !title}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
