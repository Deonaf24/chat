"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StudentRead } from "@/app/types/school";
import { User } from "@/app/types/auth"; // Assuming User type is available for names
import { FileText, CheckCircle2, Clock } from "lucide-react";

interface AssignmentSubmissionsViewProps {
    students: StudentRead[];
    usersById: Record<number, User>;
}

export function AssignmentSubmissionsView({ students, usersById }: AssignmentSubmissionsViewProps) {

    const getUserName = (student: StudentRead) => {
        if (student.name) return student.name;
        const user = usersById[student.user_id];
        return user?.full_name || user?.email || "Unknown Student";
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

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
                            // Mock status logic for demo
                            const isSubmitted = i % 3 !== 0;

                            return (
                                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`https://avatar.vercel.sh/${student.user_id}`} />
                                            <AvatarFallback>{getInitials(getUserName(student))}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{getUserName(student)}</p>
                                            <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isSubmitted ? (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-200 dark:border-green-900">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Submitted
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                                                <Clock className="h-3 w-3" />
                                                Pending
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
