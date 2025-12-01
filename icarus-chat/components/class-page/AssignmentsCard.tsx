import { AssignmentRead } from "@/app/types/school";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentsList } from "./AssignmentsList";

type AssignmentsCardProps = {
  assignments: AssignmentRead[];
};

export function AssignmentsCard({ assignments }: AssignmentsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Upcoming work for this class.</CardDescription>
        </div>
        <Badge variant="outline">{assignments.length} total</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assignments yet for this class.</p>
        ) : (
          <AssignmentsList assignments={assignments} />
        )}
      </CardContent>
    </Card>
  );
}
