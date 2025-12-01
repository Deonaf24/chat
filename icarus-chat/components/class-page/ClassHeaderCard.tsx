import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassRead } from "@/app/types/school";

type ClassHeaderCardProps = {
  classData: ClassRead;
  teacherName: string | null;
};

export function ClassHeaderCard({ classData, teacherName }: ClassHeaderCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Class</Badge>
          {teacherName ? <span className="text-sm text-muted-foreground">Taught by {teacherName}</span> : null}
        </div>
        <CardTitle className="text-3xl font-semibold">{classData.name}</CardTitle>
        {classData.description ? (
          <CardDescription>{classData.description}</CardDescription>
        ) : (
          <CardDescription>No class description provided yet.</CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
