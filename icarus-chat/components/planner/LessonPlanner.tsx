"use client";

import { useState } from "react";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { PlannerSidebar } from "./PlannerSidebar";
import { LessonEditor } from "./LessonEditor";
import { PlannerCalendar } from "./PlannerCalendar";

export function LessonPlanner() {
    const { user, teacher, student } = useDashboardAuth();
    const { classes } = useDashboardData(user, teacher, student);

    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [currentView, setCurrentView] = useState<'calendar' | 'editor'>('calendar');

    const selectedCourse = classes.find(c => String(c.id) === selectedClassId);

    return (
        <div className="flex h-[calc(100vh-4rem)] -m-6 bg-background">
            {/* Left Sidebar */}
            <PlannerSidebar
                classes={classes}
                selectedClassId={selectedClassId}
                onClassChange={setSelectedClassId}
                currentView={currentView}
                onViewChange={setCurrentView}
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-6">
                {currentView === 'calendar' ? (
                    <PlannerCalendar />
                ) : (
                    <LessonEditor
                        course={selectedCourse}
                        selectedClassId={selectedClassId}
                        onReset={() => {
                            // Optional: Reset logic if needed, currently handled inside editor
                        }}
                    />
                )}
            </div>
        </div>
    );
}
