"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClassAnalytics, getChapterAnalytics } from "@/app/lib/api/analytics";
import { ClassAnalytics, ChapterAnalytics, StudentScoreSummary } from "@/app/types/analytics";
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { motion, AnimatePresence } from "motion/react";
import { StudentRead } from "@/app/types/school";
import { getGrade } from "@/lib/grading";
import { AnalyticsEmptyState } from "@/components/dashboard/analytics/AnalyticsEmptyState";

interface StudentRankingsListProps {
    classId: number;
    students: StudentRead[]; // Full roster to ensure unranked students are included
    onStudentClick: (studentId: number) => void;
}

export function StudentRankingsList({ classId, students, onStudentClick }: StudentRankingsListProps) {
    const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
    const [chapters, setChapters] = useState<ChapterAnalytics[]>([]); // Needed for concepts mock
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

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
                setError("Unable to load student rankings.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [classId]);

    const showLoader = useSmoothLoading(loading);

    // Prepare concepts for mocking (same logic as before)
    const allConcepts = useMemo(() =>
        chapters.flatMap(c => c.concepts).map(c => c.concept_name),
        [chapters]);

    // Merge rankings with full student roster
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
                rank: 0
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
                    <span>Loading rankings...</span>
                </div>
            </div>
        );
    }

    if (loading) return null;

    if (error) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                {error}
            </div>
        )
    }

    // Detect empty state
    const hasNoData = !analytics || analytics.student_rankings.length === 0;

    if (hasNoData) {
        return (
            <AnalyticsEmptyState
                title="No Student Performance Data Yet"
                subtitle="Student rankings will appear once they begin engaging with assignments and course materials."
            />
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-6 py-4">
                <div className="space-y-1">
                    <CardTitle>Student Rankings</CardTitle>
                </div>
                <Badge variant="secondary" className="px-3 py-1">{displayStudents.length} Students</Badge>
            </CardHeader>
            <CardContent className="p-0">
                {displayStudents.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No students enrolled yet.
                    </div>
                ) : (
                    <>
                        <ul className="divide-y divide-border">
                            {/* Top 10 always shown (increased from 5 for dedicated view) */}
                            {displayStudents.slice(0, 10).map((ranking, index) => (
                                <StudentRankingRow
                                    key={ranking.student_id}
                                    ranking={ranking}
                                    rank={index + 1}
                                    allConcepts={allConcepts}
                                    onClick={() => onStudentClick(ranking.student_id)}
                                />
                            ))}

                            {/* Animated Rest */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        {displayStudents.slice(10).map((ranking, index) => (
                                            <StudentRankingRow
                                                key={ranking.student_id}
                                                ranking={ranking}
                                                rank={index + 11}
                                                allConcepts={allConcepts}
                                                onClick={() => onStudentClick(ranking.student_id)}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </ul>
                        {displayStudents.length > 10 && (
                            <div className="border-t">
                                <Button
                                    variant="ghost"
                                    className="w-full rounded-none h-12 text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    {isExpanded ? (
                                        <>
                                            <ChevronUp className="mr-2 h-4 w-4" />
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="mr-2 h-4 w-4" />
                                            Show All ({displayStudents.length - 10} more)
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function StudentRankingRow({ ranking, rank, allConcepts, onClick }: { ranking: StudentScoreSummary, rank: number, allConcepts: string[], onClick: () => void }) {
    const [showBubbles, setShowBubbles] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Mock data logic
    const bestConcept = useMemo(() => ranking.best_concept || allConcepts[Math.floor(Math.random() * allConcepts.length)] || "Algebra", [ranking, allConcepts]);
    const worstConcept = useMemo(() => ranking.worst_concept || allConcepts[Math.floor(Math.random() * allConcepts.length)] || "Geometry", [ranking, allConcepts]);

    const handleMouseMove = (e: React.MouseEvent) => {
        // Hide immediately on move
        setShowBubbles(false);
        if (timerRef.current) clearTimeout(timerRef.current);

        const x = e.clientX;
        const y = e.clientY;
        setMousePos({ x, y });

        // Show after 500ms stationery
        timerRef.current = setTimeout(() => {
            setShowBubbles(true);
        }, 500);
    };

    const handleMouseLeave = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setShowBubbles(false);
    }

    const grade = getGrade(ranking.average_score);

    return (
        <>
            <li
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={onClick}
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={`https://avatar.vercel.sh/${ranking.student_id}`} />
                            <AvatarFallback>
                                {ranking.student_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
                            {rank}
                        </div>
                    </div>
                    <div>
                        <p className="font-medium leading-none">{ranking.student_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className={`text-sm font-bold ${grade.colorClass}`}>{grade.grade}</span>
                    </div>
                    <div className="h-2 w-16 rounded-full bg-muted overflow-hidden hidden sm:block">
                        <div className="h-full transition-all duration-300" style={{ width: `${ranking.average_score * 100}%`, backgroundColor: grade.colorHex }} />
                    </div>
                </div>
            </li>

            {/* Portal-like Bubble Overlay */}
            <AnimatePresence>
                {showBubbles && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="fixed z-50 pointer-events-none"
                        style={{ left: mousePos.x, top: mousePos.y }}
                    >
                        {/* Positioning: Left and Right of cursor */}
                        {/* Worst (Red) - Left/Top offset */}
                        <div className="absolute -top-12 -left-32 flex items-center justify-end w-32 pr-2">
                            <div className="bg-background border-2 border-red-500 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                                <span>{worstConcept}</span>
                            </div>
                        </div>

                        {/* Best (Green) - Right/Top offset */}
                        <div className="absolute -top-12 left-4 flex items-center w-32 pl-2">
                            <div className="bg-background border-2 border-green-500 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                                <span>{bestConcept}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
