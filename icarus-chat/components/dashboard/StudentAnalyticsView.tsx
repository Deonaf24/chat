"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { getStudentAnalytics, getChapterAnalytics } from "@/app/lib/api/analytics";
import { StudentAnalytics, ChapterAnalytics } from "@/app/types/analytics";
import { ChapterAnalyticsList } from "@/components/analytics/ChapterAnalyticsList";
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { getGrade } from "@/lib/grading";
import { AnalyticsEmptyState } from "@/components/dashboard/analytics/AnalyticsEmptyState";

interface StudentAnalyticsViewProps {
    studentId: number;
    classId?: number; // Optional now as it might not always be passed or needed for all fetches if internal logic changes, but keeping for compatibility
    minimal?: boolean;
}

export function StudentAnalyticsView({ studentId, classId, minimal = false }: StudentAnalyticsViewProps) {
    const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
    const [chapters, setChapters] = useState<ChapterAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // ... (API calls need classId usually, but let's assume getChapterAnalytics needs it. If classId is missing, we might need to handle it, but for now just pass it)
        if (!studentId) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        // If classId is not provided, we might fail to get chapter analytics if it depends on it. 
        // existing code: getChapterAnalytics(classId)
        // We should ensure classId is passed or handle missing classId.

        const promises: Promise<any>[] = [getStudentAnalytics(studentId)];
        if (classId) {
            promises.push(getChapterAnalytics(classId));
        }

        Promise.all(promises)
            .then((results) => {
                if (!isMounted) return;
                setAnalytics(results[0]);
                if (results[1]) setChapters(results[1]);
            })
            .catch((e) => {
                console.error(e);
                if (!isMounted) return;
                setError("Unable to load student analytics.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [studentId, classId]);

    const showLoader = useSmoothLoading(loading);

    if (showLoader) {
        return (
            <div className="grid h-64 place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading student analytics...</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return null;
    }

    if (error) {
        return (
            <div className="grid h-64 place-items-center px-6">
                <div className="max-w-md space-y-3 text-center">
                    <p className="text-lg font-semibold">Unable to display analytics</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    // Detect empty state: no analytics data OR no meaningful data (no concepts, no assignments)
    const hasNoData = !analytics ||
        (!analytics.most_understood_concept &&
            !analytics.least_understood_concept &&
            !analytics.easiest_assignment &&
            !analytics.hardest_assignment &&
            analytics.questions_asked === 0);

    if (hasNoData) {
        return (
            <AnalyticsEmptyState
                title="Your Learning Journey Begins Here"
                subtitle="Your personal analytics will appear as you engage with assignments and interact with course materials. Start exploring!"
            />
        );
    }

    return (
        <div className="space-y-8">
            {!minimal && (
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">Performance Overview</h3>
                    <p className="text-sm text-muted-foreground">Detailed insights into this student's learning progress.</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Interactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.questions_asked}</div>
                        <p className="text-xs text-muted-foreground mt-1">Chat messages exchanged</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-2 border-l-4 border-l-green-500 bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Highest Understanding Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={analytics.most_understood_concept?.concept_name}>
                            {analytics.most_understood_concept?.concept_name ?? "No data yet"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {analytics.most_understood_concept && (
                                <CheckCircle2 className={`h-4 w-4 ${getGrade(analytics.most_understood_concept.average_score).colorClass.split(" ")[0]}`} />
                            )}
                            <p className={`text-xs ${analytics.most_understood_concept ? getGrade(analytics.most_understood_concept.average_score).colorClass : "text-muted-foreground"}`}>
                                {analytics.most_understood_concept ? getGrade(analytics.most_understood_concept.average_score).grade : "Keep learning!"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 lg:col-span-1 border-l-4 border-l-red-500 bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Lowest Understanding Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate" title={analytics.least_understood_concept?.concept_name}>
                            {analytics.least_understood_concept?.concept_name ?? "No data yet"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {analytics.least_understood_concept && (
                                <AlertCircle className={`h-4 w-4 ${getGrade(analytics.least_understood_concept.average_score).colorClass.split(" ")[0]}`} />
                            )}
                            <p className={`text-xs ${analytics.least_understood_concept ? getGrade(analytics.least_understood_concept.average_score).colorClass : "text-muted-foreground"}`}>
                                {analytics.least_understood_concept ? getGrade(analytics.least_understood_concept.average_score).grade : "More practice needed"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Understanding by Chapter</h3>
                <ChapterAnalyticsList chapters={chapters} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Highest Understanding Score Assignment</CardTitle>
                        <CardDescription>Highest scoring recent assignment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">{analytics.easiest_assignment?.assignment_title ?? "N/A"}</div>
                        <div className="flex items-center gap-2 mt-2">
                            {analytics.easiest_assignment && (
                                <CheckCircle2 className={`h-5 w-5 ${getGrade(analytics.easiest_assignment.average_score).colorClass.split(" ")[0]}`} />
                            )}
                            <div className={`text-2xl font-bold ${analytics.easiest_assignment ? getGrade(analytics.easiest_assignment.average_score).colorClass : "text-primary"}`}>
                                {analytics.easiest_assignment ? getGrade(analytics.easiest_assignment.average_score).grade : "-"}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Lowest Understanding Score Assignment</CardTitle>
                        <CardDescription>Lowest scoring recent assignment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">{analytics.hardest_assignment?.assignment_title ?? "N/A"}</div>
                        <div className="flex items-center gap-2 mt-2">
                            {analytics.hardest_assignment && (
                                <AlertCircle className={`h-5 w-5 ${getGrade(analytics.hardest_assignment.average_score).colorClass.split(" ")[0]}`} />
                            )}
                            <div className={`text-2xl font-bold ${analytics.hardest_assignment ? getGrade(analytics.hardest_assignment.average_score).colorClass : "text-primary"}`}>
                                {analytics.hardest_assignment ? getGrade(analytics.hardest_assignment.average_score).grade : "-"}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
