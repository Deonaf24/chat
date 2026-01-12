"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { getClassAnalytics } from "@/app/lib/api/analytics";
import { ClassAnalytics } from "@/app/types/analytics";
import { ScoreDistributionChart } from "@/components/dashboard/charts/ScoreDistributionChart";
import { WeaknessChart } from "@/components/dashboard/charts/WeaknessChart";

interface ClassAnalyticsViewProps {
    classId: number;
}

export function ClassAnalyticsView({ classId }: ClassAnalyticsViewProps) {
    const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!classId) return;

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
    }, [classId]);

    if (loading) {
        return (
            <div className="grid h-64 place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading analytics...</span>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="grid h-64 place-items-center px-6">
                <div className="max-w-md space-y-3 text-center">
                    <p className="text-lg font-semibold">Unable to display analytics</p>
                    <p className="text-sm text-muted-foreground">{error ?? "Analytics data not available."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">Class Overview</h3>
                <p className="text-sm text-muted-foreground">High-level metrics and student rankings for this class.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card className="shadow-sm h-full">
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
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 border border-border">
                                                        <AvatarImage src={`https://avatar.vercel.sh/${ranking.student_id}`} />
                                                        <AvatarFallback>
                                                            {ranking.student_name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .substring(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium leading-none">{ranking.student_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <span className="text-sm font-bold">{Math.round(ranking.average_score * 100)}%</span>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</p>
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
                </div>
                <div className="space-y-6">
                    <ScoreDistributionChart scores={analytics.student_rankings.map(s => s.average_score)} />
                    {analytics.weakness_groups && analytics.weakness_groups.length > 0 ? (
                        <WeaknessChart groups={analytics.weakness_groups} />
                    ) : (
                        <Card className="shadow-sm border-dashed flex flex-col items-center justify-center p-6 text-muted-foreground bg-muted/20 h-[250px]">
                            <p>No weakness grouping data available yet.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div >
    );
}
