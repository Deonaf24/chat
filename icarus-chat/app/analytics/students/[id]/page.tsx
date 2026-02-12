"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { getStudentAnalytics } from "@/app/lib/api/analytics";
import { StudentAnalytics } from "@/app/types/analytics";

export default function StudentAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, teacher, loading: authLoading } = useDashboardAuth();
    const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const studentId = useMemo(() => {
        const idParam = params?.id;
        if (!idParam) return null;
        const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
        return Number.isNaN(numericId) ? null : numericId;
    }, [params]);

    useEffect(() => {
        if (authLoading || !studentId) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        getStudentAnalytics(studentId)
            .then((response) => {
                if (!isMounted) return;
                setAnalytics(response);
            })
            .catch(() => {
                if (!isMounted) return;
                setError("Unable to load student analytics right now.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [authLoading, studentId]);

    if (authLoading || loading) {
        return (
            <div className="grid h-dvh place-items-center">
                <p className="text-sm text-muted-foreground">Loading student analytics...</p>
            </div>
        );
    }

    if (!analytics || error) {
        return (
            <div className="grid h-dvh place-items-center px-6">
                <div className="max-w-md space-y-3 text-center">
                    <p className="text-lg font-semibold">Unable to open analytics</p>
                    <p className="text-sm text-muted-foreground">{error ?? "Analytics data not available."}</p>
                    <button className="text-sm text-primary underline" onClick={() => router.back()}>
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-muted/30">
            <Navbar
                name="Socratica"
                homeUrl="/dashboard"
                actions={[{ text: "Dashboard", href: "/dashboard" }]}
            />

            <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <div className="mb-8 space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Student Overview</h1>
                    <p className="text-lg text-muted-foreground">Detailed performance metrics for this student.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="col-span-full lg:col-span-1 border-l-4 border-l-purple-500 bg-background/60 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{analytics.questions_asked}</div>
                            <p className="text-xs text-muted-foreground mt-1">Questions asked to AI</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 bg-background/60 shadow-md md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Top Concept</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold truncate" title={analytics.most_understood_concept?.concept_name}>
                                {analytics.most_understood_concept?.concept_name ?? "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.most_understood_concept ? `${Math.round(analytics.most_understood_concept.average_score * 100)}% mastery` : "No data"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500 bg-background/60 shadow-md md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Focus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold truncate" title={analytics.least_understood_concept?.concept_name}>
                                {analytics.least_understood_concept?.concept_name ?? "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.least_understood_concept ? `${Math.round(analytics.least_understood_concept.average_score * 100)}% mastery` : "No data"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 border-l-4 border-l-blue-400 bg-background/60 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Easiest Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold truncate">{analytics.easiest_assignment?.assignment_title ?? "No data yet"}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.easiest_assignment ? `Avg Score: ${Math.round(analytics.easiest_assignment.average_score * 100)}%` : ""}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2 border-l-4 border-l-orange-400 bg-background/60 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Hardest Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold truncate">{analytics.hardest_assignment?.assignment_title ?? "No data yet"}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.hardest_assignment ? `Avg Score: ${Math.round(analytics.hardest_assignment.average_score * 100)}%` : ""}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
