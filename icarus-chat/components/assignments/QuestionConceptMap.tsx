"use client";

import { AssignmentConceptDetail, AssignmentQuestion } from "@/app/types/assignmentStructure";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface QuestionConceptMapProps {
  questions: AssignmentQuestion[];
  concepts: AssignmentConceptDetail[];
}

const conceptNameForId = (concepts: AssignmentConceptDetail[], conceptId: number) =>
  concepts.find((concept) => concept.id === conceptId)?.name ?? `Concept ${conceptId}`;

export function QuestionConceptMap({ questions, concepts }: QuestionConceptMapProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Question → Concept map</h2>
        <Badge variant="outline">{questions.length} questions</Badge>
      </div>
      <div className="space-y-3">
        {questions.map((question) => (
          <Card key={question.id} className="rounded-lg border bg-background/60 p-4">
            <p className="text-sm font-medium">{question.prompt || `Question #${question.position}`}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {question.concept_ids.length === 0 ? (
                <Badge variant="secondary">No concepts linked</Badge>
              ) : (
                question.concept_ids.map((conceptId) => (
                  <Badge key={conceptId} variant="outline">
                    {conceptNameForId(concepts, conceptId)}
                  </Badge>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
