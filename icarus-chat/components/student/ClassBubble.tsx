import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClassRead } from "@/app/types/school";

interface ClassBubbleProps {
  classItem: ClassRead;
  teacherName?: string;
  gradient: string;
  onClick: () => void;
}

export function ClassBubble({ classItem, teacherName, gradient, onClick }: ClassBubbleProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden border-none shadow-md transition hover:-translate-y-0.5",
        "bg-gradient-to-br text-primary-foreground",
      )}
      onClick={onClick}
    >
      <div className={cn("h-2 w-full", `bg-gradient-to-r ${gradient}`)} />
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold text-foreground drop-shadow-sm">{classItem.name}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-base text-muted-foreground">
          <Badge variant="secondary" className="bg-background/80 text-foreground shadow-sm">
            Class
          </Badge>
          {teacherName ? (
            <span className="text-sm text-muted-foreground">Taught by {teacherName}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Teacher assignment pending</span>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
