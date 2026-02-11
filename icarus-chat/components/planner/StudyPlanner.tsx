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
import { Sparkles, Undo, Check, ChevronsUpDown, X, Loader2, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { getChapters, getClassConcepts } from "@/app/lib/api/school";
import { getStudentAnalytics } from "@/app/lib/api/analytics";
import { ChapterRead, Concept } from "@/app/types/school";
import { StudentAnalytics } from "@/app/types/analytics";
import { cn } from "@/lib/utils";

export function StudyPlanner() {
    const { user, teacher, student } = useDashboardAuth();
    const { classes } = useDashboardData(user, teacher, student);

    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedChapterId, setSelectedChapterId] = useState<string>("");
    const [selectedConcepts, setSelectedConcepts] = useState<Concept[]>([]);

    // Data constraints
    const [chapters, setChapters] = useState<ChapterRead[]>([]);
    const [availableConcepts, setAvailableConcepts] = useState<Concept[]>([]);

    // Analytics
    const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    // Inputs
    const [manualConcept, setManualConcept] = useState("");
    const [specificFocus, setSpecificFocus] = useState<string>("");
    const [timeline, setTimeline] = useState<string>("");

    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();

    // Derived State: Filter Concepts by Chapter
    const filteredAvailableConcepts = selectedChapterId
        ? availableConcepts.filter(c => {
            const chap = chapters.find(ch => String(ch.id) === selectedChapterId);
            return chap?.concept_ids.includes(c.id);
        })
        : availableConcepts;

    // Fetch data
    useEffect(() => {
        if (!selectedClassId || !student) {
            setChapters([]);
            setAvailableConcepts([]);
            return;
        }

        const loadData = async () => {
            const cId = parseInt(selectedClassId);
            setIsLoadingAnalytics(true);
            try {
                const [chapData, conData, analyticsData] = await Promise.all([
                    getChapters(cId),
                    getClassConcepts(cId),
                    getStudentAnalytics(student.id).catch(() => null)
                ]);
                setChapters(chapData);
                setAvailableConcepts(conData);
                setStudentAnalytics(analyticsData);
            } catch (e) {
                console.error("Failed to load study data", e);
            } finally {
                setIsLoadingAnalytics(false);
            }
        };

        loadData();
    }, [selectedClassId, student]);


    const handleGenerate = () => {
        setIsGenerating(true);

        const classObj = classes.find(c => String(c.id) === selectedClassId);
        const chapterObj = chapters.find(c => String(c.id) === selectedChapterId);
        const conceptNames = selectedConcepts.map(c => c.name).join(", ");

        let contextParts = [];
        if (classObj) contextParts.push(`Class: ${classObj.name}`);
        if (chapterObj) contextParts.push(`Unit: ${chapterObj.title}`);
        if (conceptNames) contextParts.push(`Concepts to Study: ${conceptNames}`);
        if (timeline) contextParts.push(`Timeline/Deadline: ${timeline}`);
        if (specificFocus) contextParts.push(`My Focus Notes: ${specificFocus}`);

        // Inject Personal Analytics
        if (studentAnalytics) {
            contextParts.push("\n### MY LEARNING PROFILE");
            if (studentAnalytics.most_understood_concept) {
                contextParts.push(`Strength: I understand "${studentAnalytics.most_understood_concept.concept_name}" very well.`);
            }
            if (studentAnalytics.least_understood_concept) {
                contextParts.push(`Weakness: I am struggling with "${studentAnalytics.least_understood_concept.concept_name}". Please help me improve this.`);
            }
        }

        const mainTopic = contextParts.join("\n");
        const prompt = `Create a personalized study plan for me.\n\nContext:\n${mainTopic}`;

        const params = new URLSearchParams();
        params.set("prompt", prompt);
        if (selectedClassId) params.set("classId", selectedClassId);
        router.push(`/chat?${params.toString()}`);
    };

    const [openConceptCombobox, setOpenConceptCombobox] = useState(false);

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

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Study Planner</h1>
                    <p className="text-muted-foreground">Build a personal study schedule based on your needs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={String(cls.id)}>
                                    {cls.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="h-6 w-px bg-border" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setSelectedClassId("");
                            setSelectedChapterId("");
                            setSelectedConcepts([]);
                            setSpecificFocus("");
                            setTimeline("");
                            setStudentAnalytics(null);
                        }}
                    >
                        <Undo className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>
            </div>

            <div className="space-y-8">

                {/* Personal Analytics Card */}
                <div className={cn("grid transition-all duration-500 ease-in-out", (selectedClassId && studentAnalytics) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                        <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20">
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                                        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="font-semibold">My Learning Profile</h3>
                                </div>

                                {isLoadingAnalytics ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Loading your stats...
                                    </div>
                                ) : studentAnalytics ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Strength */}
                                        <div className="bg-background/60 p-3 rounded-md border">
                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-medium text-sm mb-1">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>Top Strength</span>
                                            </div>
                                            {studentAnalytics.most_understood_concept ? (
                                                <div className="text-sm">
                                                    You're doing great with <span className="font-semibold">{studentAnalytics.most_understood_concept.concept_name}</span>.
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">Not enough data yet.</div>
                                            )}
                                        </div>

                                        {/* Weakness */}
                                        <div className="bg-background/60 p-3 rounded-md border">
                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium text-sm mb-1">
                                                <TrendingDown className="h-4 w-4" />
                                                <span>Focus Area</span>
                                            </div>
                                            {studentAnalytics.least_understood_concept ? (
                                                <div className="text-sm">
                                                    Consider reviewing <span className="font-semibold">{studentAnalytics.least_understood_concept.concept_name}</span>.
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No specific struggles found!</div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Targets Selection */}
                <div className="space-y-6">
                    <Label className="text-xl font-semibold">What are you studying?</Label>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Chapter Selector */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Unit / Chapter</Label>
                            <Select value={selectedChapterId} onValueChange={setSelectedChapterId} disabled={!selectedClassId}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder={selectedClassId ? "Select a chapter..." : "Select a class first"} />
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
                            <Label className="text-sm font-medium text-muted-foreground">Key Concepts</Label>
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
                                            <CommandGroup heading={selectedChapterId ? "In this Unit" : "Available in Class"}>
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
                </div>

                {/* Timeline & Focus */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-violet-600" />
                            <Label htmlFor="timeline" className="text-base font-medium">Timeline / Goal</Label>
                        </div>
                        <Card className="border shadow-sm bg-background group focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                            <Textarea
                                id="timeline"
                                value={timeline}
                                onChange={(e) => setTimeline(e.target.value)}
                                placeholder="E.g., Exam next Friday, or 30 mins a day..."
                                className="min-h-[80px] border-none shadow-none resize-y p-3 text-base focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
                            />
                        </Card>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="focus" className="text-base font-medium">Specific Focus</Label>
                        <Card className="border shadow-sm bg-background group focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                            <Textarea
                                id="focus"
                                value={specificFocus}
                                onChange={(e) => setSpecificFocus(e.target.value)}
                                placeholder="Any specific topics or formats you prefer?"
                                className="min-h-[80px] border-none shadow-none resize-y p-3 text-base focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
                            />
                        </Card>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        size="lg"
                        className="flex-1 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                        onClick={handleGenerate}
                    >
                        <Sparkles className="mr-2 h-5 w-5 fill-white/20" />
                        Generate Study Plan
                    </Button>
                </div>

            </div>
        </div>
    );
}
