"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StudentRead, StudentAssignmentInfo } from "@/app/types/school";
import { User } from "@/app/types/auth";
import { FileText, CheckCircle2, Clock, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

interface AssignmentSubmissionsViewProps {
    students: StudentRead[];
    usersById: Record<number, User>;
    submissions: StudentAssignmentInfo[];
}

export function AssignmentSubmissionsView({ students, usersById, submissions }: AssignmentSubmissionsViewProps) {

    const getUserName = (student: StudentRead) => {
        if (student.name) return student.name;
        const user = usersById[student.user_id];
        return user?.full_name || user?.email || "Unknown Student";
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    // Map student_user_id (which is student.user_id) to submission
    // Note: StudentAssignment.student_id matches User.id (which is student.user_id)
    const subMap = new Map<number, StudentAssignmentInfo>();
    submissions.forEach(s => subMap.set(s.student_id, s));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>{students.length} students enrolled</CardDescription>
            </CardHeader>
            <CardContent>
                {students.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No students found.</p>
                ) : (
                    <div className="space-y-4">
                        {students.map((student, i) => {
                            const sub = subMap.get(student.user_id);
                            const status = sub?.status;
                            const isSubmitted = status === "TURNED_IN" || status === "RETURNED";
                            const isReturned = status === "RETURNED";

                            return (
                                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={student.profile_picture_url || `https://avatar.vercel.sh/${student.user_id}`} />
                                            <AvatarFallback>{getInitials(getUserName(student))}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{getUserName(student)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isSubmitted ? (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-200 dark:border-green-900">
                                                <CheckCircle2 className="h-3 w-3" />
                                                {isReturned ? "Returned" : "Submitted"}
                                            </span>
                                        ) : status === "CREATED" || status === "RECLAIMED_BY_STUDENT" ? (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                                                <FileText className="h-3 w-3" />
                                                In Progress
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                                                <Clock className="h-3 w-3" />
                                                Assigned
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
