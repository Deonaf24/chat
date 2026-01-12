"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getStudentAnalytics } from "@/app/lib/api/analytics";
import { StudentAnalytics } from "@/app/types/analytics";

interface StudentAnalyticsViewProps {
    studentId: number;
}

export function StudentAnalyticsView({ studentId }: StudentAnalyticsViewProps) {
    const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId) return;

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
                setError("Unable to load student analytics.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [studentId]);

    if (loading) {
        return (
            <div className="grid h-64 place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading student analytics...</span>
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
                <h3 className="text-2xl font-bold tracking-tight">Performance Overview</h3>
                <p className="text-sm text-muted-foreground">Detailed insights into this student's learning progress.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Questions Asked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.questions_asked}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total interactions</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-2 border-l-4 border-l-green-500 bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Strongest Concept</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={analytics.most_understood_concept?.concept_name}>
                            {analytics.most_understood_concept?.concept_name ?? "No data yet"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.most_understood_concept ? `Avg Score: ${Math.round(analytics.most_understood_concept.average_score * 100)}%` : "Keep learning!"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 lg:col-span-1 border-l-4 border-l-red-500 bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Needs Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate" title={analytics.least_understood_concept?.concept_name}>
                            {analytics.least_understood_concept?.concept_name ?? "No data yet"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.least_understood_concept ? `Avg Score: ${Math.round(analytics.least_understood_concept.average_score * 100)}%` : "More practice needed"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Best Assignment</CardTitle>
                        <CardDescription>Highest scoring recent assignment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">{analytics.easiest_assignment?.assignment_title ?? "N/A"}</div>
                        <div className="text-2xl font-bold text-green-600 mt-2">
                            {analytics.easiest_assignment ? `${Math.round(analytics.easiest_assignment.average_score * 100)}%` : "-"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Challenging Assignment</CardTitle>
                        <CardDescription>Lowest scoring recent assignment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">{analytics.hardest_assignment?.assignment_title ?? "N/A"}</div>
                        <div className="text-2xl font-bold text-red-600 mt-2">
                            {analytics.hardest_assignment ? `${Math.round(analytics.hardest_assignment.average_score * 100)}%` : "-"}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
