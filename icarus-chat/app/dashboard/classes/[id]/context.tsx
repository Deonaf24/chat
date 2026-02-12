"use client";

import { createContext, useContext, ReactNode } from "react";
import { User, Student, Teacher, Assignment, Class } from "@/app/types/auth";

// Define the shape of the context
interface ClassContextType {
    classId: number;
    isTeacher: boolean;
    currentUserId?: number;
    classData: any; // We can refine this type if we look at useClassData hook
    dashboardData: {
        students: Student[];
        teachers: Teacher[];
        assignments: Assignment[];
        usersById: Record<number, User>;
    };
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps extends ClassContextType {
    children: ReactNode;
}

export function ClassProvider({
    children,
    classId,
    isTeacher,
    currentUserId,
    classData,
    dashboardData
}: ClassProviderProps) {
    return (
        <ClassContext.Provider value={{
            classId,
            isTeacher,
            currentUserId,
            classData,
            dashboardData
        }}>
            {children}
        </ClassContext.Provider>
    );
}

export function useClassContext() {
    const context = useContext(ClassContext);
    if (context === undefined) {
        throw new Error("useClassContext must be used within a ClassProvider");
    }
    return context;
}
