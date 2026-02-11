"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AssignmentRead } from "@/app/types/school";
import { format, parseISO } from "date-fns";
import { CalendarDays, Clock, AlignLeft, BookOpen, ExternalLink, GraduationCap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AssignmentDetailsDialogProps {
    assignment: AssignmentRead | null;
    isOpen: boolean;
    onClose: () => void;
    getClassColor: (classId: number) => { solid: string; text: string; border: string; light?: string };
    getClassName: (classId: number) => string;
}

export function AssignmentDetailsDialog({ assignment, isOpen, onClose, getClassColor, getClassName }: AssignmentDetailsDialogProps) {
    if (!assignment) return null;

    const styles = getClassColor(assignment.class_id);
    const className = getClassName(assignment.class_id);
    const dueDate = assignment.due_at ? new Date(assignment.due_at) : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={cn("h-6 w-1 rounded-full", styles.solid)} />
                        <span className={cn("text-xs font-semibold uppercase tracking-wider", styles.text)}>
                            Assignment
                        </span>
                    </div>
                    <DialogTitle className="text-xl leading-tight">{assignment.title}</DialogTitle>
                    <div className="text-sm text-muted-foreground font-medium">
                        {className}
                    </div>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Due Date Info */}
                    {dueDate && (
                        <div className="flex items-start gap-3 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="grid gap-0.5">
                                <div className="font-medium text-foreground">
                                    Due {format(dueDate, "EEEE, MMMM d")}
                                </div>
                                <div className="text-muted-foreground">
                                    at {format(dueDate, "h:mm a")}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {assignment.description && (
                        <div className="flex items-start gap-3 text-sm mt-2">
                            <AlignLeft className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                                {assignment.description}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between items-center sm:flex-row flex-col-reverse">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" size="sm">
                        Close
                    </Button>
                    <Button
                        className={cn("w-full sm:w-auto gap-2 text-white", styles.solid)}
                        size="sm"
                        asChild
                    >
                        <Link href={`/dashboard/classes/${assignment.class_id}/assignments/${assignment.id}?from=calendar`}>
                            <BookOpen className="h-4 w-4" />
                            View Assignment
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
