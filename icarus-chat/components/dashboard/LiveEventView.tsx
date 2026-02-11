"use client";

import { useState, useEffect } from "react";
import { Loader2, Zap, CheckCircle2, Circle, ArrowLeft, CheckCircle, XCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { getClassConcepts } from "@/app/lib/api/analytics";
import { getChapters, generateLiveQuestions } from "@/app/lib/api/school";
import { getSessionHistory, getDetailedSessionStats } from "@/app/lib/api/live";
import { ConceptPayload } from "@/app/types/analytics";
import { ChapterRead } from "@/app/types/school";
import { LiveSessionSummary, LiveDetailedStats } from "@/app/types/live";

import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { useLiveSession } from "@/hooks/useLiveSession";

import { StudentLiveSessionView } from "./StudentLiveSessionView";
import { TeacherLiveSessionView } from "./TeacherLiveSessionView";
import { LiveSessionConfig } from "./live/LiveSessionConfig";
import { PastSessionsList } from "./live/PastSessionsList";

interface LiveEventViewProps {
    classId: number;
    isTeacher: boolean;
    studentId?: number;
}

export function LiveEventView({ classId, isTeacher, studentId }: LiveEventViewProps) {
    const [loading, setLoading] = useState(true);
    const [concepts, setConcepts] = useState<ConceptPayload[]>([]);
    const [chapters, setChapters] = useState<ChapterRead[]>([]);
    const [selectedChapterId, setSelectedChapterId] = useState<string>("all");
    const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([]);

    // Core Session State
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const { session, refreshSession } = useLiveSession(activeSessionId, isTeacher ? 'teacher' : 'student', studentId);
    const [starting, setStarting] = useState(false);

    // Session history state
    const [pastSessions, setPastSessions] = useState<LiveSessionSummary[]>([]);
    const [selectedPastSession, setSelectedPastSession] = useState<LiveDetailedStats | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        if (isTeacher) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [classId, isTeacher]);

    // Update active session ID if hook detects one (mostly for student polling auto-join)
    // Actually the hook requires an ID to poll. 
    // We need a way to discover the active session ID first.
    // The original code had a separate poller for getActiveSession inside useEffect.
    // We should probably keep that discovery logic or move it to a useActiveSessionDiscovery hook.
    // For now, I'll keep the discovery logic here as it's separate from operating a known session.
    useEffect(() => {
        // Poll for active session
        import("@/app/lib/api/live").then(({ getActiveSession }) => {
            const check = async () => {
                try {
                    const sess = await getActiveSession(classId);
                    if (sess) {
                        setActiveSessionId(sess.id);
                    } else if (!isTeacher) {
                        // Only clear for student, teacher might be in setup mode
                        setActiveSessionId(null);
                    }
                } catch (e) { console.error(e); }
            };

            check();
            const interval = setInterval(check, 5000);
            return () => clearInterval(interval);
        });
    }, [classId, isTeacher]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [conceptsData, chaptersData, historyData] = await Promise.all([
                getClassConcepts(classId),
                getChapters(classId),
                getSessionHistory(classId)
            ]);
            setConcepts(conceptsData);
            setChapters(chaptersData);
            setPastSessions(historyData.filter(s => s.status === "ended"));
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load class data.");
        } finally {
            setLoading(false);
        }
    };

    const toggleConcept = (id?: number) => {
        if (!id) return;
        setSelectedConceptIds(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleStartSession = async (timeLimit: number, questionTypes: string[]) => {
        setStarting(true);
        try {
            const data = await generateLiveQuestions(classId, selectedConceptIds, timeLimit, questionTypes);
            setActiveSessionId(data.session.id);
            toast.success(`Live session started! Time limit: ${timeLimit}m`);
        } catch (error) {
            console.error("Failed to generate live event", error);
            toast.error("Failed to initialize live session context.");
        } finally {
            setStarting(false);
        }
    };

    const handleViewPastSession = async (sessionId: number) => {
        setLoadingDetail(true);
        try {
            const stats = await getDetailedSessionStats(sessionId);
            setSelectedPastSession(stats);
        } catch (error) {
            console.error("Failed to load session details", error);
            toast.error("Failed to load session details.");
        } finally {
            setLoadingDetail(false);
        }
    };

    const filteredConcepts = selectedChapterId === "all"
        ? concepts
        : concepts.filter(c => {
            const chapter = chapters.find(ch => ch.id.toString() === selectedChapterId);
            return chapter?.concept_ids.includes(c.id!);
        });

    const showLoader = useSmoothLoading(loading);

    if (showLoader) {
        return (
            <div className="h-60 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (loading) return null;

    // ACTIVE SESSION VIEW
    if (activeSessionId) {
        if (isTeacher) {
            return (
                <TeacherLiveSessionView
                    sessionId={activeSessionId}
                    onEnd={() => {
                        setActiveSessionId(null);
                        loadData(); // Refresh history
                    }}
                />
            );
        } else {
            return (
                <StudentLiveSessionView
                    sessionId={activeSessionId}
                    studentId={studentId!}
                    onExit={() => setActiveSessionId(null)}
                />
            );
        }
    }

    // STUDENT WAITING VIEW
    if (!isTeacher) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 text-center p-8 border-2 border-dashed rounded-xl bg-muted/10">
                <Zap className="h-16 w-16 text-muted-foreground/30 animate-pulse" />
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Waiting for Live Session</h3>
                    <p className="text-muted-foreground max-w-sm">
                        When your teacher starts a live Q&A session, it will appear here automatically.
                    </p>
                </div>
            </div>
        );
    }

    // PAST SESSION DETAIL VIEW
    if (selectedPastSession) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPastSession(null)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Live
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold">Session Analytics</h2>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedPastSession.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Questions</CardDescription>
                            <CardTitle className="text-2xl">{selectedPastSession.questions.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Students</CardDescription>
                            <CardTitle className="text-2xl">{selectedPastSession.student_results.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Overall Accuracy</CardDescription>
                            <CardTitle className="text-2xl">{selectedPastSession.overall_accuracy}%</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Student Results Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student Results</CardTitle>
                        <CardDescription>Individual performance breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedPastSession.student_results.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No responses recorded</p>
                        ) : (
                            <div className="space-y-4">
                                {selectedPastSession.student_results.map((student) => (
                                    <div key={student.student_id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Student #{student.student_id}</span>
                                            </div>
                                            <Badge variant={student.total_correct === student.total_answered ? "default" : "secondary"}>
                                                {student.total_correct} / {student.total_answered} correct
                                            </Badge>
                                        </div>
                                        <div className="grid gap-2">
                                            {student.responses.map((r, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-sm p-2 bg-muted/30 rounded">
                                                    {r.is_correct === true && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                                                    {r.is_correct === false && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                                                    {r.is_correct === null && <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                                                    <span className="text-muted-foreground truncate flex-1">{r.question_text}</span>
                                                    <span className="font-mono text-xs bg-background px-2 py-1 rounded">{r.answer || "-"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // TEACHER SETUP VIEW
    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Start a Live Session</h2>
                            <p className="text-muted-foreground">Configure your real-time quiz session.</p>
                        </div>
                    </div>

                    {/* Chapter Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">1. Select Chapter</CardTitle>
                            <CardDescription>Filter concepts by chapter context.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedChapterId} onValueChange={(val) => {
                                setSelectedChapterId(val);
                                setSelectedConceptIds([]); // Clear selection on chapter change
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a chapter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Chapters</SelectItem>
                                    {chapters.map((chapter) => (
                                        <SelectItem key={chapter.id} value={chapter.id.toString()}>
                                            {chapter.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Concept Selection */}
                    <div>
                        <div className="mb-4">
                            <h3 className="font-semibold text-lg">2. Select Concepts</h3>
                            <p className="text-sm text-muted-foreground">Choose specific topics from the selected chapter.</p>
                        </div>

                        {filteredConcepts.length === 0 ? (
                            <Card className="border-2 border-dashed p-8 text-center">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Zap className="h-8 w-8 opacity-20" />
                                    <p>No concepts found for this selection.</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {filteredConcepts.map((concept) => {
                                    const isSelected = selectedConceptIds.includes(concept.id!);
                                    return (
                                        <div
                                            key={concept.id}
                                            onClick={() => toggleConcept(concept.id)}
                                            className={cn(
                                                "cursor-pointer rounded-xl border p-4 transition-all hover:bg-muted/50",
                                                isSelected ? "border-primary ring-1 ring-primary bg-primary/5" : "bg-card"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("mt-1", isSelected ? "text-primary" : "text-muted-foreground")}>
                                                    {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-medium leading-none">{concept.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <LiveSessionConfig
                        conceptCount={selectedConceptIds.length}
                        onStart={handleStartSession}
                        loading={starting}
                    />
                </div>
            </div>

            <PastSessionsList
                sessions={pastSessions}
                onSelect={handleViewPastSession}
            />
        </>
    );
}
