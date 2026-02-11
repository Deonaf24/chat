"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { AnalyticsMode } from "@/components/dashboard/AnalyticsModeSelector";
import { ClassAnalyticsView } from "@/components/dashboard/ClassAnalyticsView";
import { StudentAnalyticsView } from "@/components/dashboard/StudentAnalyticsView";
import { StudentRankingsList } from "@/components/dashboard/StudentRankingsList";
import { AssignmentAnalyticsView } from "@/components/dashboard/AssignmentAnalyticsView";

import { useClassContext } from "@/app/dashboard/classes/[id]/context";

interface AnalyticsTabProps {
    mode: AnalyticsMode;
    // classId, students, assignments, isTeacher are all in context
    currentStudentId?: number;
}

export function AnalyticsTab({
    mode,
    currentStudentId
}: AnalyticsTabProps) {
    const { classId, students, assignments, isTeacher } = useClassContext();
    // Teacher Views
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

    // Scroll Jump Fix: Lock container height during transitions
    const [minHeight, setMinHeight] = useState<number | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const modeRef = useRef(mode);

    useEffect(() => {
        modeRef.current = mode;
        if (containerRef.current) {
            setMinHeight(containerRef.current.offsetHeight);
        }
    }, [mode]);

    const handleAnimationComplete = (completedMode: AnalyticsMode) => {
        if (modeRef.current === completedMode) {
            setMinHeight(undefined);
        }
    }

    // If student, always show their own analytics regardless of mode (or we could hide selector)
    if (!isTeacher) {
        return currentStudentId ? (
            <StudentAnalyticsView studentId={currentStudentId} classId={classId} />
        ) : (
            <div className="py-8 text-center text-muted-foreground">Analytics not available.</div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{ minHeight: minHeight ? `${minHeight}px` : undefined }}
            className="transition-[min-height] duration-200"
        >
            <AnimatePresence mode="wait">
                {mode === 'class' && (
                    <motion.div
                        key="class"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onAnimationComplete={() => handleAnimationComplete('class')}
                        className="min-h-[calc(100vh-16rem)]"
                    >
                        <ClassAnalyticsView classId={classId} students={students} />
                    </motion.div>
                )}

                {mode === 'student' && (
                    <motion.div
                        key="student"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onAnimationComplete={() => handleAnimationComplete('student')}
                        className="min-h-[calc(100vh-16rem)]"
                    >
                        {selectedStudentId ? (
                            <div className="space-y-4">
                                <Button variant="ghost" onClick={() => setSelectedStudentId(null)} className="pl-0 gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Back to Students
                                </Button>
                                <StudentAnalyticsView studentId={selectedStudentId} classId={classId} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold tracking-tight">Student Rankings</h3>
                                    <p className="text-sm text-muted-foreground">Select a student to view detailed analytics.</p>
                                </div>
                                <StudentRankingsList
                                    classId={classId}
                                    students={students}
                                    onStudentClick={setSelectedStudentId}
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {mode === 'assignment' && (
                    <motion.div
                        key="assignment"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onAnimationComplete={() => handleAnimationComplete('assignment')}
                        className="min-h-[calc(100vh-16rem)]"
                    >
                        {selectedAssignmentId ? (
                            <div className="space-y-4">
                                <Button variant="ghost" onClick={() => setSelectedAssignmentId(null)} className="pl-0 gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Back to Assignments
                                </Button>
                                <AssignmentAnalyticsView assignmentId={selectedAssignmentId} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold tracking-tight">Assignment Performance</h3>
                                    <p className="text-sm text-muted-foreground">Select an assignment to view metrics.</p>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {assignments.map(assignment => (
                                        <Card
                                            key={assignment.id}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => setSelectedAssignmentId(assignment.id)}
                                        >
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base line-clamp-1" title={assignment.title}>
                                                        {assignment.title}
                                                    </CardTitle>
                                                    <Badge variant="outline">
                                                        {format(new Date(assignment.due_at || new Date()), "MMM d")}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="line-clamp-2 min-h-[2.5em]">
                                                    {assignment.description || "No description"}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                    {assignments.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                            No assignments found for this class.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
