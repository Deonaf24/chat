import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface TeacherProfileCardProps {
  user: User | null;
  teacher: TeacherRead | null;
  classCount: number;
}

export function TeacherProfileCard({ user, teacher, classCount }: TeacherProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Badge variant="outline">Teacher profile</Badge>
        </CardTitle>
        <CardDescription>Context from the school roster.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Logged in as</span>
          <span className="font-medium">{user?.username}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Teacher record</span>
          <span className="font-medium">{teacher?.id ?? "Pending setup"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Classes linked</span>
          <span className="font-medium">{classCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
