"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentRead } from "@/app/types/school";
import { format } from "date-fns";
import { FileText } from "lucide-react";

interface StudentSubmissionsViewProps {
    assignments: AssignmentRead[];
    studentId: number;
}

export function StudentSubmissionsView({ assignments, studentId }: StudentSubmissionsViewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>Recent work submitted by this student.</CardDescription>
            </CardHeader>
            <CardContent>
                {assignments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No assignments found.</p>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((assignment) => (
                            <div key={assignment.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold">{assignment.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{assignment.description || "No description"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* Placeholder status - in real app would check if student submitted */}
                                    <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
                                        Submitted
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {assignment.due_at ? format(new Date(assignment.due_at), "MMM d") : "No due date"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
