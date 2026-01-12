"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Class } from "@/app/types/school";

interface AssignmentDetailNavbarProps {
    className?: string; // Used for the assignment title
    classes?: Class[];
    activeTab: string;
    onTabChange: (value: string) => void;
    classId: number;
    hideTabs?: boolean;
}

export function AssignmentDetailNavbar({
    className,
    classes = [],
    activeTab,
    onTabChange,
    classId,
    hideTabs,
}: AssignmentDetailNavbarProps) {

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
                    <Button variant="ghost" size="icon" asChild className="mr-2">
                        <Link href={`/dashboard/classes/${classId}`}>
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Back to Class</span>
                        </Link>
                    </Button>

                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold leading-none tracking-tight truncate max-w-[300px]">
                            {className}
                        </h1>
                        <p className="text-sm text-muted-foreground">Assignment View</p>
                    </div>
                </div>

                {/* Centered Tabs - Absolute Positioned */}
                {!hideTabs && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
                        <Tabs value={activeTab} onValueChange={onTabChange}>
                            <TabsList className="bg-muted/50 p-1 grid grid-cols-4">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="structure">Structure</TabsTrigger>
                                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                )}

                <div className="flex items-center gap-4 z-10 w-[200px] justify-end">
                    {/* Placeholder for future actions like Edit */}
                </div>
            </div>

            {/* Mobile Tab List */}
            {!hideTabs && (
                <div className="md:hidden border-t bg-background">
                    <div className="flex overflow-x-auto py-2 px-4 no-scrollbar">
                        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                            <TabsList className="bg-muted/50 p-1 flex w-full">
                                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                                <TabsTrigger value="structure" className="flex-1">Structure</TabsTrigger>
                                <TabsTrigger value="submissions" className="flex-1">Submissions</TabsTrigger>
                                <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            )}
        </header>
    );
}
