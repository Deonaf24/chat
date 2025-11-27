import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassStatsRowProps {
  studentsCount: number;
  assignmentsCount: number;
  rosterLabel: string;
}

export function ClassStatsRow({ studentsCount, assignmentsCount, rosterLabel }: ClassStatsRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Students</CardDescription>
          <CardTitle className="text-3xl font-semibold">{studentsCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Assignments</CardDescription>
          <CardTitle className="text-3xl font-semibold">{assignmentsCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Roster coverage</CardDescription>
          <CardTitle className="text-3xl font-semibold">{rosterLabel}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
