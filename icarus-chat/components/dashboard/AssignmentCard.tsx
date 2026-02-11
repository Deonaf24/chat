import Link from "next/link";
import { format } from "date-fns";
import { BarChart3, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssignmentRead } from "@/app/types/school";
import { AssignmentAnalytics } from "@/app/types/analytics";

interface AssignmentCardProps {
    assignment: AssignmentRead;
    analytics: AssignmentAnalytics | null | undefined;
    color: string;
    gradient: string;
}

export function AssignmentCard({ assignment, analytics, color, gradient }: AssignmentCardProps) {
    return (
        <Card className={`relative group overflow-hidden rounded-xl border-l-[6px] bg-background/60 shadow-sm hover:bg-muted/20 transition-colors ${color} border-y border-r h-[220px] flex flex-col justify-between`}>
            {/* Main Overlay Link */}
            <Link
                href={`/dashboard/classes/${assignment.class_id}/assignments/${assignment.id}`}
                className="absolute inset-0 z-10 focus:outline-none"
            >
                <span className="sr-only">View Assignment</span>
            </Link>



            <CardHeader className="relative z-10 flex flex-col gap-2 p-4 md:flex-row md:items-start md:justify-between flex-1 pointer-events-none">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold leading-tight">
                        {/* Title doesn't need explicit link as overlay covers it, but keeping text selectable is nice if pointer-events-auto */}
                        {assignment.title}
                    </CardTitle>
                    {assignment.due_at && (
                        <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            Due {format(new Date(assignment.due_at), "PPP")}
                        </CardDescription>
                    )}
                    {assignment.description && (
                        <p className="text-sm text-foreground/80 mt-1 line-clamp-2">{assignment.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 relative z-20 pointer-events-auto">
                    {/* Analytics button removed as requested */}
                </div>
            </CardHeader>

            {/* Analytics Snapshot within the card */}
            <CardContent className="relative z-10 p-4 pt-0 pointer-events-none">
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 text-sm mt-auto">
                    <div className="flex flex-col justify-center border-l-[3px] border-red-500/60 pl-3 py-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Weakest Topic</span>
                        <div className="font-medium text-foreground truncate" title={analytics?.least_understood_concept?.concept_name}>
                            {analytics?.least_understood_concept?.concept_name ?? "—"}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center border-l-[3px] border-emerald-500/60 pl-3 py-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Top Topic</span>
                        <div className="font-medium text-foreground truncate" title={analytics?.most_understood_concept?.concept_name}>
                            {analytics?.most_understood_concept?.concept_name ?? "—"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
