"use client";

import { useRouter } from "next/navigation";
import { AlarmClock } from "lucide-react";

import { AssignmentRead } from "@/app/types/school";
import { formatDueDate, isDueSoon } from "@/app/hooks/class/useAssignmentHelpers";
import { Badge } from "@/components/ui/badge";

type AssignmentsListProps = {
  assignments: AssignmentRead[];
};

export function AssignmentsList({ assignments }: AssignmentsListProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="group cursor-pointer rounded-xl border bg-background/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => router.push(`/chat/assignments/${assignment.id}`)}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Assignment</Badge>
                {isDueSoon(assignment) ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlarmClock className="h-3.5 w-3.5" />
                    Due soon
                  </Badge>
                ) : null}
              </div>
              <h3 className="text-lg font-semibold leading-tight">{assignment.title}</h3>
              {assignment.description ? <p className="text-sm text-muted-foreground">{assignment.description}</p> : null}
            </div>
            <Badge variant="outline">Due {formatDueDate(assignment)}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
