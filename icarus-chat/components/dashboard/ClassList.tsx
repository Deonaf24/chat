import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ClassRead } from "@/app/types/school";

interface ClassListProps {
  classes: ClassRead[];
  selectedClassId: number | null;
  onSelect: (classId: number) => void;
}

export function ClassList({ classes, selectedClassId, onSelect }: ClassListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Your classes</CardTitle>
            <CardDescription>Navigate between your sections.</CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {classes.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No classes found. Add a class in the school admin to get started.
          </p>
        ) : (
          <ScrollArea className="h-[320px] pr-3">
            <div className="space-y-2">
              {classes.map((classItem) => (
                <button
                  key={classItem.id}
                  type="button"
                  onClick={() => onSelect(classItem.id)}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition hover:border-primary/60",
                    selectedClassId === classItem.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-background",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium leading-tight">{classItem.name}</p>
                      {classItem.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{classItem.description}</p>
                      )}
                    </div>
                    <Badge variant={selectedClassId === classItem.id ? "default" : "outline"}>
                      {classItem.student_ids.length} students
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
