"use client";

import { useEffect, useState, useRef } from "react";
import { useLiveSession } from "@/hooks/useLiveSession";
import { submitLiveAnswer } from "@/app/lib/api/live";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentLiveSessionViewProps {
    sessionId: number;
    studentId: number;
    onExit: () => void;
}

export function StudentLiveSessionView({ sessionId, studentId, onExit }: StudentLiveSessionViewProps) {
    const { session, currentQuestion, loading, fetchNextQuestion } = useLiveSession(sessionId, 'student', studentId);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Timer Ref
    const startTimeRef = useRef<number>(Date.now());

    // Reset local state when question changes
    useEffect(() => {
        setSelectedAnswer(null);
        setHasSubmitted(false);
        setIsCorrect(null);
        startTimeRef.current = Date.now();
    }, [currentQuestion?.id]);

    const handleSubmit = async () => {
        if (!currentQuestion || !selectedAnswer) return;

        try {
            setSubmitting(true);
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

            const response = await submitLiveAnswer(currentQuestion.id, studentId, selectedAnswer, timeSpent);
            setHasSubmitted(true);
            setIsCorrect(response.is_correct);

            // Toast feedback
            if (response.is_correct === true) {
                toast.success("Correct!", { icon: "🎉" });
            } else if (response.is_correct === false) {
                // Only show incorrect if specifically false (meaning graded and wrong)
                // But we want to hide it mostly, so maybe just show Submitted? 
                // User asked "answers shouldnt be revealed".
                // So actually we should probably just say Submitted for everything?
                // But let's stick to the behavior: if backend sends None, say Submitted.
                toast.success("Answer Submitted");
            } else {
                // is_correct is null/undefined
                toast.success("Answer Submitted");
            }

            // Auto-advance after delay
            setTimeout(() => {
                handleNext();
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error("Failed to submit answer");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        fetchNextQuestion();
    };

    if (loading && !session) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!session || session.status === 'ended') {
        return (
            <div className="text-center space-y-4 p-8">
                <div className="mx-auto bg-muted rounded-full p-4 w-16 h-16 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Session Ended</h2>
                <p className="text-muted-foreground">The teacher has ended the live session.</p>
                <Button onClick={onExit} variant="outline">Back to Dashboard</Button>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="text-center space-y-4 p-12 border-2 border-dashed rounded-xl">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 animate-bounce" />
                <h2 className="text-xl font-semibold">All Questions Completed!</h2>
                <p className="text-muted-foreground">Great job! Wait for the session to end.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Question {currentQuestion.order + 1}
                </p>
                <h2 className="text-3xl font-bold leading-tight">{currentQuestion.text}</h2>
            </div>

            <Card className="border-2 shadow-lg">
                <CardContent className="p-6">
                    <div className="grid gap-3">
                        {currentQuestion.question_type === 'short_answer' ? (
                            <div className="space-y-4">
                                <Input
                                    value={selectedAnswer || ''}
                                    onChange={(e) => !hasSubmitted && setSelectedAnswer(e.target.value)}
                                    disabled={hasSubmitted}
                                    placeholder="Type your answer here..."
                                    className={cn(
                                        "text-lg p-6 h-auto",
                                        hasSubmitted && isCorrect === true && "border-green-500 bg-green-50 ring-1 ring-green-500",
                                        hasSubmitted && isCorrect === false && "border-red-500 bg-red-50 ring-1 ring-red-500"
                                    )}
                                />
                                {hasSubmitted && (
                                    <div className="p-3 rounded-lg flex items-center gap-2 font-medium text-sm animate-in fade-in slide-in-from-top-2 bg-blue-100 text-blue-700">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span>Answer Submitted. Results revealed pending teacher review.</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            currentQuestion.options?.map((option, index) => {
                                const isSelected = selectedAnswer === option;
                                // REMOVED: Immediate feedback logic (showCorrect, showWrong)
                                // We just show what they selected.
                                const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308'];

                                return (
                                    <button
                                        key={index}
                                        onClick={() => !hasSubmitted && setSelectedAnswer(option)}
                                        disabled={hasSubmitted}
                                        style={{ borderLeft: `6px solid ${COLORS[index % COLORS.length]}` }}
                                        className={cn(
                                            "relative flex items-center p-4 rounded-lg border-2 text-left transition-all",
                                            "hover:bg-muted/50",
                                            isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted",
                                            // REMOVED conditional color logic
                                            hasSubmitted && !isSelected && "opacity-50"
                                        )}
                                    >
                                        <div className="flex-1 font-medium text-lg">{option}</div>
                                        {isSelected && hasSubmitted && <CheckCircle2 className="h-6 w-6 text-primary" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 flex justify-end">
                    {hasSubmitted ? (
                        <div className="flex items-center text-muted-foreground animate-pulse">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Loading next question...</span>
                        </div>
                    ) : (
                        <Button
                            size="lg"
                            className="w-full sm:w-auto text-lg"
                            disabled={!selectedAnswer || submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Answer"
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
