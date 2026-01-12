"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, getWeeksInMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAssignments, listClasses } from "@/app/lib/api/school";
import { AssignmentRead, ClassRead } from "@/app/types/school";
import { getClassStyle } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { useRouter } from "next/navigation";
import { authStore } from "@/app/lib/auth/authStore";

export default function CalendarPage() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
    const [classes, setClasses] = useState<ClassRead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [classesData, assignmentsData] = await Promise.all([
                    listClasses(),
                    listAssignments()
                ]);
                setClasses(classesData);
                setAssignments(assignmentsData);
            } catch (error) {
                console.error("Failed to fetch calendar data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        authStore.logout();
        router.replace("/");
    };

    const getClassColor = (classId: number) => {
        const index = classes.findIndex(c => c.id === classId);
        if (index === -1) return { solid: "bg-primary", text: "text-primary-foreground", border: "border-primary" };
        return getClassStyle(index);
    };

    const getClassName = (classId: number) => {
        return classes.find(c => c.id === classId)?.name || "Unknown Class";
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const resetToToday = () => setCurrentDate(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Calculate precise grid rows logic
    // Usually 5 or 6 weeks. We want to fill the space.
    // We'll use CSS grid with 1fr for rows.

    if (loading) {
        return (
            <div className="grid h-dvh place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading calendar...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-dvh flex flex-col bg-muted/30">
            {/* Navbar */}
            <div className="flex-none sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <div className="relative mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 z-10">
                        <SidebarMenu classes={classes} />
                        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
                            Socratica
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 z-10 ml-auto bg-transparent">
                        <div className="flex items-center gap-1 border rounded-md bg-background shadow-sm mr-2">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-none rounded-l-md border-r">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="px-3 text-sm font-semibold min-w-[120px] text-center select-none">
                                {format(currentDate, "MMMM yyyy")}
                            </div>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-none rounded-r-md border-l">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetToToday}>
                            Today
                        </Button>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>
            </div>

            {/* Main Content - No scroll on main container, only internal if needed, but goal is fit-to-screen */}
            <main className="flex-1 flex flex-col p-4 w-full h-full overflow-hidden max-w-7xl mx-auto">
                <Card className="flex-1 flex flex-col shadow-sm overflow-hidden border-border/60">
                    {/* Weekday Header */}
                    <div className="flex-none grid grid-cols-7 border-b bg-muted/40">
                        {weekDays.map((day) => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid - uses flex-1 to fill remaining space and grid keys to distribute space */}
                    <div className="flex-1 grid grid-cols-7 auto-rows-[1fr] overflow-hidden">
                        {calendarDays.map((day, dayIdx) => {
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            // Filter assignments for this day
                            const dayAssignments = assignments.filter((a) => {
                                if (!a.due_at) return false;
                                return isSameDay(parseISO(a.due_at.toString()), day);
                            });

                            return (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "min-h-0 border-b border-r p-1.5 transition-colors hover:bg-muted/5 flex flex-col gap-1 relative group overflow-hidden",
                                        !isCurrentMonth && "bg-muted/5 text-muted-foreground/30",
                                        isToday && "bg-primary/5",
                                        // Right border logic could be handled by grid proper, but standard border-r works if container chops overflow
                                        (dayIdx + 1) % 7 === 0 && "border-r-0"
                                    )}
                                >
                                    <div className="flex-none flex items-center justify-between">
                                        <span
                                            className={cn(
                                                "text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full",
                                                isToday
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {format(day, "d")}
                                        </span>
                                    </div>

                                    {/* Assignments Container - scrollable only if absolutely necessary but ideally text truncates */}
                                    <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-y-auto custom-scrollbar">
                                        {dayAssignments.map((assignment) => {
                                            const style = getClassColor(assignment.class_id);
                                            return (
                                                <Link
                                                    key={assignment.id}
                                                    href={`/dashboard/classes/${assignment.class_id}/assignments/${assignment.id}`}
                                                    className="block shrink-0"
                                                >
                                                    <div
                                                        className={cn(
                                                            "text-[10px] px-1.5 py-0.5 rounded-sm border-l-2 truncate font-medium transition-all hover:brightness-95 hover:scale-[1.01]",
                                                            "bg-background shadow-sm border border-l-4",
                                                            style.border
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-baseline gap-1">
                                                            <span className={cn("text-[8px] uppercase tracking-tighter opacity-80", style.text)}>
                                                                {getClassName(assignment.class_id)}
                                                            </span>
                                                        </div>
                                                        <div className="truncate text-foreground leading-tight">
                                                            {assignment.title}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </main>
        </div>
    );
}
