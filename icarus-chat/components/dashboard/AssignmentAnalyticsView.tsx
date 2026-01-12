"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getAssignmentAnalytics } from "@/app/lib/api/analytics";
import { AssignmentAnalytics } from "@/app/types/analytics";
import { ScoreDistributionChart } from "@/components/dashboard/charts/ScoreDistributionChart";
import { WeaknessChart } from "@/components/dashboard/charts/WeaknessChart";

interface AssignmentAnalyticsViewProps {
    assignmentId: number;
}

export function AssignmentAnalyticsView({ assignmentId }: AssignmentAnalyticsViewProps) {
    const [analytics, setAnalytics] = useState<AssignmentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!assignmentId) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        getAssignmentAnalytics(assignmentId)
            .then((response) => {
                if (!isMounted) return;
                setAnalytics(response);
            })
            .catch(() => {
                if (!isMounted) return;
                setError("Unable to load assignment analytics.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [assignmentId]);

    if (loading) {
        return (
            <div className="grid h-64 place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading assignment analytics...</span>
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

    // Calculate generic average if student rankings exist
    const averageScore = analytics.student_rankings.length > 0
        ? Math.round(analytics.student_rankings.reduce((acc, curr) => acc + curr.average_score, 0) / analytics.student_rankings.length * 100)
        : 0;

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">Assignment Insights</h3>
                <p className="text-sm text-muted-foreground">Performance breakdown for this assignment.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Class Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{averageScore}%</div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-2 border-l-4 border-l-green-500 bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Top Concept</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={analytics.most_understood_concept?.concept_name}>
                            {analytics.most_understood_concept?.concept_name ?? "No data yet"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics.most_understood_concept ? `Avg Score: ${Math.round(analytics.most_understood_concept.average_score * 100)}%` : "Keep analyzing"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 lg:col-span-1 border-l-4 border-l-red-500 bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Hardest Concept</CardTitle>
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
                        <CardTitle>Top Question</CardTitle>
                        <CardDescription>Most students answered this correctly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base italic">"{analytics.most_understood_question?.question_prompt ?? "N/A"}"</p>
                        <div className="text-xl font-bold text-green-600 mt-2">
                            {analytics.most_understood_question ? `${Math.round(analytics.most_understood_question.average_score * 100)}% Correct` : "-"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Needs Review</CardTitle>
                        <CardDescription>Many students struggled with this question.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base italic">"{analytics.least_understood_question?.question_prompt ?? "N/A"}"</p>
                        <div className="text-xl font-bold text-red-600 mt-2">
                            {analytics.least_understood_question ? `${Math.round(analytics.least_understood_question.average_score * 100)}% Correct` : "-"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visuals Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <ScoreDistributionChart scores={analytics.student_rankings.map(s => s.average_score)} />
                {analytics.weakness_groups && analytics.weakness_groups.length > 0 ? (
                    <WeaknessChart groups={analytics.weakness_groups} />
                ) : (
                    <Card className="shadow-sm border-dashed flex flex-col items-center justify-center p-6 text-muted-foreground bg-muted/20">
                        <p>No weakness grouping data available yet.</p>
                    </Card>
                )}
            </div>

            {analytics.weakness_groups && analytics.weakness_groups.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight">Targeted Intervention Groups</h3>
                        <p className="text-sm text-muted-foreground">Students grouped by shared concepts they are struggling with ({'<'} 60%).</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {analytics.weakness_groups.map((group) => (
                            <Card key={group.concept_id} className="border-l-4 border-l-orange-500 bg-background/60 shadow-md">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-semibold">{group.concept_name}</CardTitle>
                                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                                            Avg: {Math.round(group.average_score * 100)}%
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {group.students.length} student{group.students.length !== 1 ? 's' : ''} struggling
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm space-y-1 mt-2">
                                        {group.students.map((student) => (
                                            <li key={student.student_id} className="flex justify-between items-center">
                                                <span>{student.student_name}</span>
                                                <span className="text-muted-foreground text-xs">{Math.round(student.average_score * 100)}%</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div >
    );
}
