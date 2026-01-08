import { BarChart3, BookOpenText } from "lucide-react";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AssignmentRead } from "@/app/types/school";

interface AssignmentAnalytics {
  confusionRate: number;
  hardestQuestion: string;
  strongestQuestion: string;
}

interface AssignmentsCardProps {
  assignments: AssignmentRead[];
  analyticsForAssignment: (assignment: AssignmentRead) => AssignmentAnalytics;
}

export function AssignmentsCard({ assignments, analyticsForAssignment }: AssignmentsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <BookOpenText className="h-4 w-4" />
            Assignments
          </CardTitle>
          <CardDescription>Includes upcoming analytics hooks.</CardDescription>
        </div>
        <Badge variant="outline">{assignments.length} total</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No assignments yet. Create one to start collecting insights.
          </p>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const analytics = analyticsForAssignment(assignment);
              return (
                <div key={assignment.id} className="rounded-xl border bg-background/60 p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold leading-tight">{assignment.title}</h3>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground">{assignment.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Analytics ready soon
                      </Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/assignments/${assignment.id}`}>Manage</Link>
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs uppercase text-muted-foreground">Confusion rate</p>
                      <p className="text-2xl font-semibold">{analytics.confusionRate}%</p>
                      <p className="text-xs text-muted-foreground">
                        Future endpoint: % of students who indicate confusion.
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs uppercase text-muted-foreground">Hardest question</p>
                      <p className="text-base font-medium">{analytics.hardestQuestion}</p>
                      <p className="text-xs text-muted-foreground">
                        Future endpoint: question with the most struggle.
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs uppercase text-muted-foreground">Most understood</p>
                      <p className="text-base font-medium">{analytics.strongestQuestion}</p>
                      <p className="text-xs text-muted-foreground">
                        Future endpoint: question students get right away.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
