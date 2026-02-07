"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Activity, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChapterAnalytics, ConceptScoreNode } from "@/app/types/analytics";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getGrade } from "@/lib/grading";

interface ChapterAnalyticsListProps {
    chapters: ChapterAnalytics[];
}

export function ChapterAnalyticsList({ chapters }: ChapterAnalyticsListProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!chapters || chapters.length === 0) {
        return <div className="text-muted-foreground text-sm p-4 text-center border rounded-md">No chapter analytics available.</div>
    }

    // Always show first 5, animate the rest
    const initialChapters = chapters.slice(0, 5);
    const remainingChapters = chapters.slice(5);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-6 py-4">
                <div className="space-y-1">
                    <CardTitle>Understanding by Chapter</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {/* Always visible chapters */}
                    {initialChapters.map((chapter) => (
                        <ChapterRow key={chapter.chapter_id} chapter={chapter} />
                    ))}

                    {/* Animated remaining chapters */}
                    <AnimatePresence>
                        {isExpanded && remainingChapters.map((chapter, index) => (
                            <motion.div
                                key={chapter.chapter_id}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.25,
                                    delay: index * 0.03,
                                    ease: "easeOut"
                                }}
                                className="overflow-hidden"
                            >
                                <ChapterRow chapter={chapter} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                {chapters.length > 5 && (
                    <div className="border-t">
                        <Button
                            variant="ghost"
                            className="w-full rounded-none h-12 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <motion.span
                                className="flex items-center"
                                initial={false}
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="mr-2 h-4 w-4" />
                            </motion.span>
                            {isExpanded ? "Show Less" : `Show All (${remainingChapters.length} more)`}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ChevronDownIcon({ className }: { className?: string }) {
    return <ChevronDown className={className} />
}

function ChevronUpIcon({ className }: { className?: string }) {
    // ChevronUp wasn't imported in original file, need to ensure import or just flip ChevronDown
    return <ChevronDown className={cn("rotate-180", className)} />
}





function ChapterRow({ chapter }: { chapter: ChapterAnalytics }) {
    const [isOpen, setIsOpen] = useState(false);
    const scorePercent = Math.round(chapter.understanding_score * 100);

    // Calculate Hue: 0 (Red) -> 120 (Green)
    // User mentioned "green at 200", potentially implying a wider range or typo for 100.
    // Standard R->G is 0->120. Let's map 0-100% to 0-120 Hue.
    // const hue = Math.min(scorePercent * 1.2, 120);
    // const color = `hsl(${hue}, 80%, 45%)`; // Slightly darker for better contrast if used as text, or opacity for bg
    const grade = getGrade(chapter.understanding_score);
    const color = grade.colorHex;

    return (
        <div className="group border-b last:border-0 border-border/50">
            <div
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer gap-4 relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Container for the "filling" bar */}
                <div className="relative flex-1 h-10 rounded-md bg-muted/30 overflow-hidden">
                    {/* The Fill */}
                    <div
                        className="absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out"
                        style={{
                            width: `${scorePercent}%`,
                            backgroundColor: color,
                            opacity: 0.25
                        }}
                    />

                    {/* The "Line" (Border Accent) that also changes color? 
                        User said "from the line... fill up". 
                        Let's keep a strong left border on the filling element or the container?
                        Let's add a solid left border to the container matching the color.
                    */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: color }}
                    />

                    {/* Content Layer (on top of fill) */}
                    <div className="relative z-10 flex flex-col justify-center h-full px-3 pl-4">
                        <span className="font-medium truncate text-sm leading-tight">{chapter.chapter_title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span>{chapter.concepts.length} Concepts</span>
                        </div>
                    </div>
                </div>

                {/* Score and Chevron */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 text-right">
                        {grade.grade.startsWith("A") || grade.grade.startsWith("B") ? (
                            <CheckCircle2 className="h-4 w-4" style={{ color: color }} />
                        ) : (
                            <AlertCircle className="h-4 w-4" style={{ color: color }} />
                        )}
                        <span className="text-sm font-bold" style={{ color: color }}>{grade.grade}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-muted/5"
                    >
                        <div className="px-4 pb-4 pt-2 border-t border-dashed border-border/50">
                            <div className="space-y-3 ml-1">
                                {chapter.concepts.map((concept) => (
                                    <ConceptRow key={concept.concept_id} concept={concept} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ConceptRow({ concept }: { concept: ConceptScoreNode }) {
    const scorePercent = Math.round(concept.understanding_score * 100);
    const grade = getGrade(concept.understanding_score);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="font-medium text-muted-foreground">{concept.concept_name}</span>
                <div className="flex items-center gap-1">
                    {grade.grade.startsWith("A") || grade.grade.startsWith("B") ? (
                        <CheckCircle2 className={`h-3 w-3 ${grade.colorClass.split(" ")[0]}`} />
                    ) : (
                        <AlertCircle className={`h-3 w-3 ${grade.colorClass.split(" ")[0]}`} />
                    )}
                    <span className={`font-bold ${grade.colorClass}`}>{grade.grade}</span>
                </div>
            </div>
            {/* Custom Progress Bar for color control */}
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-300 ease-in-out rounded-full"
                    style={{ width: `${scorePercent}%`, backgroundColor: grade.colorHex }}
                />
            </div>
        </div>
    )
}
