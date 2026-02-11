import { ClassRead } from "@/app/types/school";
import { ClassBubble } from "@/components/student/ClassBubble";

interface ClassListProps {
  classes: ClassRead[];
  teacherUsernames: Record<number, string>;
  onNavigate: (classId: number) => void;
}

const accentGradients = [
  "from-primary/80 to-primary/60",
  "from-emerald-500/80 to-emerald-400/70",
  "from-blue-500/80 to-cyan-400/70",
  "from-orange-500/80 to-amber-400/70",
  "from-purple-500/80 to-fuchsia-500/70",
];

export function ClassList({ classes, teacherUsernames, onNavigate }: ClassListProps) {
  return (
    <div className="flex flex-col gap-4">
      {classes.map((classItem, index) => (
        <ClassBubble
          key={classItem.id}
          classItem={classItem}
          teacherName={classItem.teacher_id ? teacherUsernames[classItem.teacher_id] : ""}
          gradient={accentGradients[index % accentGradients.length]}
          onClick={() => onNavigate(classItem.id)}
        />
      ))}
    </div>
  );
}
