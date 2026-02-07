"use client";

import { useState } from "react";
import { Loader2, Play, Circle, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LiveSessionConfigProps {
    conceptCount: number;
    onStart: (timeLimit: number, questionTypes: string[]) => Promise<void>;
    loading: boolean;
}

export function LiveSessionConfig({ conceptCount, onStart, loading }: LiveSessionConfigProps) {
    const [timeLimit, setTimeLimit] = useState(15);
    const [questionTypes, setQuestionTypes] = useState<string[]>(["multiple_choice"]);

    const handleStart = async () => {
        await onStart(timeLimit, questionTypes);
    };

    return (
        <Card className="sticky top-28 bg-muted/30 border-none shadow-none">
            <CardHeader>
                <CardTitle>Session Config</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Question Types */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Question Types</label>
                    <div className="grid gap-2">
                        {[
                            { id: "multiple_choice", label: "Multiple Choice" },
                            { id: "true_false", label: "True / False" },
                            { id: "short_answer", label: "Short Answer" }
                        ].map((type) => {
                            const isSelected = questionTypes.includes(type.id);
                            return (
                                <div
                                    key={type.id}
                                    onClick={() => {
                                        setQuestionTypes(prev =>
                                            prev.includes(type.id)
                                                ? prev.filter(t => t !== type.id)
                                                : [...prev, type.id]
                                        );
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50",
                                        isSelected ? "border-primary bg-primary/5" : "bg-card"
                                    )}
                                >
                                    <div className={cn(isSelected ? "text-primary" : "text-muted-foreground")}>
                                        {isSelected ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                    </div>
                                    <span className="text-sm font-medium">{type.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected Concepts:</span>
                    <span className="font-medium">{conceptCount}</span>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <label htmlFor="time-limit" className="text-muted-foreground">Time Limit (mins):</label>
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
                    onClick={handleStart}
                    disabled={conceptCount === 0 || questionTypes.length === 0 || loading}
                >
                    {loading ? (
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
    );
}
