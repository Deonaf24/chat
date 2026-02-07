"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, StopCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useLiveSession } from "@/hooks/useLiveSession";
import { useLiveStats } from "@/hooks/useLiveStats";
import { useLiveGrading } from "@/hooks/useLiveGrading";

interface TeacherLiveSessionViewProps {
    sessionId: number;
    onEnd: () => void;
}

export function TeacherLiveSessionView({ sessionId, onEnd }: TeacherLiveSessionViewProps) {
    const { session, endSession, loading: sessionLoading } = useLiveSession(sessionId, 'teacher');

    // Stats hook (Active Mode)
    const { stats } = useLiveStats(sessionId, session?.status === 'active');

    // Grading hook (Ended Mode)
    const { gradingTasks, loading: gradingLoading, submitGrade } = useLiveGrading(sessionId, session?.status === 'ended');

    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308'];

    const handleEndSession = async () => {
        await endSession();
    };

    // Derived state for the selected question
    const activeQuestionStats = stats?.questions.find(q => q.question_id === selectedQuestionId);
    const activeQuestion = session?.questions.find(q => q.id === selectedQuestionId);

    // RENDER: Grading View (Session Ended)
    if (session?.status === 'ended') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Session Ended</h2>
                            <p className="text-muted-foreground">Review and grade remaining short answer questions.</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={onEnd}>
                        Back to Dashboard
                    </Button>
                </div>

                <div className="grid gap-6">
                    {gradingLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : gradingTasks.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
                                <div className="bg-green-100 p-4 rounded-full">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold">All caught up!</h3>
                                <p className="text-muted-foreground text-center">There are no ungraded responses remaining for this session.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        gradingTasks.map((task) => (
                            <Card key={task.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase">Question</p>
                                            <p className="font-medium">{task.question_text}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Student Answer</p>
                                        <div className="p-4 bg-muted/20 rounded-lg text-lg font-medium">
                                            {task.answer}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 p-3 flex justify-end gap-3 border-t">
                                    <Button
                                        variant="outline"
                                        className="text-primary hover:text-primary/80 hover:bg-primary/5"
                                        onClick={() => submitGrade(task.id, false)}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Mark Incorrect
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => submitGrade(task.id, true)}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Mark Correct
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // RENDER: Active Session View
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Live Session Dashboard</h2>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        onClick={handleEndSession}
                        disabled={sessionLoading}
                    >
                        {sessionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <StopCircle className="mr-2 h-4 w-4" />}
                        End Session
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Question List */}
                <Card className="col-span-1 border-2 h-[500px] flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-2 p-2">
                        {session?.questions ? session.questions.map((q, index) => {
                            const qStats = stats?.questions.find(stat => stat.question_id === q.id);
                            const responseCount = qStats?.total_responses || 0;
                            const isSelected = selectedQuestionId === q.id;

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setSelectedQuestionId(selectedQuestionId === q.id ? null : q.id)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg border transition-all hover:bg-muted/50 relative",
                                        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-transparent bg-muted/20"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm text-primary">Q{index + 1}</span>
                                        <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">
                                            {responseCount} ans
                                        </span>
                                    </div>
                                    <p className="text-sm line-clamp-2 text-muted-foreground font-medium">
                                        {q.text}
                                    </p>
                                    <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary/50"
                                            style={{ width: `${Math.min(100, (responseCount / 5) * 100)}%` }}
                                        />
                                    </div>
                                </button>
                            );
                        }) : (
                            <div className="flex justify-center items-center h-full text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column: Detail View */}
                <Card className="col-span-1 md:col-span-2 border-2 h-[500px] flex flex-col">
                    <CardContent className="h-full p-6 flex flex-col items-center justify-center">
                        {activeQuestion && activeQuestionStats ? (
                            <div className="w-full space-y-6">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold">{activeQuestion.text}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {activeQuestionStats.total_responses} Responses
                                    </p>
                                </div>

                                {/* Short Answer Word Cloud */}
                                {(!activeQuestion.options || activeQuestion.options.length === 0) && (
                                    <div className="flex-1 flex items-center justify-center py-6">
                                        {(() => {
                                            const answerCounts: Record<string, { display: string; count: number }> = {};
                                            Object.entries(activeQuestionStats.distribution).forEach(([answer, count]) => {
                                                const key = answer.toLowerCase().trim();
                                                if (answerCounts[key]) {
                                                    answerCounts[key].count += count;
                                                } else {
                                                    answerCounts[key] = { display: answer, count };
                                                }
                                            });

                                            const entries = Object.values(answerCounts);
                                            const maxCount = Math.max(...entries.map(e => e.count), 1);
                                            const minSize = 14;
                                            const maxSize = 42;

                                            if (entries.length === 0) return <p className="text-muted-foreground text-sm">No responses yet</p>;

                                            return (
                                                <div className="flex flex-wrap items-center justify-center gap-3 max-h-[280px] overflow-y-auto p-4">
                                                    {entries.map((entry, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 rounded-lg transition-all hover:scale-110 cursor-default"
                                                            style={{
                                                                fontSize: `${minSize + ((entry.count / maxCount) * (maxSize - minSize))}px`,
                                                                fontWeight: entry.count === maxCount ? 700 : 500,
                                                                color: COLORS[i % COLORS.length],
                                                                opacity: 0.5 + (entry.count / maxCount) * 0.5,
                                                            }}
                                                        >
                                                            {entry.display}
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* True/False Visuals */}
                                {activeQuestion.options?.length === 2 &&
                                    activeQuestion.options.some(opt => opt.toLowerCase() === 'true') ? (
                                    <div className="space-y-6 py-8">
                                        {(() => {
                                            const trueCount = activeQuestionStats.distribution['True'] || activeQuestionStats.distribution['true'] || 0;
                                            const falseCount = activeQuestionStats.distribution['False'] || activeQuestionStats.distribution['false'] || 0;
                                            const total = trueCount + falseCount;
                                            const truePercent = total > 0 ? Math.round((trueCount / total) * 100) : 0;
                                            const falsePercent = total > 0 ? Math.round((falseCount / total) * 100) : 0;

                                            return (
                                                <>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between font-semibold"><span>True</span><span>{truePercent}%</span></div>
                                                        <div className="h-8 w-full bg-muted rounded overflow-hidden">
                                                            <div className="h-full bg-blue-500" style={{ width: `${truePercent}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between font-semibold"><span>False</span><span>{falsePercent}%</span></div>
                                                        <div className="h-8 w-full bg-muted rounded overflow-hidden">
                                                            <div className="h-full bg-red-500" style={{ width: `${falsePercent}%` }} />
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : null}

                                {/* Multiple Choice Visuals */}
                                {activeQuestion.options && activeQuestion.options.length > 0 &&
                                    !activeQuestion.options.some(opt => opt.toLowerCase() === 'true') && (
                                        <div className="space-y-3 py-2">
                                            {(() => {
                                                const total = Object.values(activeQuestionStats.distribution).reduce((sum, val) => sum + val, 0);
                                                return activeQuestion.options.map((opt, i) => {
                                                    const count = activeQuestionStats.distribution[opt] || 0;
                                                    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                                                    const color = COLORS[i % COLORS.length];

                                                    return (
                                                        <div key={i} className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="truncate">{opt} <span className="text-muted-foreground">({count})</span></span>
                                                                <span className="font-bold">{percent}%</span>
                                                            </div>
                                                            <div className="h-5 w-full bg-muted rounded overflow-hidden">
                                                                <div className="h-full transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    )}
                            </div>
                        ) : (
                            <div className="flex flex-col h-full w-full space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">Session Overview</h3>
                                    <p className="text-sm text-muted-foreground">Real-time analytics for the current session.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-muted/20 border-none">
                                        <CardContent className="p-6 text-center">
                                            <div className="text-3xl font-bold text-primary">{stats?.total_students || 0}</div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase">Active Students</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted/20 border-none">
                                        <CardContent className="p-6 text-center">
                                            <div className="text-3xl font-bold text-primary">
                                                {stats?.questions.reduce((acc, q) => acc + q.total_responses, 0) || 0}
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase">Total Responses</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
