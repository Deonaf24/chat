"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StudentRead, TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";
import { cn } from "@/lib/utils";

import { useClassContext } from "@/app/dashboard/classes/[id]/context";

interface PeopleListProps {
    accentColorClass?: string;
}

export function PeopleList({ accentColorClass }: PeopleListProps) {
    const { classId, teachers: allTeachers, students, usersById, isTeacher } = useClassContext();

    // Ideally the backend/context provides the *specific* teacher for this class, 
    // but assuming for now we find them in the list or this filtered list is correct.
    // In page.tsx it was finding the first teacher match.
    // We'll replicate that logic or rely on filtered data.
    const teacher = allTeachers[0]; // Simplified for now as context should filter, but let's check provider usage.

    const getUserName = (entity: TeacherRead | StudentRead) => {
        if (entity.name) return entity.name;
        // Fallback to user look up if needed, or just "Unknown"
        const user = usersById[entity.user_id];
        return user?.full_name || user?.email || "Unknown User";
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <Card className="shadow-sm">
            <CardContent className="p-6 space-y-8">
                {/* Teachers Section */}
                <div className="space-y-4">
                    <h2 className={cn("text-2xl font-semibold", accentColorClass)}>Teachers</h2>
                    <Separator className={cn("bg-current opacity-20", accentColorClass)} />

                    {teacher ? (
                        <div className="flex items-center gap-4 py-2">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={teacher.profile_picture_url || `https://avatar.vercel.sh/${teacher.user_id}`} />
                                <AvatarFallback>{getInitials(getUserName(teacher))}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{getUserName(teacher)}</span>
                        </div>
                    ) : (
                        <div className="py-2 text-muted-foreground italic">No teacher assigned.</div>
                    )}
                </div>

                {/* Students Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className={cn("text-2xl font-semibold", accentColorClass)}>Students</h2>
                        <span className={cn("text-sm font-medium opacity-60", accentColorClass)}>
                            {students.length} students
                        </span>
                    </div>
                    <Separator className={cn("bg-current opacity-20", accentColorClass)} />

                    {students.length > 0 ? (
                        <div className="divide-y">
                            {students.map((student) => {
                                const Content = (
                                    <div className="flex items-center gap-4 py-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={student.profile_picture_url || `https://avatar.vercel.sh/${student.user_id}`} />
                                            <AvatarFallback>{getInitials(getUserName(student))}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{getUserName(student)}</span>
                                    </div>
                                );

                                if (isTeacher) {
                                    return (
                                        <Link
                                            key={student.id}
                                            href={`/dashboard/classes/${classId}/students/${student.id}`}
                                            className="block hover:bg-muted/50 transition-colors -mx-6 px-6"
                                        >
                                            {Content}
                                        </Link>
                                    );
                                }

                                return (
                                    <div key={student.id} className="block -mx-6 px-6">
                                        {Content}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-2 text-muted-foreground italic">No students enrolled.</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
