"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getClassAnalytics, getChapterAnalytics } from "@/app/lib/api/analytics";
import { ClassAnalytics, ChapterAnalytics, StudentScoreSummary } from "@/app/types/analytics";
import { ScoreDistributionChart } from "@/components/dashboard/charts/ScoreDistributionChart";
import { WeaknessChart } from "@/components/dashboard/charts/WeaknessChart";
import { ChapterAnalyticsList } from "@/components/analytics/ChapterAnalyticsList";
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { motion, AnimatePresence } from "motion/react";
import { StudentAnalyticsDialog } from "@/components/dashboard/StudentAnalyticsDialog";
import { AnalyticsEmptyState } from "@/components/dashboard/analytics/AnalyticsEmptyState";
import { getGrade } from "@/lib/grading";

import { StudentRead } from "@/app/types/school";

interface ClassAnalyticsViewProps {
    classId: number;
    students?: StudentRead[];
}

export function ClassAnalyticsView({ classId, students = [] }: ClassAnalyticsViewProps) {
    const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
    const [chapters, setChapters] = useState<ChapterAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false); // Toggle for student list expansion

    const [selectedStudent, setSelectedStudent] = useState<StudentScoreSummary | null>(null);

    useEffect(() => {
        if (!classId) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        Promise.all([
            getClassAnalytics(classId),
            getChapterAnalytics(classId)
        ])
            .then(([classData, chapterData]) => {
                if (!isMounted) return;
                setAnalytics(classData);
                setChapters(chapterData);
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

    const showLoader = useSmoothLoading(loading);

    // Prepare concepts for mocking
    const allConcepts = useMemo(() =>
        chapters.flatMap(c => c.concepts).map(c => c.concept_name),
        [chapters]);

    // Merge rankings with full student roster to ensure everyone is shown
    const displayStudents = useMemo(() => {
        if (!analytics) return [];

        const rankedIds = new Set(analytics.student_rankings.map(r => r.student_id));
        const unrankedStudents = students
            .filter(s => !rankedIds.has(s.id))
            .map(s => ({
                student_id: s.id,
                student_name: s.name || `Student ${s.id}`,
                average_score: 0,
                best_concept: undefined,
                worst_concept: undefined,
                rank: 0 // placeholder
            } as StudentScoreSummary));

        // Sort unranked alphabetically
        unrankedStudents.sort((a, b) => a.student_name.localeCompare(b.student_name));

        return [...analytics.student_rankings, ...unrankedStudents];
    }, [analytics, students]);

    if (showLoader) {
        return (
            <div className="grid h-64 place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading analytics...</span>
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

    // Detect empty state: no analytics data OR no meaningful student rankings
    const hasNoData = !analytics ||
        (analytics.student_rankings.length === 0 &&
            !analytics.most_understood_assignment &&
            !analytics.least_understood_assignment &&
            (!analytics.weakness_groups || analytics.weakness_groups.length === 0));

    if (hasNoData) {
        return <AnalyticsEmptyState />;
    }

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">Class Overview</h3>
                <p className="text-sm text-muted-foreground">High-level metrics and student rankings for this class.</p>
            </div>

            {analytics.class_status && (
                <div className="py-2">
                    <h2 className={`text-3xl font-bold ${analytics.class_status_color || "text-foreground"}`}>
                        {analytics.class_status}
                    </h2>
                </div>
            )}



            <div className="space-y-6">
                {/* Top Level Charts Row */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">Class Understanding Distribution</h4>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground/70" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Understanding Scores are derived from AI analysis of student chat interactions and assignment performance.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <ScoreDistributionChart scores={displayStudents.map(s => s.average_score)} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">Focus Areas Overview</h4>
                        </div>
                        {analytics.weakness_groups && analytics.weakness_groups.length > 0 ? (
                            <WeaknessChart groups={analytics.weakness_groups} />
                        ) : (
                            <Card className="shadow-sm border-dashed flex flex-col items-center justify-center p-6 text-muted-foreground bg-muted/20 h-[250px]">
                                <p>No focus areas identified yet.</p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Chapter Breakdown */}
                <ChapterAnalyticsList chapters={chapters} />

                {/* Focus Areas Details */}
                {analytics.weakness_groups && analytics.weakness_groups.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold tracking-tight">Targeted Focus Areas</h3>
                            <p className="text-sm text-muted-foreground">Concepts where students may need additional support.</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {analytics.weakness_groups.map((group) => (
                                <Card key={group.concept_id} className="border-l-4 border-l-orange-400 bg-background/60 shadow-md">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-semibold">{group.concept_name}</CardTitle>
                                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                                Avg: {getGrade(group.average_score).grade}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-sm space-y-1 mt-2">
                                            {group.students.map((student) => (
                                                <li key={student.student_id} className="flex justify-between items-center">
                                                    <span>{student.student_name}</span>
                                                    <span className={`text-xs ${getGrade(student.average_score).colorClass}`}>{getGrade(student.average_score).grade}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
                <Card className="md:col-span-2 lg:col-span-2 border-l-4 border-l-green-500 bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Highest Understanding Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={analytics.most_understood_assignment?.assignment_title}>
                            {analytics.most_understood_assignment?.assignment_title ?? "No data yet"}
                        </div>
                        <p className={`text-xs mt-1 ${analytics.most_understood_assignment ? getGrade(analytics.most_understood_assignment.average_score).colorClass : "text-muted-foreground"}`}>
                            {analytics.most_understood_assignment ? getGrade(analytics.most_understood_assignment.average_score).grade : "No data"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 lg:col-span-2 border-l-4 border-l-red-500 bg-background/60 shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Lowest Understanding Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={analytics.least_understood_assignment?.assignment_title}>
                            {analytics.least_understood_assignment?.assignment_title ?? "No data yet"}
                        </div>
                        <p className={`text-xs mt-1 ${analytics.least_understood_assignment ? getGrade(analytics.least_understood_assignment.average_score).colorClass : "text-muted-foreground"}`}>
                            {analytics.least_understood_assignment ? getGrade(analytics.least_understood_assignment.average_score).grade : "No data"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

