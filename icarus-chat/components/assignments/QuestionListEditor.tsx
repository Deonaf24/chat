"use client";

import { Trash2 } from "lucide-react";

import { AssignmentQuestion } from "@/app/types/assignmentStructure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QuestionListEditorProps {
  questions: AssignmentQuestion[];
  onUpdate: (index: number, updates: Partial<AssignmentQuestion>) => void;
  onRemove: (questionId: number) => void;
}

const parseConceptIds = (value: string) =>
  value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));

export function QuestionListEditor({ questions, onUpdate, onRemove }: QuestionListEditorProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Questions</h2>
        <Badge variant="outline">{questions.length} total</Badge>
      </div>
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="rounded-lg border bg-background/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">Question #{question.position}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(question.id)}
                aria-label="Remove question"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Prompt</label>
                <Textarea
                  value={question.prompt}
                  onChange={(event) => onUpdate(index, { prompt: event.target.value })}
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
                      onUpdate(index, {
                        position: Number(event.target.value || 0),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Concept IDs</label>
                  <Input
                    value={question.concept_ids.join(", ")}
                    onChange={(event) =>
                      onUpdate(index, {
                        concept_ids: parseConceptIds(event.target.value),
                      })
                    }
                    placeholder="1, 2"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
