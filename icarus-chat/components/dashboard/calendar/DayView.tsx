import { useRef, useEffect, useState } from "react";
import { format, eachDayOfInterval, isSameDay, parseISO, addDays, getHours, getMinutes, differenceInMinutes, startOfDay, endOfDay, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AssignmentRead, ClassRead } from "@/app/types/school";
import { CalendarEvent } from "@/app/lib/api/calendar";
import { motion, AnimatePresence } from "motion/react";

interface DayViewProps {
    currentDate: Date;
    assignments: AssignmentRead[];
    calendarEvents: CalendarEvent[];
    classes: ClassRead[];
    getClassColor: (classId: number) => { solid: string; text: string; border: string; light?: string };
    getClassName: (classId: number) => string;
    onEventClick: (event: CalendarEvent) => void;
    onAssignmentClick: (assignment: AssignmentRead) => void;
    onDateChange: (date: Date) => void;
    slideDirection: number;
    onDirectionChange: (direction: number) => void;
}

export function DayView({
    currentDate,
    assignments,
    calendarEvents,
    classes,
    getClassColor,
    getClassName,
    onEventClick,
    onAssignmentClick,
    onDateChange,
    slideDirection,
    onDirectionChange,
}: DayViewProps) {
    // Time grid configuration (6 AM to 11 PM)
    const startHour = 6;
    const endHour = 23;
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    // Helper to calculate position style
    const getEventStyle = (date: Date, durationMinutes: number) => {
        const hour = getHours(date);
        const minute = getMinutes(date);
        const totalMinutesFromStart = (hour - startHour) * 60 + minute;
        const top = (totalMinutesFromStart / ((endHour - startHour + 1) * 60)) * 100;
        const height = (durationMinutes / ((endHour - startHour + 1) * 60)) * 100;

        return {
            top: `${Math.max(0, top)}%`,
            height: `${Math.max(1.5, height)}%`, // Minimum height for visibility
        };
    };

    const dayAssignments = assignments.filter((a) => a.due_at && isSameDay(parseISO(a.due_at.toString()), currentDate));
    const dayEvents = calendarEvents.filter((e) => isSameDay(parseISO(e.start_at), currentDate));

    // Auto-update current time
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Helper to check if event is fully in the past
    const isPast = (endAt: string) => {
        return currentTime > parseISO(endAt);
    };

    // Helper to check if an event is currently happening
    const isInProgress = (startAt: string, endAt: string) => {
        const start = parseISO(startAt);
        const end = parseISO(endAt);
        return currentTime >= start && currentTime <= end;
    };

    // Calculate what percentage of the event has elapsed (for partial grey overlay)
    const getElapsedPercent = (startAt: string, endAt: string) => {
        const start = parseISO(startAt);
        const end = parseISO(endAt);
        const total = differenceInMinutes(end, start);
        const elapsed = differenceInMinutes(currentTime, start);
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    // Scroll Navigation Logic
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Check if horizontal scroll is dominant
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                // Prevent browser back/forward navigation
                e.preventDefault();

                const now = Date.now();
                if (now - lastScrollTime.current < 500) return; // Debounce 500ms

                if (Math.abs(e.deltaX) > 20) {
                    lastScrollTime.current = now;
                    if (e.deltaX > 0) {
                        // Next Day
                        onDirectionChange(1);
                        onDateChange(addDays(currentDate, 1));
                    } else {
                        // Prev Day
                        onDirectionChange(-1);
                        onDateChange(subDays(currentDate, 1));
                    }
                }
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        // Clean up
        return () => container.removeEventListener("wheel", handleWheel);
    }, [currentDate, onDirectionChange, onDateChange]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0,
            position: "absolute",
        }),
    };

    return (
        <div ref={containerRef} className="flex flex-col h-full bg-background overflow-hidden relative">
            {/* Header */}
            <div className="flex-none grid grid-cols-[80px_1fr] border-b bg-muted/40 divide-x z-10 relative bg-background">
                <div className="p-2 text-center text-xs font-semibold text-muted-foreground pt-8">
                    GMT{format(new Date(), "X")}
                </div>
                <div className="py-4 text-center">
                    <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                        <motion.div
                            key={format(currentDate, "MMMM d, yyyy")}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-2xl font-bold text-primary">{format(currentDate, "EEEE")}</div>
                            <div className="text-base text-muted-foreground font-medium">{format(currentDate, "MMMM d, yyyy")}</div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Scrollable Time Grid */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
                <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                    <motion.div
                        key={format(currentDate, "yyyy-MM-dd")}
                        custom={slideDirection}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 150, damping: 25 }}
                        className="min-h-full"
                    >
                        <div className="grid grid-cols-[80px_1fr] min-h-[1000px] h-full divide-x">
                            {/* Time Labels */}
                            <div className="bg-muted/5 text-sm text-muted-foreground text-center py-0 border-r relative">
                                {hours.map((hour) => (
                                    <div key={hour} className="absolute w-full border-t border-transparent" style={{ top: `${((hour - startHour) / (endHour - startHour + 1)) * 100}%` }}>
                                        <span className={cn("block", hour === startHour ? "translate-y-0.5" : "-translate-y-1/2")}>
                                            {format(new Date().setHours(hour, 0), "h a")}
                                        </span>
                                    </div>
                                ))}
                                {/* Current Time Indicator Label */}
                                {(() => {
                                    const now = currentTime;
                                    if (!isSameDay(now, currentDate)) return null;

                                    const hour = getHours(now);
                                    if (hour >= startHour && hour <= endHour) {
                                        const minute = getMinutes(now);
                                        const totalMinutes = (hour - startHour) * 60 + minute;
                                        const top = (totalMinutes / ((endHour - startHour + 1) * 60)) * 100;
                                        return (
                                            <div
                                                className="absolute w-full z-10 flex justify-center"
                                                style={{ top: `${top}%` }}
                                            >
                                                <div className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded -translate-y-1/2 shadow-sm">
                                                    {format(now, "h:mm")}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Day Column */}
                            <div className="relative h-full bg-background/50">
                                {/* Horizontal Hour Lines */}
                                {hours.map((hour) => (
                                    <div
                                        key={`line-${hour}`}
                                        className="absolute w-full border-t border-dashed border-muted-foreground/10 z-0 pointer-events-none"
                                        style={{ top: `${((hour - startHour) / (endHour - startHour + 1)) * 100}%` }}
                                    />
                                ))}

                                {/* Current Time Line */}
                                {(() => {
                                    const now = currentTime;
                                    if (!isSameDay(now, currentDate)) return null;

                                    const hour = getHours(now);
                                    if (hour >= startHour && hour <= endHour) {
                                        const minute = getMinutes(now);
                                        const totalMinutes = (hour - startHour) * 60 + minute;
                                        const top = (totalMinutes / ((endHour - startHour + 1) * 60)) * 100;
                                        return (
                                            <div
                                                className="absolute w-full border-t-2 border-primary z-30 pointer-events-none"
                                                style={{ top: `${top}%` }}
                                            >
                                                <div className="absolute -left-[5px] -top-[5px] w-2.5 h-2.5 bg-primary rounded-full" />
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Assignments */}
                                {dayAssignments.map((assignment) => {
                                    if (!assignment.due_at) return null;
                                    const dueAt = parseISO(assignment.due_at.toString());
                                    const style = getClassColor(assignment.class_id);
                                    const posStyle = getEventStyle(dueAt, 60);

                                    return (
                                        <div
                                            key={assignment.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAssignmentClick(assignment);
                                            }}
                                            className={cn(
                                                "absolute left-2 right-2 rounded-md px-3 py-2 text-sm border-l-4 shadow-sm overflow-hidden hover:brightness-95 transition-all z-10 cursor-pointer",
                                                "bg-background border flex flex-col justify-center",
                                                style.border
                                            )}
                                            style={{ top: posStyle.top, height: "auto", minHeight: "50px" }}
                                        >
                                            <div className="font-bold text-xs uppercase opacity-75 mb-0.5">{getClassName(assignment.class_id)}</div>
                                            <div className="font-semibold truncate">{assignment.title}</div>
                                        </div>
                                    )
                                })}

                                {/* Events */}
                                {dayEvents.map((event) => {
                                    const start = parseISO(event.start_at);
                                    const end = parseISO(event.end_at);
                                    const duration = differenceInMinutes(end, start);
                                    const posStyle = getEventStyle(start, duration);
                                    const style = event.class_id ? getClassColor(event.class_id) : null;
                                    const eventIsPast = isPast(event.end_at);

                                    return (
                                        <div
                                            key={`event-${event.id}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick(event);
                                            }}
                                            className={cn(
                                                "cursor-pointer absolute left-10 right-2 rounded-md px-3 py-2 text-sm border-l-4 shadow-sm overflow-hidden hover:brightness-95 transition-all z-20",
                                                style ? cn(style.light, "border", style.border) : "bg-violet-50 border-violet-500/20 border-l-violet-500",
                                                eventIsPast && "opacity-50"
                                            )}
                                            style={posStyle}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className={cn("truncate text-base font-semibold", style ? style.text : "text-violet-900")}>{event.title}</div>
                                                    {event.description && (
                                                        <div className={cn("text-xs mt-0.5 line-clamp-2", style ? "opacity-80" : "text-violet-800/80")}>{event.description}</div>
                                                    )}
                                                </div>
                                                <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded ml-2 shrink-0", style ? "bg-white/50" : "text-violet-600/80 bg-violet-100/50")}>
                                                    {format(start, "h:mm")} - {format(end, "h:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
