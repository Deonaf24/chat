"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AssignmentRead, ClassRead } from "@/app/types/school";
import { CARD_STYLES } from "@/lib/constants";

interface UpcomingEventsProps {
    classes: ClassRead[];
    assignments: AssignmentRead[];
}

interface EventItem {
    type: "assignment" | "lecture";
    title: string;
    classId: number;
    className: string;
    date: Date; // The specific occurrence date
    id: string; // unique key
    style: typeof CARD_STYLES[number]; // Store the style object
    link: string; // Navigation link
}

export function UpcomingEvents({ classes, assignments }: UpcomingEventsProps) {

    // Helper to get style for a class
    const getStyleForClass = (classId: number) => {
        const index = classes.findIndex(c => c.id === classId);
        if (index === -1) return CARD_STYLES[0];
        return CARD_STYLES[index % CARD_STYLES.length];
    }

    // 1. Process Events
    const events = useMemo(() => {
        const list: EventItem[] = [];
        const realNow = new Date();
        const startOfToday = new Date(realNow);
        startOfToday.setHours(0, 0, 0, 0);

        // A. Assignments
        assignments.forEach(a => {
            if (a.due_at) {
                const due = new Date(a.due_at);
                // Filter out assignments that are already due
                if (due > realNow) {
                    const cls = classes.find(c => c.id === a.class_id);
                    list.push({
                        type: "assignment",
                        title: a.title,
                        classId: a.class_id,
                        className: cls?.name || "Unknown Class",
                        date: due,
                        id: `assign-${a.id}`,
                        style: getStyleForClass(a.class_id),
                        link: `/dashboard/classes/${a.class_id}/assignments/${a.id}`
                    });
                }
            }
        });

        // B. Lectures (next 4 weeks)
        classes.forEach(c => {
            if (c.lectures) {
                c.lectures.forEach(l => {
                    const jsDay = l.day_of_week === 6 ? 0 : l.day_of_week + 1;

                    // Correction: simpler loop for next 28 days
                    for (let d = 0; d < 28; d++) {
                        const check = new Date(startOfToday);
                        check.setDate(check.getDate() + d);

                        if (check.getDay() === jsDay) {
                            // Construct specific lecture time
                            const [hours, minutes] = l.start_time.split(':').map(Number);
                            const lectureStart = new Date(check);
                            lectureStart.setHours(hours, minutes, 0, 0);

                            const lectureEnd = new Date(lectureStart);
                            lectureEnd.setMinutes(lectureEnd.getMinutes() + l.duration_minutes);

                            // Only include if the lecture hasn't ended yet
                            if (lectureEnd > realNow) {
                                list.push({
                                    type: "lecture",
                                    title: c.name,
                                    classId: c.id,
                                    className: "Lecture",
                                    date: lectureStart,
                                    id: `lec-${c.id}-${l.id}-${check.getTime()}`,
                                    style: getStyleForClass(c.id),
                                    link: `/dashboard/calendar?date=${format(check, 'yyyy-MM-dd')}`
                                });
                            }
                        }
                    }
                });
            }
        });

        // Sort by date
        return list.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [classes, assignments]);

    return (

        <Card className="max-h-[calc(100vh-120px)] flex flex-col border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm py-0 gap-0">
            <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Upcoming
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0 p-3 pt-0">
                <ScrollArea className="h-full">
                    <div className="space-y-1">
                        {events.slice(0, 5).map((event) => (
                            <Link key={event.id} href={event.link} className="block group">
                                <div className="flex gap-2 items-start p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-medium text-xs truncate leading-tight py-0.5 group-hover:underline decoration-muted-foreground/50 underline-offset-2">{event.title}</p>
                                            <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-1.5 py-0.5 rounded">
                                                {format(event.date, "MMM d")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className={cn("h-1.5 w-1.5 rounded-full", event.style.solid)} />
                                            <p className="text-[10px] text-muted-foreground truncate">{event.className}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {events.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground text-xs">
                                No upcoming events
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
