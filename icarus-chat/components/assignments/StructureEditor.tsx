"use client";

import { Plus } from "lucide-react";

import { AssignmentConceptDetail, AssignmentQuestion } from "@/app/types/assignmentStructure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ConceptListEditor } from "@/components/assignments/ConceptListEditor";
import { QuestionListEditor } from "@/components/assignments/QuestionListEditor";
import { QuestionConceptMap } from "@/components/assignments/QuestionConceptMap";

interface StructureEditorProps {
  concepts: AssignmentConceptDetail[];
  questions: AssignmentQuestion[];
  assignmentConceptIds: number[];
  onAddConcept: () => void;
  onAddQuestion: () => void;
  onUpdateConcept: (index: number, updates: Partial<AssignmentConceptDetail>) => void;
  onRemoveConcept: (conceptId: number) => void;
  onUpdateQuestion: (index: number, updates: Partial<AssignmentQuestion>) => void;
  onRemoveQuestion: (questionId: number) => void;
  onAssignmentConceptIdsChange: (conceptIds: number[]) => void;
}

const parseConceptIds = (value: string) =>
  value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));

export function StructureEditor({
  concepts,
  questions,
  assignmentConceptIds,
  onAddConcept,
  onAddQuestion,
  onUpdateConcept,
  onRemoveConcept,
  onUpdateQuestion,
  onRemoveQuestion,
  onAssignmentConceptIdsChange,
}: StructureEditorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Structure proposal</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review concepts, questions, and mappings. Question mappings derive from the concept IDs you enter.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onAddConcept}>
            <Plus className="mr-2 h-4 w-4" />
            Add concept
          </Button>
          <Button variant="outline" size="sm" onClick={onAddQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Add question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ConceptListEditor concepts={concepts} onUpdate={onUpdateConcept} onRemove={onRemoveConcept} />

        <Separator />

        <QuestionListEditor questions={questions} onUpdate={onUpdateQuestion} onRemove={onRemoveQuestion} />

        <Separator />

        <QuestionConceptMap questions={questions} concepts={concepts} />

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assignment-level concepts</h2>
            <Badge variant="outline">{assignmentConceptIds.length} linked</Badge>
          </div>
          <Input
            value={assignmentConceptIds.join(", ")}
            onChange={(event) => onAssignmentConceptIdsChange(parseConceptIds(event.target.value))}
            placeholder="Concept IDs applied to the assignment"
          />
          <p className="text-xs text-muted-foreground">Enter concept IDs that apply to the assignment overall.</p>
        </section>
      </CardContent>
    </Card>
  );
}
