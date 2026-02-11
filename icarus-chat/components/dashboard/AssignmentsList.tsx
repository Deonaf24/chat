import { useEffect, useState, useMemo } from "react";
import { AssignmentRead } from "@/app/types/school";
import { AssignmentAnalytics } from "@/app/types/analytics";
import { getAssignmentAnalytics } from "@/app/lib/api/analytics";
import { AssignmentCard } from "./AssignmentCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CARD_STYLES } from "@/lib/constants";

interface AssignmentsListProps {
    assignments: AssignmentRead[];
}

export function AssignmentsList({ assignments }: AssignmentsListProps) {
    const [analyticsByAssignmentId, setAnalyticsByAssignmentId] = useState<
        Record<string, AssignmentAnalytics | null | undefined>
    >({});

    // Sort assignments by due date (soonest first)
    const sortedAssignments = useMemo(() => {
        return [...assignments].sort((a, b) => {
            const dateA = a.due_at ? new Date(a.due_at).getTime() : Infinity; // No due date = end of list
            const dateB = b.due_at ? new Date(b.due_at).getTime() : Infinity;
            return dateA - dateB;
        });
    }, [assignments]);

    useEffect(() => {
        let isMounted = true;
        if (assignments.length === 0) return;

        // Use a simpler fetching strategy or caching if this gets heavy
        const fetchAnalytics = async () => {
            const results = await Promise.all(
                assignments.map(async (assignment) => {
                    try {
                        const analytics = await getAssignmentAnalytics(Number(assignment.id));
                        return { id: assignment.id, analytics };
                    } catch {
                        return { id: assignment.id, analytics: null };
                    }
                })
            );

            if (isMounted) {
                setAnalyticsByAssignmentId((prev) => {
                    const next = { ...prev };
                    results.forEach(({ id, analytics }) => {
                        next[id] = analytics;
                    });
                    return next;
                });
            }
        }

        fetchAnalytics();

        return () => {
            isMounted = false;
        };
    }, [assignments]);

    if (assignments.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                No assignments yet. Create one to get started!
            </div>
        )
    }

    // Style from constants
    const assignmentStyles = CARD_STYLES;

    return (
        <div className="space-y-4">
            {sortedAssignments.map((assignment, index) => {
                const style = assignmentStyles[index % assignmentStyles.length];
                return (
                    <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        analytics={analyticsByAssignmentId[assignment.id]}
                        color={style.border}
                        gradient={style.gradient}
                    />
                );
            })}
        </div>
    );
}
