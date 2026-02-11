"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Settings, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Class } from "@/app/types/dashboard";

interface PlannerSidebarProps {
    classes: Class[];
    selectedClassId: string;
    onClassChange: (id: string) => void;
    currentView: 'calendar' | 'editor';
    onViewChange: (view: 'calendar' | 'editor') => void;
}

export function PlannerSidebar({
    classes,
    selectedClassId,
    onClassChange,
    currentView,
    onViewChange
}: PlannerSidebarProps) {
    return (
        <div className="w-64 border-r bg-muted/10 h-full p-4 flex flex-col gap-6">
            <div className="space-y-2">
                <h2 className="font-semibold px-2">Class Context</h2>
                <Select value={selectedClassId} onValueChange={onClassChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map((cls) => (
                            <SelectItem key={cls.id} value={String(cls.id)}>
                                {cls.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Button
                    variant={currentView === 'calendar' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onViewChange('calendar')}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar
                </Button>
                <Button
                    variant={currentView === 'editor' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onViewChange('editor')}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Lesson
                </Button>
            </div>

            <div className="mt-auto pt-6 border-t space-y-1">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Curriculum
                </Button>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Button>
            </div>
        </div>
    );
}
