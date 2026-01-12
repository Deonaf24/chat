"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Radio, Zap, CheckCircle2, Circle, Play, StopCircle } from "lucide-react";
import { getClassConcepts } from "@/app/lib/api/analytics";
import { ConceptPayload } from "@/app/types/analytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateLiveQuestions } from "@/app/lib/api/school";

interface LiveEventViewProps {
    classId: number;
    isTeacher: boolean;
}

export function LiveEventView({ classId, isTeacher }: LiveEventViewProps) {
    const [loading, setLoading] = useState(true);
    const [concepts, setConcepts] = useState<ConceptPayload[]>([]);
    const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [starting, setStarting] = useState(false);
    const [timeLimit, setTimeLimit] = useState(15);

    useEffect(() => {
        if (isTeacher) {
            loadConcepts();
        } else {
            setLoading(false); // Students don't need to load concepts yet in this placeholder
        }
    }, [classId, isTeacher]);

    const loadConcepts = async () => {
        try {
            setLoading(true);
            const data = await getClassConcepts(classId);
            setConcepts(data);
        } catch (error) {
            console.error("Failed to load concepts", error);
            toast.error("Failed to load class concepts.");
        } finally {
            setLoading(false);
        }
    };

    const toggleConcept = (id?: number) => {
        if (!id) return;
        setSelectedConceptIds(prev =>
            prev.includes(id)
                ? prev.filter(cId => cId !== id)
                : [...prev, id]
        );
    };

    const handleStartSession = async () => {
        if (selectedConceptIds.length === 0) {
            toast.error("Please select at least one concept.");
            return;
        }
        setStarting(true);

        try {
            // Trigger question generation flow
            const data = await generateLiveQuestions(classId, selectedConceptIds, timeLimit);
            console.log("=== LIVE EVENT GENERATION DEBUG ===");
            console.log("Context Summary:", data.context_summary);
            console.log("Generated Prompt:", data.generate_prompt);
            console.log("===================================");
            toast.success("Generation prompt logged to console (Dev Mode)"); // Temporary feedback

            // Proceed to active session view
            setIsSessionActive(true);
            toast.success(`Live session started! Time limit: ${timeLimit}m`);
        } catch (error) {
            console.error("Failed to generate live event", error);
            toast.error("Failed to initialize live session context.");
        } finally {
            setStarting(false);
        }
    };

    const handleEndSession = () => {
        setIsSessionActive(false);
        toast.info("Session ended.");
    };

    if (loading) {
        return (
            <div className="h-60 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Student View (Placeholder)
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

    if (isSessionActive) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="p-1 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500">
                    <Card className="border-0 shadow-lg bg-background">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                                    </span>
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl">Live Session in Progress</CardTitle>
                                        <div className="flex gap-2 text-sm text-muted-foreground">
                                            <span>Asking questions about {selectedConceptIds.length} concepts.</span>
                                            <span>•</span>
                                            <span>Time Limit: {timeLimit} mins</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="destructive" onClick={handleEndSession}>
                                    <StopCircle className="mr-2 h-4 w-4" />
                                    End Session
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {concepts.filter(c => selectedConceptIds.includes(c.id!)).map(c => (
                                    <Badge key={c.id} variant="secondary" className="px-3 py-1 text-sm">
                                        {c.name}
                                    </Badge>
                                ))}
                            </div>
                            <div className="h-64 bg-muted/20 rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-2">
                                <Zap className="h-10 w-10 text-yellow-500 opacity-50" />
                                <p>Real-time student responses would appear here.</p>
                                <p className="text-xs max-w-sm">
                                    (This is a placeholder for the WebSocket connection that would stream student answers as they come in.)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Start a Live Session</h2>
                    <p className="text-muted-foreground">Select concepts to quiz students on in real-time.</p>
                </div>

                {concepts.length === 0 ? (
                    <Card className="border-2 border-dashed p-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Zap className="h-8 w-8 opacity-20" />
                            <p>No concepts found for this class.</p>
                            <p className="text-sm">Create assignments and analyze them to generate concepts.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {concepts.map((concept) => {
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

            <div className="space-y-6">
                <Card className="sticky top-28 bg-muted/30 border-none shadow-none">
                    <CardHeader>
                        <CardTitle>Session Config</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Selected Topics:</span>
                            <span className="font-medium">{selectedConceptIds.length}</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <label htmlFor="time-limit" className="text-muted-foreground">Time Limit (mins):</label>
                                <span className="font-medium text-xs text-muted-foreground">Est. {selectedConceptIds.length * 5}m recommended</span>
                            </div>
                            <Input
                                id="time-limit"
                                type="number"
                                min={1}
                                max={120}
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(Number(e.target.value))}
                                className="bg-background"
                            />
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
                            size="lg"
                            onClick={handleStartSession}
                            disabled={selectedConceptIds.length === 0 || starting}
                        >
                            {starting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-5 w-5 fill-current" />
                                    Start Live
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
