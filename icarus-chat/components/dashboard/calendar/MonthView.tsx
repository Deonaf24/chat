"use client";

import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "motion/react";

import { format, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AssignmentRead, ClassRead } from "@/app/types/school";
import { CalendarEvent } from "@/app/lib/api/calendar";

interface MonthViewProps {
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

export function MonthView({
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
}: MonthViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

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
                        // Next Month
                        onDirectionChange(1);
                        onDateChange(addMonths(currentDate, 1));
                    } else {
                        // Prev Month
                        onDirectionChange(-1);
                        onDateChange(subMonths(currentDate, 1));
                    }
                }
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, [currentDate, onDirectionChange, onDateChange]);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
        }),
    };

    return (
        <div ref={containerRef} className="flex flex-col h-full bg-background">
            {/* Weekday Header */}
            <div className="flex-none grid grid-cols-7 border-b bg-muted/40 z-10">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-primary uppercase tracking-wider border-r last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid Wrapper */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                    <motion.div
                        key={format(currentDate, "yyyy-MM")}
                        custom={slideDirection}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        className="absolute inset-0 grid grid-cols-7 auto-rows-[1fr] overflow-hidden bg-background"
                    >
                        {calendarDays.map((day, dayIdx) => {
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            // Filter assignments for this day
                            const dayAssignments = assignments.filter((a) => {
                                if (!a.due_at) return false;
                                return isSameDay(parseISO(a.due_at.toString()), day);
                            });

                            // Filter calendar events for this day
                            const dayEvents = calendarEvents.filter((e) => {
                                return isSameDay(parseISO(e.start_at), day);
                            });

                            return (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "min-h-0 border-b border-r p-1.5 transition-colors hover:bg-muted/5 flex flex-col gap-1 relative group overflow-hidden",
                                        !isCurrentMonth && "bg-muted/5 text-muted-foreground/30",
                                        isToday && "bg-primary/5",
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

                                    {/* Items Container */}
                                    <div className="flex-1 flex flex-col gap-1 min-h-0 overflow-hidden">
                                        {(() => {
                                            // Combine and sort (optional, but good practice, currently implicit)
                                            // For now just concating as was previous behavior: Assignments first, then Events.
                                            const allItems = [
                                                ...dayAssignments.map(a => ({ type: 'assignment' as const, data: a })),
                                                ...dayEvents.map(e => ({ type: 'event' as const, data: e }))
                                            ];

                                            const LIMIT = 4;
                                            const showMore = allItems.length > LIMIT;
                                            const displayItems = showMore ? allItems.slice(0, 3) : allItems;
                                            const remaining = allItems.length - 3;

                                            return (
                                                <>
                                                    {displayItems.map((item, idx) => {
                                                        if (item.type === 'assignment') {
                                                            const assignment = item.data;
                                                            const style = getClassColor(assignment.class_id);
                                                            return (
                                                                <div
                                                                    key={`assign-${assignment.id}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onAssignmentClick(assignment);
                                                                    }}
                                                                    className="block shrink-0 cursor-pointer"
                                                                >
                                                                    <div
                                                                        className={cn(
                                                                            "text-[10px] px-1.5 py-0.5 rounded-sm border-l-2 truncate font-medium transition-all hover:brightness-95 hover:scale-[1.01]",
                                                                            "bg-background shadow-sm border border-l-4",
                                                                            style.border
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center leading-none">
                                                                            <span className="truncate text-foreground font-medium">
                                                                                {assignment.title}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        } else {
                                                            const event = item.data;
                                                            const style = event.class_id ? getClassColor(event.class_id) : null;
                                                            const isLecture = event.title.startsWith("Lecture:");
                                                            const displayTitle = isLecture && event.class_id ? getClassName(event.class_id) : event.title;
                                                            return (
                                                                <div
                                                                    key={`event-${event.id}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onEventClick(event);
                                                                    }}
                                                                    className={cn(
                                                                        "cursor-pointer text-[10px] px-1.5 py-0.5 rounded-sm border-l-2 font-medium transition-all hover:brightness-95 hover:scale-[1.01] bg-background shadow-sm border border-l-4",
                                                                        style ? style.border : "border-l-violet-500"
                                                                    )}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                >
                                                                    <div className="flex items-center gap-1.5 leading-none">
                                                                        <span className="text-[9px] text-muted-foreground font-medium tabular-nums shrink-0">
                                                                            {format(parseISO(event.start_at), "h:mma")}
                                                                        </span>
                                                                        <span className={cn("truncate text-foreground font-semibold", style ? style.text : "text-violet-700")}>
                                                                            {displayTitle}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    })}

                                                    {showMore && (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <div
                                                                    className="text-[10px] font-medium text-muted-foreground pl-1 hover:text-foreground cursor-pointer transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    + {remaining} more
                                                                </div>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-72 p-2 overflow-x-hidden" align="center" side="bottom" onWheel={(e) => e.stopPropagation()}>
                                                                <div className="space-y-1 max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                                                    <div className="px-2 py-1 mb-1 border-b text-xs font-semibold text-muted-foreground">
                                                                        {format(day, "EEEE, MMMM do")}
                                                                    </div>
                                                                    {allItems.map((item, idx) => {
                                                                        if (item.type === 'assignment') {
                                                                            const assignment = item.data;
                                                                            const style = getClassColor(assignment.class_id);
                                                                            return (
                                                                                <Link
                                                                                    key={`exp-assign-${assignment.id}`}
                                                                                    href={`/dashboard/classes/${assignment.class_id}/assignments/${assignment.id}?from=calendar`}
                                                                                    className="block shrink-0"
                                                                                >
                                                                                    <div
                                                                                        className={cn(
                                                                                            "text-[10px] px-2 py-1.5 rounded-sm border-l-4 font-medium transition-all hover:brightness-95 hover:scale-[1.01]",
                                                                                            "bg-secondary/30",
                                                                                            style.border
                                                                                        )}
                                                                                    >
                                                                                        <div className="flex items-center leading-none">
                                                                                            <span className="text-foreground font-medium truncate">
                                                                                                {assignment.title}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </Link>
                                                                            );
                                                                        } else {
                                                                            const event = item.data;
                                                                            const style = event.class_id ? getClassColor(event.class_id) : null;
                                                                            const isLecture = event.title.startsWith("Lecture:");
                                                                            const displayTitle = isLecture && event.class_id ? getClassName(event.class_id) : event.title;
                                                                            return (
                                                                                <div
                                                                                    key={`exp-event-${event.id}`}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onEventClick(event);
                                                                                    }}
                                                                                    className={cn(
                                                                                        "cursor-pointer text-[10px] px-2 py-1.5 rounded-sm border-l-4 font-medium transition-all hover:brightness-95 hover:scale-[1.01] bg-secondary/30",
                                                                                        style ? style.border : "border-l-violet-500"
                                                                                    )}
                                                                                    role="button"
                                                                                    tabIndex={0}
                                                                                >
                                                                                    <div className="flex items-center gap-2 leading-none">
                                                                                        <span className="text-[8px] text-muted-foreground font-medium shrink-0">
                                                                                            {format(parseISO(event.start_at), "h:mma")}
                                                                                        </span>
                                                                                        <span className={cn("text-foreground font-semibold truncate", style ? style.text : "text-violet-700")}>
                                                                                            {displayTitle}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>


        </div>
    );
}
