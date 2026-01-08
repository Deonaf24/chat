import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassRead } from "@/app/types/school";

type ClassHeaderCardProps = {
  classData: ClassRead;
  teacherName: string | null;
  analyticsHref?: string | null;
};

export function ClassHeaderCard({ classData, teacherName, analyticsHref }: ClassHeaderCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">Class</Badge>
            {teacherName ? <span className="text-sm text-muted-foreground">Taught by {teacherName}</span> : null}
          </div>
          {analyticsHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={analyticsHref}>View analytics</Link>
            </Button>
          ) : null}
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
