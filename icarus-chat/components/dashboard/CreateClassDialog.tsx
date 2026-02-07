"use client";

import { useState } from "react";
import { Loader2, Plus, Trash, Clock, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClass } from "@/app/lib/api/school";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { LectureCreate } from "@/app/types/school";

interface CreateClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export function CreateClassDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateClassDialogProps) {
    const { teacher } = useDashboardAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [lectures, setLectures] = useState<LectureCreate[]>([]);

    // New Lecture State
    const [newLectureDay, setNewLectureDay] = useState("0");
    const [newLectureTime, setNewLectureTime] = useState("10:00");
    const [newLectureDuration, setNewLectureDuration] = useState("60");

    const resetForm = () => {
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setLectures([]);
        setNewLectureDay("0");
        setNewLectureTime("10:00");
        setNewLectureDuration("60");
        setError(null);
    };

    const handleAddLecture = () => {
        setLectures([
            ...lectures,
            {
                day_of_week: parseInt(newLectureDay),
                start_time: newLectureTime,
                duration_minutes: parseInt(newLectureDuration),
            },
        ]);
    };

    const handleRemoveLecture = (index: number) => {
        setLectures(lectures.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacher) return;
        if (!name) {
            setError("Class name is required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await createClass({
                name,
                description,
                join_code: "", // handled by backend
                teacher_id: teacher.id, // backend infers or we pass it
                start_date: startDate ? startDate : undefined,
                end_date: endDate ? endDate : undefined,
                lectures: lectures,
            });

            resetForm();
            onOpenChange(false);
            onSuccess?.();
        } catch (err: unknown) {
            console.error("Failed to create class:", err);
            let message = "Failed to create class. Please try again.";
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response: { data: { detail: string } } };
                if (axiosError.response?.data?.detail) {
                    message = axiosError.response.data.detail;
                }
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Class</DialogTitle>
                        <DialogDescription>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                                {error}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Class Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Physics 101"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief summary of the class..."
                                className="resize-none"
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <div className="relative">
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="pl-3"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <div className="relative">
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="pl-3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lectures */}
                        <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Weekly Lectures</Label>

                                </div>
                            </div>

                            {lectures.length > 0 && (
                                <div className="grid gap-2">
                                    {lectures.map((lecture, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{DAYS[lecture.day_of_week]}</span>
                                                <span className="text-muted-foreground">
                                                    @ {lecture.start_time} ({lecture.duration_minutes}m)
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveLecture(i)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-end gap-2">
                                <div className="grid gap-1.5 flex-1">
                                    <Label className="text-xs">Day</Label>
                                    <Select value={newLectureDay} onValueChange={setNewLectureDay}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map((day, i) => (
                                                <SelectItem key={i} value={i.toString()}>
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-1.5 w-[100px]">
                                    <Label className="text-xs">Time</Label>
                                    <Input
                                        type="time"
                                        className="h-9"
                                        value={newLectureTime}
                                        onChange={e => setNewLectureTime(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-1.5 w-[80px]">
                                    <Label className="text-xs">Mins</Label>
                                    <Input
                                        type="number"
                                        className="h-9"
                                        value={newLectureDuration}
                                        onChange={(e) => setNewLectureDuration(e.target.value)}
                                        min={15}
                                        step={15}
                                    />
                                </div>

                                <Button type="button" size="sm" variant="secondary" onClick={handleAddLecture} className="h-9">
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Class
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
