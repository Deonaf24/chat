"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StructureEditor } from "@/components/assignments/StructureEditor";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useAssignmentStructure } from "@/app/hooks/assignments/useAssignmentStructure";
import {
  analyzeAssignment,
  getAssignment,
  getFile,
  getFilePreviewUrl,
  updateAssignmentStructure,
} from "@/app/lib/api/school";
import { AssignmentRead, FileRead } from "@/app/types/school";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useDashboardAuth();
  const [assignment, setAssignment] = useState<AssignmentRead | null>(null);
  const [files, setFiles] = useState<FileRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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

  const {
    structure,
    assignmentConceptIds,
    setStructure,
    addConcept,
    updateConcept,
    removeConcept,
    addQuestion,
    updateQuestion,
    removeQuestion,
    updateAssignmentConceptIds,
    buildPayload,
  } = useAssignmentStructure({ assignmentId });

  const handleSave = async () => {
    if (!assignmentId || !structure) return;
    setSaving(true);
    setActionMessage(null);
    setError(null);

    const payload = buildPayload({ approve: true });
    if (!payload) {
      setSaving(false);
      return;
    }

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

        {structure ? (
          <StructureEditor
            concepts={structure.concepts}
            questions={structure.questions}
            assignmentConceptIds={assignmentConceptIds}
            onAddConcept={addConcept}
            onAddQuestion={addQuestion}
            onUpdateConcept={updateConcept}
            onRemoveConcept={removeConcept}
            onUpdateQuestion={updateQuestion}
            onRemoveQuestion={removeQuestion}
            onAssignmentConceptIdsChange={updateAssignmentConceptIds}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Structure proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Run analysis to populate the structure. You can then edit and approve it.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
