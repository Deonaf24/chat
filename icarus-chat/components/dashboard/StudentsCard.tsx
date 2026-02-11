import { Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface StudentsCardProps {
  students: StudentRead[];
  usersById: Record<number, User>;
}

export function StudentsCard({ students, usersById }: StudentsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </CardTitle>
          <CardDescription>Roster pulled from the school service.</CardDescription>
        </div>
        <Badge variant="outline">{students.length} in class</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students are attached to this class yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {students.map((student) => (
              <div key={student.id} className="rounded-lg border bg-background px-4 py-3 text-sm shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {student.name ?? usersById[student.user_id]?.username ?? `Student #${student.id}`}
                  </span>
                  <Badge variant="secondary">Enrolled</Badge>
                </div>
                <p className="text-muted-foreground">User ID: {student.user_id}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
