"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, ChevronsUpDown, X, Loader2, TrendingDown, Users, AlertCircle, Undo } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { getChapters, getClassConcepts } from "@/app/lib/api/school";
import { getClassAnalytics } from "@/app/lib/api/analytics";
import { ChapterRead, Concept } from "@/app/types/school";
import { ClassAnalytics } from "@/app/types/analytics";
import { Class } from "@/app/types/dashboard";

interface LessonEditorProps {
    course: Class | undefined; // Renamed from class to course to avoid keyword conflict
    selectedClassId: string;
    onReset: () => void;
}

export function LessonEditor({ course, selectedClassId, onReset }: LessonEditorProps) {
    const router = useRouter();

    // Form State
    const [selectedChapterId, setSelectedChapterId] = useState<string>("");
    const [selectedConcepts, setSelectedConcepts] = useState<Concept[]>([]);
    const [specificFocus, setSpecificFocus] = useState<string>("");
    const [lessonTypes, setLessonTypes] = useState<string[]>([]);
    const [manualConcept, setManualConcept] = useState("");
    const [openConceptCombobox, setOpenConceptCombobox] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Data Constraints
    const [chapters, setChapters] = useState<ChapterRead[]>([]);
    const [availableConcepts, setAvailableConcepts] = useState<Concept[]>([]);

    // Analytics State
    const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);
    const [useAnalytics, setUseAnalytics] = useState(true);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    // Filter Concepts by Chapter
    const filteredAvailableConcepts = selectedChapterId
        ? availableConcepts.filter(c => {
            const chap = chapters.find(ch => String(ch.id) === selectedChapterId);
            return chap?.concept_ids.includes(c.id);
        })
        : availableConcepts;

    // Filter Analytics by Context
    const relevantWeaknessGroups = classAnalytics ? classAnalytics.weakness_groups.filter(group => {
        if (selectedConcepts.length > 0) {
            return selectedConcepts.some(c => c.id === group.concept_id);
        }
        if (selectedChapterId) {
            const chap = chapters.find(c => String(c.id) === selectedChapterId);
            return chap?.concept_ids.includes(group.concept_id);
        }
        return true;
    }) : [];

    // Reset when class changes or external reset
    useEffect(() => {
        setSelectedChapterId("");
        setSelectedConcepts([]);
        setSpecificFocus("");
        setLessonTypes([]);
        setClassAnalytics(null);
    }, [selectedClassId]);

    // Fetch dependent data
    useEffect(() => {
        if (!selectedClassId) {
            setChapters([]);
            setAvailableConcepts([]);
            return;
        }

        const loadClassData = async () => {
            const cId = parseInt(selectedClassId);
            setIsLoadingAnalytics(true);
            try {
                const [chapData, conData, analyticsData] = await Promise.all([
                    getChapters(cId),
                    getClassConcepts(cId),
                    getClassAnalytics(cId).catch(() => null)
                ]);
                setChapters(chapData);
                setAvailableConcepts(conData);
                setClassAnalytics(analyticsData);
            } catch (e) {
                console.error("Failed to load class data", e);
            } finally {
                setIsLoadingAnalytics(false);
            }
        };

        loadClassData();
    }, [selectedClassId]);

    const handleGenerate = () => {
        setIsGenerating(true);

        const chapterObj = chapters.find(c => String(c.id) === selectedChapterId);
        const conceptNames = selectedConcepts.map(c => c.name).join(", ");

        let contextParts = [];
        if (course) contextParts.push(`Class Context: ${course.name}`);
        if (chapterObj) contextParts.push(`Chapter: ${chapterObj.title}`);
        if (conceptNames) contextParts.push(`Core Concepts: ${conceptNames}`);
        if (lessonTypes.length > 0) contextParts.push(`Lesson Type: ${lessonTypes.join(", ")}`);
        if (specificFocus) contextParts.push(`Specific Focus/Instruction: ${specificFocus}`);

        // Inject Analytics Data
        if (useAnalytics && relevantWeaknessGroups.length > 0) {
            contextParts.push("\n### CLASS ANALYTICS INSIGHTS (Use for differentiation)");
            const weakConcepts = relevantWeaknessGroups.map(g => g.concept_name).join(", ");
            contextParts.push(`Relevant Misconceptions/Weak Areas: ${weakConcepts}`);

            contextParts.push("Suggested Grouping based on weaknesses:");
            relevantWeaknessGroups.forEach((group, idx) => {
                const studentNames = group.students.map(s => s.student_name).join(", ");
                contextParts.push(`- Group ${idx + 1} (Needs focus on ${group.concept_name}): ${studentNames}`);
            });
            contextParts.push("Please suggest specific activities or intervetions for these groups.");
        }

        const mainTopic = contextParts.join("\n");
        const prompt = `Create a lesson plan for ${course?.name || "students"}.\n\nTopic/Context:\n${mainTopic}`;

        const params = new URLSearchParams();
        params.set("prompt", prompt);
        if (selectedClassId) params.set("classId", selectedClassId);
        router.push(`/chat?${params.toString()}`);
    };

    const toggleConcept = (concept: Concept) => {
        if (selectedConcepts.find(c => c.id === concept.id)) {
            setSelectedConcepts(prev => prev.filter(c => c.id !== concept.id));
        } else {
            setSelectedConcepts(prev => [...prev, concept]);
        }
    };

    const addManualConcept = () => {
        if (!manualConcept.trim()) return;
        const newC: Concept = {
            id: -1 * (selectedConcepts.length + 1),
            name: manualConcept,
            description: "Custom concept"
        };
        setSelectedConcepts(prev => [...prev, newC]);
        setManualConcept("");
    };

    if (!selectedClassId) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
                <p>Please select a class from the sidebar to start planning.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Lesson Planner</h1>
                    <p className="text-muted-foreground">Design structured lessons for {course?.name}.</p>
                </div>
                <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
                    <Undo className="mr-2 h-4 w-4" />
                    Reset
                </Button>
            </div>

            <div className="space-y-8">
                {/* Analytics Insights */}
                <div className={cn("grid transition-all duration-500 ease-in-out", (selectedClassId && relevantWeaknessGroups.length > 0) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                        <Card className={cn("border-indigo-100 dark:border-indigo-900", useAnalytics ? "bg-indigo-50/50 dark:bg-indigo-950/20" : "bg-card")}>
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                                            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">Class Analytics Insights</h3>
                                            <p className="text-xs text-muted-foreground">Use student performance data to personalize this lesson.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="use-analytics" className="text-sm font-medium cursor-pointer">Use Data</Label>
                                        <Switch
                                            id="use-analytics"
                                            checked={useAnalytics}
                                            onCheckedChange={setUseAnalytics}
                                        />
                                    </div>
                                </div>

                                {useAnalytics && (
                                    <div className="mt-4 pl-12">
                                        {isLoadingAnalytics ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Analyzing class performance...
                                            </div>
                                        ) : relevantWeaknessGroups.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium text-sm">
                                                            <TrendingDown className="h-4 w-4" />
                                                            <span>Relevant Struggles</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {relevantWeaknessGroups.map(group => (
                                                                <Badge key={group.concept_id} variant="outline" className="bg-background text-amber-700 dark:text-amber-400 border-amber-200">
                                                                    {group.concept_name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-medium text-sm">
                                                            <Users className="h-4 w-4" />
                                                            <span>Suggested Groups</span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {relevantWeaknessGroups.length} groups suggested.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                                <AlertCircle className="h-4 w-4 text-muted-foreground/50" />
                                                No significant weakness patterns found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Structured Topic Building */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Lesson Type</Label>
                            <div className="flex flex-wrap gap-2">
                                {["Lecture", "Group Work", "Individual Work", "Lab / Hands-on Activity", "Class Discussion"].map((type) => (
                                    <Button
                                        key={type}
                                        variant={lessonTypes.includes(type) ? "default" : "outline"}
                                        onClick={() => {
                                            if (lessonTypes.includes(type)) {
                                                setLessonTypes(prev => prev.filter(t => t !== type));
                                            } else {
                                                setLessonTypes(prev => [...prev, type]);
                                            }
                                        }}
                                        className="h-10 px-4"
                                    >
                                        {type}
                                        {lessonTypes.includes(type) && <Check className="ml-2 h-4 w-4" />}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Chapter Selector */}
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">Chapter</Label>
                                <Select value={selectedChapterId} onValueChange={setSelectedChapterId} disabled={!selectedClassId}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select a chapter..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {chapters.map((chap) => (
                                            <SelectItem key={chap.id} value={String(chap.id)}>
                                                {chap.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Concept Multi-Select */}
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">Key Concepts</Label>
                                <Popover open={openConceptCombobox} onOpenChange={setOpenConceptCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openConceptCombobox}
                                            className="w-full justify-between h-11 px-3 font-normal"
                                            disabled={!selectedClassId}
                                        >
                                            <span className="truncate">
                                                {selectedConcepts.length > 0
                                                    ? `${selectedConcepts.length} selected`
                                                    : "Select concepts..."}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search concepts..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-2 space-y-2 text-center">
                                                        <p className="text-xs text-muted-foreground">No concepts found.</p>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                value={manualConcept}
                                                                onChange={(e) => setManualConcept(e.target.value)}
                                                                placeholder="Type custom concept..."
                                                                className="h-8 text-xs"
                                                            />
                                                            <Button size="sm" variant="secondary" onClick={addManualConcept} className="h-8">Add</Button>
                                                        </div>
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup heading={selectedChapterId ? "In this Chapter" : "Available in Class"}>
                                                    {filteredAvailableConcepts.map((concept) => (
                                                        <CommandItem
                                                            key={concept.id}
                                                            value={concept.name}
                                                            onSelect={() => toggleConcept(concept)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedConcepts.find(c => c.id === concept.id) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {concept.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Selected Concepts Tags */}
                        {selectedConcepts.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedConcepts.map(c => (
                                    <Badge key={c.id} variant="secondary" className="px-3 py-1 text-sm gap-2">
                                        {c.name}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                                            onClick={() => toggleConcept(c)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Specific Focus */}
                        <div className="pt-2">
                            <Label className="text-base font-semibold">Specific details or focus (Optional)</Label>
                            <Textarea
                                value={specificFocus}
                                onChange={(e) => setSpecificFocus(e.target.value)}
                                placeholder="E.g., Focus on the water cycle steps..."
                                className="mt-2 min-h-[40px] h-20 resize-none py-3"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        size="lg"
                        disabled={!selectedChapterId || lessonTypes.length === 0 || isGenerating}
                        className="flex-1 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                        onClick={handleGenerate}
                    >
                        <Sparkles className="mr-2 h-5 w-5 fill-white/20" />
                        Generate Lesson Plan
                    </Button>
                </div>
            </div>
        </div>
    );
}
