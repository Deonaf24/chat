"use client";

import { Trash2 } from "lucide-react";

import { AssignmentConceptDetail } from "@/app/types/assignmentStructure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ConceptListEditorProps {
  concepts: AssignmentConceptDetail[];
  onUpdate: (index: number, updates: Partial<AssignmentConceptDetail>) => void;
  onRemove: (conceptId: number) => void;
}

export function ConceptListEditor({ concepts, onUpdate, onRemove }: ConceptListEditorProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Concepts</h2>
        <Badge variant="outline">{concepts.length} total</Badge>
      </div>
      <div className="space-y-4">
        {concepts.map((concept, index) => (
          <Card key={concept.id} className="rounded-lg border bg-background/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">Concept #{index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(concept.id)}
                aria-label="Remove concept"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <Input
                  value={concept.name}
                  onChange={(event) => onUpdate(index, { name: event.target.value })}
                  placeholder="Concept name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Textarea
                  value={concept.description}
                  onChange={(event) => onUpdate(index, { description: event.target.value })}
                  placeholder="Concept description"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
