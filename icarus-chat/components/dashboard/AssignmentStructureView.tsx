"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Network,
    FileQuestion,
    Lightbulb,
    ArrowRight,
    Sparkles,
    Loader2,
    Save,
    Pencil,
    Check,
    X,
    Plus,
    Trash2
} from "lucide-react";
import {
    getAssignmentStructure,
    analyzeAssignment,
    updateAssignmentStructure
} from "@/app/lib/api/analytics";
import {
    AssignmentStructureReviewRead,
    AssignmentQuestionPayload,
    ConceptPayload,
} from "@/app/types/analytics";
import { toast } from "sonner"; // Assuming sonner is available or we'll use a simple alert/mock

interface AssignmentStructureViewProps {
    assignmentId: number;
}

export function AssignmentStructureView({ assignmentId }: AssignmentStructureViewProps) {
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Data State
    const [structure, setStructure] = useState<AssignmentStructureReviewRead | null>(null);
    const [editMode, setEditMode] = useState(false);

    // Editable State (mirrors structure)
    const [concepts, setConcepts] = useState<ConceptPayload[]>([]);
    const [questions, setQuestions] = useState<AssignmentQuestionPayload[]>([]);

    useEffect(() => {
        loadStructure();
    }, [assignmentId]);

    const loadStructure = async () => {
        try {
            setLoading(true);
            const data = await getAssignmentStructure(assignmentId);
            setStructure(data);
            setConcepts(data.concepts);
            setQuestions(data.questions);

            // Auto-enter edit mode if not approved yet, or just show view mode
            if (!data.structure_approved && (data.concepts.length > 0 || data.questions.length > 0)) {
                setEditMode(true);
            }
        } catch (error) {
            console.error("Failed to load structure", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true);
            const data = await analyzeAssignment(assignmentId);
            setStructure(data);
            setConcepts(data.concepts);
            setQuestions(data.questions);
            setEditMode(true);
            toast.success("Analysis complete! Review the generated structure.");
        } catch (error) {
            console.error("Analysis failed", error);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!structure) return;
        try {
            setSaving(true);

            // Reconstruct payload
            const payload = {
                assignment_id: assignmentId,
                concepts: concepts,
                questions: questions,
                question_concepts: [], // Simplified: we can rebuild links based on question.concept_ids
                assignment_concepts: []
            };

            const updated = await updateAssignmentStructure(assignmentId, payload);
            setStructure(updated);
            setEditMode(false);
            toast.success("Structure saved successfully!");
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    // Helper to update a concept
    const updateConcept = (idx: number, field: keyof ConceptPayload, value: string) => {
        const newConcepts = [...concepts];
        newConcepts[idx] = { ...newConcepts[idx], [field]: value };
        setConcepts(newConcepts);
    };

    // Helper to update a question
    const updateQuestion = (idx: number, field: keyof AssignmentQuestionPayload, value: string) => {
        const newQuestions = [...questions];
        // @ts-ignore - dynamic assignment safe for string fields here
        newQuestions[idx] = { ...newQuestions[idx], [field]: value };
        setQuestions(newQuestions);
    };

    // Helper to delete item
    const deleteConcept = (idx: number) => {
        const newConcepts = [...concepts];
        newConcepts.splice(idx, 1);
        setConcepts(newConcepts);
    };
    const deleteQuestion = (idx: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(idx, 1);
        setQuestions(newQuestions);
    };

    // Helper to add item
    const addConcept = () => {
        setConcepts([...concepts, { name: "New Concept", description: "" }]);
    };
    const addQuestion = () => {
        setQuestions([...questions, { prompt: "New Question", concept_ids: [] }]);
    };


    if (loading) {
        return (
            <div className="h-40 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const hasData = structure && (structure.concepts.length > 0 || structure.questions.length > 0);

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl space-y-4 bg-muted/10">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-xl font-semibold">Analyze Assignment Structure</h3>
                    <p className="text-muted-foreground max-w-md">
                        Use AI to automatically extract concepts and questions from your assignment files to track student understanding.
                    </p>
                </div>
                <Button onClick={handleAnalyze} disabled={analyzing} size="lg" className="min-w-[150px]">
                    {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {analyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between sticky top-[80px] z-30 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold tracking-tight">Assignment Structure</h3>
                        {structure?.structure_approved && <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Approved</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {editMode ? "Editing concepts and questions." : "Review concepts and questions."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {editMode ? (
                        <>
                            <Button variant="ghost" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleAnalyze} disabled={analyzing}>
                                {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Re-Analyze
                            </Button>
                            <Button onClick={() => setEditMode(true)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Structure
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-12">
                {/* Concepts Column */}
                <div className="md:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Concepts ({concepts.length})
                        </h4>
                        {editMode && <Button size="sm" variant="ghost" onClick={addConcept}><Plus className="h-4 w-4" /></Button>}
                    </div>

                    <div className="space-y-3">
                        {concepts.map((concept, idx) => (
                            <Card key={idx} className="relative group">
                                <CardContent className="p-3 space-y-2">
                                    {editMode ? (
                                        <>
                                            <Input
                                                value={concept.name}
                                                onChange={(e) => updateConcept(idx, "name", e.target.value)}
                                                className="font-medium h-8"
                                                placeholder="Concept Name"
                                            />
                                            <Textarea
                                                value={concept.description || ""}
                                                onChange={(e) => updateConcept(idx, "description", e.target.value)}
                                                className="text-xs min-h-[60px]"
                                                placeholder="Description..."
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                                onClick={() => deleteConcept(idx)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="font-medium text-sm">{concept.name}</div>
                                            <div className="text-xs text-muted-foreground">{concept.description}</div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Questions Column */}
                <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                            <FileQuestion className="h-4 w-4 text-blue-500" />
                            Questions ({questions.length})
                        </h4>
                        {editMode && <Button size="sm" variant="ghost" onClick={addQuestion}><Plus className="h-4 w-4" /></Button>}
                    </div>

                    <div className="space-y-3">
                        {questions.map((q, idx) => (
                            <Card key={idx} className="relative group">
                                <CardContent className="p-3 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <Badge variant="outline" className="mt-1 h-fit text-xs text-muted-foreground">Q{q.position || idx + 1}</Badge>
                                        <div className="flex-1 space-y-2">
                                            {editMode ? (
                                                <>
                                                    <Textarea
                                                        value={q.prompt}
                                                        onChange={(e) => updateQuestion(idx, "prompt", e.target.value)}
                                                        className="text-sm min-h-[60px]"
                                                        placeholder="Question Prompt..."
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                                        onClick={() => deleteQuestion(idx)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <p className="text-sm">{q.prompt}</p>
                                            )}

                                            {/* Concept Tags (Read-only for now, can implement tag selector later) */}
                                            {q.concept_ids?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {q.concept_ids.map(cid => {
                                                        const c = concepts.find(c => c.id === cid || (c as any).tempId === cid); // tempId handling if needed
                                                        return c ? (
                                                            <Badge key={cid} variant="secondary" className="text-[10px] h-5">
                                                                <Lightbulb className="h-3 w-3 mr-1 opacity-50" />
                                                                {c.name}
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
