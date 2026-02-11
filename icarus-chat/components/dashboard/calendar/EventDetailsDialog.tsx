"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarEvent } from "@/app/lib/api/calendar";
import { format, parseISO } from "date-fns";
import { CalendarDays, Clock, AlignLeft, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventDetailsDialogProps {
    event: CalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (eventId: number) => Promise<void>;
    getClassName?: (classId: number) => string;
}

export function EventDetailsDialog({ event, isOpen, onClose, onDelete, getClassName }: EventDetailsDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!event) return null;

    const start = parseISO(event.start_at);
    const end = parseISO(event.end_at);

    // Lecture Detection logic
    const isLecture = event.title.startsWith("Lecture:") && event.class_id;
    const displayTitle = isLecture && getClassName && event.class_id ? getClassName(event.class_id) : event.title;
    const label = isLecture ? "Lecture" : "Study Task";
    const labelColor = isLecture ? "bg-blue-500" : "bg-violet-500";
    const textColor = isLecture ? "text-blue-600" : "text-violet-600";

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(event.id);
            // Dialog closure is handled by parent or useEffect, but here we can call onClose if successful.
            // Ideally parent updates state which closes dialog or re-renders.
            // But if we unmount, state update warning might occur.
            // We'll rely on onClose being safe.
        } catch (e) {
            console.error(e);
            setIsDeleting(false); // Only reset if failed
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={cn("h-6 w-1 rounded-full", labelColor)} />
                        <span className={cn("text-xs font-semibold uppercase tracking-wider", textColor)}>{label}</span>
                    </div>
                    <DialogTitle className="text-xl leading-tight">{displayTitle}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Time Info */}
                    <div className="flex items-start gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="grid gap-0.5">
                            <div className="font-medium text-foreground">
                                {format(start, "EEEE, MMMM d")}
                            </div>
                            <div className="text-muted-foreground">
                                {format(start, "h:mm a")} - {format(end, "h:mm a")}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div className="flex items-start gap-3 text-sm mt-2">
                            <AlignLeft className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                {event.description}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between items-center sm:flex-row flex-col-reverse">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="w-full sm:w-auto flex items-center gap-2"
                        disabled={isDeleting}
                        size="sm"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                    </Button>
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={isDeleting} size="sm">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
