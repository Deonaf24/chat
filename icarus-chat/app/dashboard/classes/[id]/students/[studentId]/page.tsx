"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { StudentDetailNavbar } from "@/components/dashboard/StudentDetailNavbar";
import { StudentAnalyticsView } from "@/components/dashboard/StudentAnalyticsView";
import Link from "next/link";
// Using placeholder for grades/chats for now
import { Card, CardContent } from "@/components/ui/card";
import { StudentSubmissionsView } from "@/components/dashboard/StudentSubmissionsView";

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, teacher, student, loading: authLoading } = useDashboardAuth();
    const [activeTab, setActiveTab] = useState("analytics");

    const { classes, students, assignments, loading: dataLoading, initialized } = useDashboardData(
        user,
        teacher,
        student
    );

    const isStrictlyLoading = authLoading || dataLoading || (!initialized && !!user);
    const showLoader = useSmoothLoading(isStrictlyLoading);

    // ... (rest of memo logic)

    const classId = useMemo(() => {
        const idParam = params?.id;
        if (!idParam) return null;
        return Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    }, [params]);

    const studentId = useMemo(() => {
        const idParam = params?.studentId;
        if (!idParam) return null;
        return Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    }, [params]);

    const selectedClass = useMemo(() => classes.find((c) => c.id === classId), [classes, classId]);
    const selectedStudent = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

    // Assignments for this class
    const classAssignments = useMemo(() =>
        assignments.filter(a => a.class_id === classId),
        [assignments, classId]);

    if (showLoader) {
        return (
            <div className="grid h-dvh place-items-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isStrictlyLoading) {
        return null;
    }

    if (!classId || !studentId || !selectedClass || !selectedStudent) {
        return (
            <div className="grid h-dvh place-items-center space-y-4 text-center">
                <div>
                    <h2 className="text-2xl font-bold">Student Not Found</h2>
                    <p className="text-muted-foreground">The requested student or class could not be found.</p>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/classes/${classId || ''}`}>Back to Class</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-muted/30">
            <StudentDetailNavbar
                className={selectedStudent.name || "Student"}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                classId={classId}
                classes={classes}
                role={teacher ? 'teacher' : student ? 'student' : undefined}
            />

            <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

                    <TabsContent value="submissions">
                        <StudentSubmissionsView
                            assignments={classAssignments}
                            studentId={studentId}
                        />
                    </TabsContent>

                    <TabsContent value="grades">
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Grades view coming soon.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="chats">
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Chat history coming soon.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <StudentAnalyticsView studentId={studentId} />
                    </TabsContent>

                </Tabs>
            </main>
        </div>
    );
}
