"use client";

import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { authStore } from "@/app/lib/auth/authStore";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { LessonPlanner } from "@/components/planner/LessonPlanner";
import { StudyPlanner } from "@/components/planner/StudyPlanner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Imports fixed by previous block, checking logic here
export default function PlannerPage() {
    const [date, setDate] = useState<Date>(new Date());
    const { user, teacher, student, loading: authLoading } = useDashboardAuth();
    const router = useRouter(); // Keep router for potential future use or if handleLogout is re-added

    // Destructure classes for SidebarMenu
    const { classes, assignments, loading: dataLoading, initialized } = useDashboardData(
        user,
        teacher,
        student
    );

    const isStrictlyLoading = authLoading || dataLoading || (!initialized && !!user);
    const showLoader = useSmoothLoading(isStrictlyLoading);

    // Filter assignments for selected date
    const dayAssignments = assignments.filter(a =>
        a.due_at && new Date(a.due_at).toDateString() === date.toDateString()
    );

    // The useEffect for redirection and handleLogout are removed as per the provided snippet.
    // If they are still needed, they should be explicitly re-added.

    if (showLoader) {
        return (
            <div className="grid h-dvh place-items-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isStrictlyLoading) {
        return null;
    }

    // Re-adding handleLogout as it's used in the Button component later.
    // If the intention was to remove it, the Button should also be removed or modified.
    const handleLogout = () => {
        authStore.logout();
        router.replace("/");
    };

    return (
        <div className="min-h-dvh bg-muted/30">
            {/* Custom Header with SidebarMenu */}
            <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 z-10">
                        <SidebarMenu classes={classes} role={teacher ? 'teacher' : student ? 'student' : undefined} />
                        <a href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
                            Socratica
                        </a>
                    </div>

                    <div className="flex items-center gap-2 z-10 ml-auto bg-transparent">
                        <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
                {teacher && <LessonPlanner />}
                {student && <StudyPlanner />}
            </main>
        </div>
    );
}
