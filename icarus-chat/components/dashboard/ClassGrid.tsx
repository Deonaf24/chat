import { ClassRead } from "@/app/types/school";
import { TeacherClassCard } from "./TeacherClassCard";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { CARD_STYLES } from "@/lib/constants";

interface ClassGridProps {
    classes: ClassRead[];
    selectedClassId: number | null;
    onSelect: (id: number) => void;
    // We need stats for each class. In a real app, this might come pre-calculated.
    // For now, we'll pass arrays or lookup functions.
    getStats: (classId: number) => { studentCount: number; assignmentCount: number };
    showCreate?: boolean;
}

export function ClassGrid({ classes, onSelect, getStats, showCreate = true }: ClassGridProps) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((classItem, index) => {
                const stats = getStats(classItem.id);
                // Use the shared high-contrast palette
                const style = CARD_STYLES[index % CARD_STYLES.length];

                return (
                    <TeacherClassCard
                        key={classItem.id}
                        classItem={classItem}
                        studentCount={stats.studentCount}
                        assignmentCount={stats.assignmentCount}
                        theme={style}
                        onClick={() => onSelect(classItem.id)}
                    />
                );
            })}

            {/* "Add Class" Placeholder Card */}
            {showCreate && (
                <Card className="flex h-[200px] flex-col items-center justify-center gap-4 border-dashed bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 cursor-not-allowed opacity-60">
                    <div className="rounded-full bg-background p-3 shadow-sm">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Create New Class</span>
                </Card>
            )}
        </div>
    );
}
