"use client";

import { createContext, useContext, ReactNode } from "react";
import { useClassData } from "@/app/hooks/dashboard/useClassData";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { User } from "@/app/types/auth";
import { StudentRead, TeacherRead, AssignmentRead } from "@/app/types/school";

// Define the shape of our context
interface ClassContextType {
    classId: number;
    isTeacher: boolean;
    currentUserId?: number;

    // Data from useClassData
    announcements: ReturnType<typeof useClassData>['announcements'];
    polls: ReturnType<typeof useClassData>['polls'];
    materials: ReturnType<typeof useClassData>['materials'];
    chapters: ReturnType<typeof useClassData>['chapters'];
    availableConcepts: ReturnType<typeof useClassData>['availableConcepts'];
    expandedChapters: ReturnType<typeof useClassData>['expandedChapters'];
    setExpandedChapters: ReturnType<typeof useClassData>['setExpandedChapters'];
    refreshAnnouncements: ReturnType<typeof useClassData>['refreshAnnouncements'];
    refreshPolls: ReturnType<typeof useClassData>['refreshPolls'];
    refreshMaterials: ReturnType<typeof useClassData>['refreshMaterials'];

    // Data from useDashboardData (filtered for this class)
    students: StudentRead[];
    teachers: TeacherRead[];
    assignments: AssignmentRead[];
    usersById: Record<number, User>;
}

const ClassContext = createContext<ClassContextType | null>(null);

export function useClassContext() {
    const context = useContext(ClassContext);
    if (!context) {
        throw new Error("useClassContext must be used within a ClassProvider");
    }
    return context;
}

interface ClassProviderProps {
    classId: number;
    isTeacher: boolean;
    currentUserId?: number;
    children: ReactNode;

    // We pass these in so the Page can manage the hooks and just pass results down
    classData: ReturnType<typeof useClassData>;
    dashboardData: {
        students: StudentRead[];
        teachers: TeacherRead[];
        assignments: AssignmentRead[];
        usersById: Record<number, User>;
    };
}

export function ClassProvider({
    classId,
    isTeacher,
    currentUserId,
    children,
    classData,
    dashboardData
}: ClassProviderProps) {

    const value: ClassContextType = {
        classId,
        isTeacher,
        currentUserId,
        ...classData,
        ...dashboardData
    };

    return (
        <ClassContext.Provider value={value}>
            {children}
        </ClassContext.Provider>
    );
}
