
"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentAnalyticsView } from "@/components/dashboard/StudentAnalyticsView";
import { StudentScoreSummary } from "@/app/types/analytics";

interface StudentAnalyticsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: StudentScoreSummary | null;
    classId: number;
}

export function StudentAnalyticsDialog({ open, onOpenChange, student, classId }: StudentAnalyticsDialogProps) {
    if (!student) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto w-full">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <span>{student.student_name}</span>
                        <span className="text-muted-foreground font-normal text-sm">- Student Analytics</span>
                    </DialogTitle>
                    <DialogDescription>
                        Performance detailed view for {student.student_name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <StudentAnalyticsView studentId={student.student_id} classId={classId} minimal={true} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
