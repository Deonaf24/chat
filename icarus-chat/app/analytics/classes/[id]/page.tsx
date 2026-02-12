"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { getClassAnalytics } from "@/app/lib/api/analytics";
import { ClassAnalytics } from "@/app/types/analytics";

export default function ClassAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, teacher, loading: authLoading } = useDashboardAuth();
    const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const classId = useMemo(() => {
        const idParam = params?.id;
        if (!idParam) return null;
        const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
        return Number.isNaN(numericId) ? null : numericId;
    }, [params]);

    useEffect(() => {
        if (authLoading || !classId) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        getClassAnalytics(classId)
            .then((response) => {
                if (!isMounted) return;
                setAnalytics(response);
            })
            .catch(() => {
                if (!isMounted) return;
                setError("Unable to load class analytics right now.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [authLoading, classId]);

    if (authLoading || loading) {
        return (
            <div className="grid h-dvh place-items-center">
                <p className="text-sm text-muted-foreground">Loading class analytics...</p>
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
                    <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Class Overview</h1>
                    <p className="text-lg text-muted-foreground">High-level metrics and student rankings for this class.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card className="md:col-span-2 lg:col-span-2 border-l-4 border-l-green-500 bg-background/60 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Most Understood Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate" title={analytics.most_understood_assignment?.assignment_title}>
                                {analytics.most_understood_assignment?.assignment_title ?? "No data yet"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.most_understood_assignment ? `Avg Score: ${Math.round(analytics.most_understood_assignment.average_score * 100)}%` : "No data"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2 lg:col-span-2 border-l-4 border-l-red-500 bg-background/60 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Least Understood Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate" title={analytics.least_understood_assignment?.assignment_title}>
                                {analytics.least_understood_assignment?.assignment_title ?? "No data yet"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {analytics.least_understood_assignment ? `Avg Score: ${Math.round(analytics.least_understood_assignment.average_score * 100)}%` : "No data"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-6 py-4">
                        <div className="space-y-1">
                            <CardTitle>Student Rankings</CardTitle>
                            <CardDescription>Performance leaderboard based on average understanding scores.</CardDescription>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">{analytics.student_rankings.length} Students</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {analytics.student_rankings.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No student analytics available yet.
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
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</p>
                                            </div>
                                            {/* Visual indicator bar could go here */}
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
