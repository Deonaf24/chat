"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { Class } from "@/app/types/school";

interface StudentDetailNavbarProps {
    className?: string; // Used for the student name or title
    classes?: Class[];
    activeTab: string;
    onTabChange: (value: string) => void;
    classId: number;
    role?: 'teacher' | 'student';
}

export function StudentDetailNavbar({
    className,
    classes = [],
    activeTab,
    onTabChange,
    classId,
    role,
}: StudentDetailNavbarProps) {

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                "shadow-sm"
            )}
            style={{ paddingRight: 'var(--removed-body-scroll-bar-size)' }}
        >
            <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 z-10">
                    <SidebarMenu classes={classes} role={role} />
                    <Button variant="ghost" size="icon" asChild className="mr-2">
                        <Link href={`/dashboard/classes/${classId}`}>
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Back to Class</span>
                        </Link>
                    </Button>

                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold leading-none tracking-tight">
                            {className}
                        </h1>
                        <p className="text-sm text-muted-foreground">Student View</p>
                    </div>
                </div>

                {/* Centered Tabs - Absolute Positioned */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Tabs value={activeTab} onValueChange={onTabChange}>
                        <TabsList className="hidden grid-cols-4 bg-muted/50 p-1 md:grid">
                            <TabsTrigger value="submissions">Submissions</TabsTrigger>
                            <TabsTrigger value="grades">Grades</TabsTrigger>
                            <TabsTrigger value="chats">Chats</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex items-center gap-4 z-10 w-[200px] justify-end">
                    {/* Placeholder for future actions */}
                </div>
            </div>

            {/* Mobile Tab List (Visible only on small screens) */}
            <div className="md:hidden border-t bg-background">
                <div className="flex overflow-x-auto py-2 px-4 no-scrollbar">
                    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                        <TabsList className="bg-muted/50 p-1 flex w-full">
                            <TabsTrigger value="submissions" className="flex-1">Submissions</TabsTrigger>
                            <TabsTrigger value="grades" className="flex-1">Grades</TabsTrigger>
                            <TabsTrigger value="chats" className="flex-1">Chats</TabsTrigger>
                            <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>
        </header>
    );
}
