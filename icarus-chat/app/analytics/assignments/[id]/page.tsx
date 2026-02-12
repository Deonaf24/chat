"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { getAssignmentAnalytics } from "@/app/lib/api/analytics";
import { AssignmentAnalytics } from "@/app/types/analytics";

export default function AssignmentAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, teacher, loading: authLoading } = useDashboardAuth();
    const [analyzing, setAnalyzing] = useState(false);
    const [analytics, setAnalytics] = useState<AssignmentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const assignmentId = useMemo(() => {
        const idParam = params?.id;
        if (!idParam) return null;
        const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
        return Number.isNaN(numericId) ? null : numericId;
    }, [params]);

    const loadAnalytics = (id: number) => {
        setLoading(true);
        setError(null);
        getAssignmentAnalytics(id)
            .then((response) => {
                setAnalytics(response);
            })
            .catch(() => {
                setError("Unable to load assignment analytics right now.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        if (authLoading || !assignmentId) return;
        loadAnalytics(assignmentId);
    }, [assignmentId, authLoading]);

    const handleAnalyze = async () => {
        if (!assignmentId) return;
        setAnalyzing(true);
        try {
            await import("@/app/lib/api/school").then(mod => mod.scoreAssignment(String(assignmentId)));
            loadAnalytics(assignmentId);
        } catch (err) {
            console.error(err);
            setError("Failed to generate analytics");
        } finally {
            setAnalyzing(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="grid h-dvh place-items-center">
                <p className="text-sm text-muted-foreground">Loading assignment analytics...</p>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="grid h-dvh place-items-center px-6">
                <div className="max-w-md space-y-3 text-center">
                    <p className="text-lg font-semibold">Unable to open analytics</p>
                    <p className="text-sm text-muted-foreground">{error ?? "Analytics data not available."}</p>
                    <div className="flex justify-center gap-2">
                        <button className="text-sm text-primary underline" onClick={() => router.back()}>
                            Go back
                        </button>
                        {assignmentId && (
                            <button
                                disabled={analyzing}
                                onClick={handleAnalyze}
                                className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
                            >
                                {analyzing ? "Generating..." : "Generate Analytics"}
                            </button>
                        )}
                    </div>
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

            <main className="mx-auto max-w-5xl space-y-6 px-6 pb-16 pt-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Assignment Insights</h1>
                        <p className="text-muted-foreground">Deep dive into student understanding and performance.</p>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    >
                        {analyzing ? "Updating..." : "Refresh Data"}
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="border-l-4 border-l-green-500 bg-background/60 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Top Concept</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate" title={analytics.most_understood_concept?.concept_name}>
                                {analytics.most_understood_concept?.concept_name ?? "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.most_understood_concept ? `${Math.round(analytics.most_understood_concept.average_score * 100)}% mastery` : "No data"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 bg-background/60 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Focus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate" title={analytics.least_understood_concept?.concept_name}>
                                {analytics.least_understood_concept?.concept_name ?? "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.least_understood_concept ? `${Math.round(analytics.least_understood_concept.average_score * 100)}% mastery` : "No data"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 bg-background/60 shadow-md md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Easiest Question</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium line-clamp-2" title={analytics.most_understood_question?.question_prompt}>
                                {analytics.most_understood_question?.question_prompt ?? "N/A"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500 bg-background/60 shadow-md md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Hardest Question</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium line-clamp-2" title={analytics.least_understood_question?.question_prompt}>
                                {analytics.least_understood_question?.question_prompt ?? "N/A"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-6 py-4">
                        <div className="space-y-1">
                            <CardTitle>Student Rankings</CardTitle>
                            <CardDescription>Performance ranking for this specific assignment.</CardDescription>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">{analytics.student_rankings?.length ?? 0} Students</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {(!analytics.student_rankings || analytics.student_rankings.length === 0) ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No student rankings availble for this assignment.
                            </div>
                        ) : (
                            <ul className="divide-y divide-border">
                                {analytics.student_rankings.map((ranking, index) => (
                                    <li key={ranking.student_id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium leading-none">{ranking.student_name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">ID: #{ranking.student_id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-sm font-bold">{Math.round(ranking.average_score * 100)}%</span>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
                                            </div>
                                            <div className="h-2 w-16 rounded-full bg-muted overflow-hidden hidden sm:block">
                                                <div className="h-full bg-primary" style={{ width: `${ranking.average_score * 100}%` }} />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
