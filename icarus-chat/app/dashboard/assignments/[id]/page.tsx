"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuthTeacher } from "@/app/hooks/dashboard/useAuthTeacher";
import {
  analyzeAssignment,
  getAssignment,
  getFile,
  getFilePreviewUrl,
  updateAssignmentStructure,
} from "@/app/lib/api/school";
import { AssignmentRead, FileRead } from "@/app/types/school";
import {
  AssignmentConceptDetail,
  AssignmentQuestion,
  AssignmentStructureProposal,
} from "@/app/types/assignmentStructure";

const createQuestionConceptLinks = (questions: AssignmentQuestion[]) =>
  questions.flatMap((question) =>
    question.concept_ids.map((conceptId) => ({
      question_id: question.id,
      concept_id: conceptId,
    }))
  );

const parseConceptIds = (value: string) =>
  value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuthTeacher();
  const [assignment, setAssignment] = useState<AssignmentRead | null>(null);
  const [files, setFiles] = useState<FileRead[]>([]);
  const [structure, setStructure] = useState<AssignmentStructureProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const tempIdRef = useRef(-1);

  const assignmentId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    return Number.isNaN(numericId) ? null : numericId;
  }, [params]);

  useEffect(() => {
    if (authLoading || !assignmentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const assignmentRecord = await getAssignment(assignmentId);
        const relatedFiles = assignmentRecord.file_ids?.length
          ? await Promise.all(assignmentRecord.file_ids.map((fileId) => getFile(fileId)))
          : [];
        if (!isMounted) return;
        setAssignment(assignmentRecord);
        setFiles(relatedFiles);
      } catch (err) {
        if (!isMounted) return;
        setError("Unable to load this assignment right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [assignmentId, authLoading]);

  const handleAnalyze = async () => {
    if (!assignmentId) return;
    setAnalyzing(true);
    setActionMessage(null);
    setError(null);

    try {
      const result = await analyzeAssignment(String(assignmentId));
      setStructure(result);
      setActionMessage("Structure proposal generated.");
    } catch (err) {
      setError("Unable to analyze this assignment right now.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!assignmentId || !structure) return;
    setSaving(true);
    setActionMessage(null);
    setError(null);

    const payload: AssignmentStructureProposal = {
      ...structure,
      structure_approved: true,
      question_concepts: createQuestionConceptLinks(structure.questions),
    };

    try {
      const updated = await updateAssignmentStructure(String(assignmentId), payload);
      setStructure(updated);
      setActionMessage("Structure approved and saved.");
    } catch (err) {
      setError("Unable to save this structure right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleConceptUpdate = (index: number, updates: Partial<AssignmentConceptDetail>) => {
    setStructure((prev) => {
      if (!prev) return prev;
      const concepts = [...prev.concepts];
      concepts[index] = { ...concepts[index], ...updates };
      return { ...prev, concepts };
    });
  };

  const handleQuestionUpdate = (index: number, updates: Partial<AssignmentQuestion>) => {
    setStructure((prev) => {
      if (!prev) return prev;
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], ...updates };
      return { ...prev, questions };
    });
  };

  const handleAssignmentConceptsUpdate = (value: string) => {
    const conceptIds = parseConceptIds(value);
    setStructure((prev) =>
      prev
        ? {
            ...prev,
            assignment_concepts: conceptIds.map((concept_id) => ({ concept_id })),
          }
        : prev
    );
  };

  const handleAddConcept = () => {
    const newConcept: AssignmentConceptDetail = {
      id: tempIdRef.current--,
      name: "",
      description: "",
    };
    setStructure((prev) =>
      prev
        ? {
            ...prev,
            concepts: [...prev.concepts, newConcept],
          }
        : prev
    );
  };

  const handleAddQuestion = () => {
    if (!assignmentId) return;
    const newQuestion: AssignmentQuestion = {
      id: tempIdRef.current--,
      assignment_id: assignmentId,
      prompt: "",
      position: structure?.questions.length ? structure.questions.length + 1 : 1,
      concept_ids: [],
    };
    setStructure((prev) =>
      prev
        ? {
            ...prev,
            questions: [...prev.questions, newQuestion],
          }
        : prev
    );
  };

  if (authLoading || loading) {
    return (
      <div className="grid h-dvh place-items-center">
        <p className="text-sm text-muted-foreground">Loading assignment detail...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="grid h-dvh place-items-center px-6">
        <div className="max-w-md space-y-3 text-center">
          <p className="text-lg font-semibold">Unable to open assignment</p>
          <p className="text-sm text-muted-foreground">{error ?? "This assignment could not be found."}</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const assignmentConceptValue = structure
    ? structure.assignment_concepts.map((item) => item.concept_id).join(", ")
    : "";

  return (
    <div className="min-h-dvh bg-muted/30">
      <Navbar
        name="Socratica"
        homeUrl="/dashboard"
        actions={[{ text: "Dashboard", href: "/dashboard" }]}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-6 pb-16 pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Assignment overview</p>
            <h1 className="text-3xl font-semibold tracking-tight">{assignment.title}</h1>
            {assignment.description && <p className="text-muted-foreground">{assignment.description}</p>}
            <div className="flex flex-wrap gap-2">
              <Badge variant={structure?.structure_approved ? "default" : "secondary"}>
                {structure?.structure_approved ? "Structure approved" : "Structure not approved"}
              </Badge>
              {actionMessage && <Badge variant="outline">{actionMessage}</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? "Analyzing..." : "Analyze Assignment"}
            </Button>
            <Button variant="secondary" onClick={handleSave} disabled={!structure || saving}>
              {saving ? "Saving..." : "Save & Approve"}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">{error}</CardTitle>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">Stored at {file.path}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={getFilePreviewUrl(file.id)} target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Structure proposal</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review concepts, questions, and mappings. Question mappings derive from the concept IDs you enter.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleAddConcept} disabled={!structure}>
                Add concept
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddQuestion} disabled={!structure}>
                Add question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!structure ? (
              <p className="text-sm text-muted-foreground">
                Run analysis to populate the structure. You can then edit and approve it.
              </p>
            ) : (
              <>
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Concepts</h2>
                    <Badge variant="outline">{structure.concepts.length} total</Badge>
                  </div>
                  <div className="space-y-4">
                    {structure.concepts.map((concept, index) => (
                      <div key={concept.id} className="rounded-lg border bg-background/60 p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Name</label>
                            <Input
                              value={concept.name}
                              onChange={(event) =>
                                handleConceptUpdate(index, { name: event.target.value })
                              }
                              placeholder="Concept name"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Description</label>
                            <Textarea
                              value={concept.description}
                              onChange={(event) =>
                                handleConceptUpdate(index, { description: event.target.value })
                              }
                              placeholder="Concept description"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Questions</h2>
                    <Badge variant="outline">{structure.questions.length} total</Badge>
                  </div>
                  <div className="space-y-4">
                    {structure.questions.map((question, index) => (
                      <div key={question.id} className="rounded-lg border bg-background/60 p-4">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Prompt</label>
                            <Textarea
                              value={question.prompt}
                              onChange={(event) =>
                                handleQuestionUpdate(index, { prompt: event.target.value })
                              }
                              placeholder="Question prompt"
                            />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Position</label>
                              <Input
                                type="number"
                                value={question.position}
                                onChange={(event) =>
                                  handleQuestionUpdate(index, {
                                    position: Number(event.target.value || 0),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">
                                Concept IDs (comma separated)
                              </label>
                              <Input
                                value={question.concept_ids.join(", ")}
                                onChange={(event) =>
                                  handleQuestionUpdate(index, {
                                    concept_ids: parseConceptIds(event.target.value),
                                  })
                                }
                                placeholder="1, 2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h2 className="text-lg font-semibold">Assignment-level concepts</h2>
                  <Input
                    value={assignmentConceptValue}
                    onChange={(event) => handleAssignmentConceptsUpdate(event.target.value)}
                    placeholder="Concept IDs applied to the assignment"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter concept IDs that should apply to the assignment overall.
                  </p>
                </section>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
