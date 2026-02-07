"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, getWeeksInMonth, addWeeks, subWeeks, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { listCalendarEvents, listTeacherCalendarEvents, CalendarEvent, deleteCalendarEvent } from "@/app/lib/api/calendar";
import { toast } from "sonner";
import { MonthView } from "@/components/dashboard/calendar/MonthView";
import { WeekView } from "@/components/dashboard/calendar/WeekView";
import { DayView } from "@/components/dashboard/calendar/DayView";
import { EventDetailsDialog } from "@/components/dashboard/calendar/EventDetailsDialog";
import { AssignmentDetailsDialog } from "@/components/dashboard/calendar/AssignmentDetailsDialog";

export default function CalendarPage() {
    const router = useRouter();
    const { user, teacher, student, loading: authLoading } = useDashboardAuth();
    const { classes, assignments, loading: dataLoading, initialized } = useDashboardData(user, teacher, student);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week" | "day">("month");
    const [slideDirection, setSlideDirection] = useState(0);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Assignment Dialog State
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRead | null>(null);
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsDialogOpen(true);
    };

    const handleAssignmentClick = (assignment: AssignmentRead) => {
        setSelectedAssignment(assignment);
        setIsAssignmentDialogOpen(true);
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (!student?.id) return;
        try {
            await deleteCalendarEvent(student.id, eventId);
            setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
            setIsDialogOpen(false);
            toast.success("Event deleted successfully");
        } catch (error) {
            console.error("Failed to delete event", error);
            toast.error("Failed to delete event");
            throw error;
        }
    };

    const isStrictlyLoading = authLoading || dataLoading || (!initialized && !!user);
    const showLoader = useSmoothLoading(isStrictlyLoading);

    // Fetch calendar events
    useEffect(() => {
        if (student?.id) {
            listCalendarEvents(student.id)
                .then(setCalendarEvents)
                .catch(console.error);
        } else if (teacher?.id) {
            listTeacherCalendarEvents(teacher.id)
                .then(setCalendarEvents)
                .catch(console.error);
        }
    }, [student?.id, teacher?.id]);

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

    // Navigation Logic
    const next = () => {
        setSlideDirection(1);
        if (view === "month") setCurrentDate(addMonths(currentDate, 1));
        else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prev = () => {
        setSlideDirection(-1);
        if (view === "month") setCurrentDate(subMonths(currentDate, 1));
        else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, -1));
    };

    const resetToToday = () => setCurrentDate(new Date());

    if (showLoader) {
        return (
            <div className="grid h-dvh place-items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        );
    }

    if (isStrictlyLoading) {
        return null;
    }

    return (
        <div className="h-dvh flex flex-col bg-muted/30">
            {/* Navbar */}
            <div className="flex-none sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <div className="relative mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 z-10">
                        <SidebarMenu classes={classes} role={teacher ? 'teacher' : student ? 'student' : undefined} />
                        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
                            Socratica
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 z-10 ml-auto bg-transparent">
                        {/* View Switcher */}
                        <div className="flex items-center gap-1 bg-background border rounded-md p-1 mr-4 shadow-sm">
                            <Button
                                variant={view === "month" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView("month")}
                                className="h-7 px-2 text-xs"
                            >
                                Month
                            </Button>
                            <Button
                                variant={view === "week" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView("week")}
                                className="h-7 px-2 text-xs"
                            >
                                Week
                            </Button>
                            <Button
                                variant={view === "day" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView("day")}
                                className="h-7 px-2 text-xs"
                            >
                                Day
                            </Button>
                        </div>

                        <div className="flex items-center gap-1 border rounded-md bg-background shadow-sm mr-2">
                            <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-none rounded-l-md border-r">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="px-3 text-sm font-semibold min-w-[140px] text-center select-none">
                                {view === "month" && format(currentDate, "MMMM yyyy")}
                                {view === "day" && format(currentDate, "MMMM d, yyyy")}
                                {view === "week" && `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d")}`}
                            </div>
                            <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-none rounded-r-md border-l">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetToToday}
                            className={cn(
                                view === "day" && isSameDay(currentDate, new Date())
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : ""
                            )}
                        >
                            Today
                        </Button>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-4 w-full h-full overflow-hidden max-w-7xl mx-auto">
                <Card className="flex-1 flex flex-col shadow-sm overflow-hidden border-border/60 p-0 gap-0 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col h-full w-full overflow-hidden"
                        >
                            {view === "month" && (
                                <MonthView
                                    currentDate={currentDate}
                                    assignments={assignments}
                                    calendarEvents={calendarEvents}
                                    classes={classes}
                                    getClassColor={getClassColor}
                                    getClassName={getClassName}
                                    onEventClick={handleEventClick}
                                    onAssignmentClick={handleAssignmentClick}
                                    onDateChange={setCurrentDate}
                                    slideDirection={slideDirection}
                                    onDirectionChange={setSlideDirection}
                                />
                            )}
                            {view === "week" && (
                                <WeekView
                                    currentDate={currentDate}
                                    assignments={assignments}
                                    calendarEvents={calendarEvents}
                                    classes={classes}
                                    getClassColor={getClassColor}
                                    getClassName={getClassName}
                                    onEventClick={handleEventClick}
                                    onAssignmentClick={handleAssignmentClick}
                                    onDateChange={setCurrentDate}
                                    slideDirection={slideDirection}
                                    onDirectionChange={setSlideDirection}
                                />
                            )}
                            {view === "day" && (
                                <DayView
                                    currentDate={currentDate}
                                    assignments={assignments}
                                    calendarEvents={calendarEvents}
                                    classes={classes}
                                    getClassColor={getClassColor}
                                    getClassName={getClassName}
                                    onEventClick={handleEventClick}
                                    onAssignmentClick={handleAssignmentClick}
                                    onDateChange={setCurrentDate}
                                    slideDirection={slideDirection}
                                    onDirectionChange={setSlideDirection}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Card>
                <EventDetailsDialog
                    event={selectedEvent}
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onDelete={handleDeleteEvent}
                    getClassName={getClassName}
                />
                <AssignmentDetailsDialog
                    assignment={selectedAssignment}
                    isOpen={isAssignmentDialogOpen}
                    onClose={() => setIsAssignmentDialogOpen(false)}
                    getClassColor={getClassColor}
                    getClassName={getClassName}
                />
            </main>
        </div>
    );
}
