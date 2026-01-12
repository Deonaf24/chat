"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { AssignmentDetailNavbar } from "@/components/dashboard/AssignmentDetailNavbar";
import { AssignmentDetailsView } from "@/components/dashboard/AssignmentDetailsView";
import { AssignmentSubmissionsView } from "@/components/dashboard/AssignmentSubmissionsView";
import { AssignmentAnalyticsView } from "@/components/dashboard/AssignmentAnalyticsView";
import { AssignmentStructureView } from "@/components/dashboard/AssignmentStructureView";
import { StudentAssignmentView } from "@/components/dashboard/StudentAssignmentView";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { getFile } from "@/app/lib/api/school";
import { FileRead } from "@/app/types/school";

export default function AssignmentDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, teacher, student, isStudent, loading: authLoading } = useDashboardAuth();

    // Initialize tab from URL or default to "details"
    const initialTab = searchParams?.get("tab") || "details";
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync state if URL changes (optional, but good for back button)
    useEffect(() => {
        const tab = searchParams?.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const { classes, students, assignments, usersById, loading: dataLoading, refresh } = useDashboardData(
        user,
        teacher,
        student
    );

    const classId = useMemo(() => {
        const idParam = params?.id; // Class ID
        if (!idParam) return null;
        return Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    }, [params]);

    const assignmentId = useMemo(() => {
        const idParam = params?.assignmentId;
        if (!idParam) return null;
        return Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    }, [params]);

    // Derived data
    const assignment = useMemo(() => assignments.find(a => Number(a.id) === assignmentId), [assignments, assignmentId]);
    const studentsInClass = useMemo(() => {
        const currentClass = classes.find(c => c.id === classId);
        if (!currentClass) return [];
        return students.filter(s => currentClass.student_ids.includes(s.id));
    }, [classes, students, classId]);

    const [files, setFiles] = useState<FileRead[]>([]);
    // const { isStudent } = useDashboardAuth(); // Already called above

    useEffect(() => {
        if (!assignment || !assignment.file_ids) return;

        const loadFiles = async () => {
            try {
                const loadedFiles = await Promise.all(
                    assignment.file_ids!.map(id => getFile(id))
                );
                setFiles(loadedFiles);
            } catch (e) {
                console.error("Failed to load files", e);
            }
        };
        loadFiles();
    }, [assignment]);

    if (authLoading || dataLoading) {
        return (
            <div className="grid h-dvh place-items-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!classId || !assignmentId || !assignment) {
        return (
            <div className="grid h-dvh place-items-center space-y-4 text-center">
                <div>
                    <h2 className="text-2xl font-bold">Assignment Not Found</h2>
                    <p className="text-muted-foreground">The requested assignment could not be found.</p>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/classes/${classId || ''}`}>Back to Class</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-muted/30">
            {!isStudent && (
                <AssignmentDetailNavbar
                    className={assignment.title}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    classId={classId}
                />
            )}
            {isStudent && (
                <AssignmentDetailNavbar
                    className={assignment.title}
                    activeTab="details"
                    onTabChange={() => { }}
                    classId={classId}
                    hideTabs
                />
            )}

            <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
                {isStudent ? (
                    <StudentAssignmentView assignment={assignment} files={files} />
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsContent value="details">
                            <AssignmentDetailsView assignment={assignment} onUpdate={refresh} />
                        </TabsContent>

                        <TabsContent value="structure">
                            <AssignmentStructureView assignmentId={assignmentId} />
                        </TabsContent>

                        <TabsContent value="submissions">
                            <AssignmentSubmissionsView
                                students={studentsInClass}
                                usersById={usersById}
                            />
                        </TabsContent>

                        <TabsContent value="analytics">
                            <AssignmentAnalyticsView assignmentId={assignmentId} />
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    );
}
