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
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { getFile, getAssignment, syncAssignment } from "@/app/lib/api/school";
import { FileRead, AssignmentRead } from "@/app/types/school";

export default function AssignmentDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, teacher, student, isStudent, loading: authLoading } = useDashboardAuth();

    // Initialize tab from URL or default to "details"
    const initialTab = searchParams?.get("tab") || "details";
    const [activeTab, setActiveTab] = useState(initialTab);

    const fromSource = searchParams?.get("from");
    const backLink = fromSource === "calendar" ? "/dashboard/calendar" : undefined;
    const backLabel = fromSource === "calendar" ? "Back to Calendar" : "Back to Class";

    // Sync state if URL changes (optional, but good for back button)
    useEffect(() => {
        const tab = searchParams?.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const { classes, students, assignments, usersById, loading: dataLoading, refresh, initialized } = useDashboardData(
        user,
        teacher,
        student
    );

    const isStrictlyLoading = authLoading || dataLoading || (!initialized && !!user);
    const showLoader = useSmoothLoading(isStrictlyLoading);

    // ... (rest of memo logic)

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
    const [fetchedAssignment, setFetchedAssignment] = useState<AssignmentRead | null>(null);

    // Fetch full assignment details (including submission status which isn't in the list view)
    // Callback to refresh assignment data
    const refreshAssignment = async () => {
        if (!assignmentId) return;
        try {
            const data = await getAssignment(assignmentId);
            setFetchedAssignment(data);
            if (data.file_ids && data.file_ids.length > 0) {
                const loadedFiles = await Promise.all(
                    data.file_ids.map(id => getFile(id))
                );
                setFiles(loadedFiles);
            }
        } catch (e) {
            console.error("Failed to refresh assignment", e);
        }
    };

    // Initial load & Auto-Sync
    useEffect(() => {
        const init = async () => {
            // 1. Load local data first for speed
            await refreshAssignment();

            // 2. Trigger sync in background (if assignmentId exists)
            if (assignmentId) {
                try {
                    await syncAssignment(assignmentId);
                    // 3. Refresh again after sync
                    await refreshAssignment();
                } catch (e) {
                    console.error("Auto-sync failed", e);
                }
            }
        };
        init();
    }, [assignmentId]);

    // Use fetched assignment if available, otherwise fall back to context data (which might be stale/incomplete)
    const displayAssignment = fetchedAssignment || assignment;

    if (showLoader && !displayAssignment) {
        return (
            <div className="grid h-dvh place-items-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isStrictlyLoading) {
        return null;
    }

    if (!classId || !assignmentId || !displayAssignment) {
        return (
            <div className="grid h-dvh place-items-center space-y-4 text-center">
                <div>
                    <h2 className="text-2xl font-bold">Assignment Not Found</h2>
                    <p className="text-muted-foreground">The requested assignment could not be found.</p>
                </div>
                <Button asChild>
                    <Link href={backLink || `/dashboard/classes/${classId || ''}`}>{backLabel}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-muted/30">
            {!isStudent && (
                <AssignmentDetailNavbar
                    className={displayAssignment.title}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    classId={classId}
                    backLink={backLink}
                    backLabel={backLabel}
                />
            )}
            {isStudent && (
                <AssignmentDetailNavbar
                    className={displayAssignment.title}
                    activeTab="details"
                    onTabChange={() => { }}
                    classId={classId}
                    hideTabs
                />
            )}

            <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
                {isStudent ? (
                    <StudentAssignmentView assignment={displayAssignment} files={files} />
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsContent value="details">
                            <AssignmentDetailsView assignment={displayAssignment} files={files} onUpdate={refresh} />
                        </TabsContent>

                        <TabsContent value="structure">
                            <AssignmentStructureView assignmentId={assignmentId} />
                        </TabsContent>

                        <TabsContent value="submissions">
                            <AssignmentSubmissionsView
                                students={studentsInClass}
                                usersById={usersById}
                                submissions={displayAssignment.all_submissions || []}
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
