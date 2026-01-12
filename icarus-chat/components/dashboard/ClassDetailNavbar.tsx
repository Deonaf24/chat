"use client";

import { Plus } from "lucide-react";
import { Class } from "@/app/types/school";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { CreationMenu } from "./CreationMenu";
import { SidebarMenu } from "./SidebarMenu";

interface ClassDetailNavbarProps {
    className: string;
    classes: Class[];
    activeTab: string;
    onTabChange: (value: string) => void;
    onCreateAssignment?: () => void;
    onCreateAnnouncement?: () => void;
    onCreatePoll?: () => void;
    onCreateMaterial?: () => void;
    hideTabs?: boolean;
}

export function ClassDetailNavbar({
    className,
    classes,
    activeTab,
    onTabChange,
    onCreateAssignment,
    onCreateAnnouncement,
    onCreatePoll,
    onCreateMaterial,
    hideTabs,
}: ClassDetailNavbarProps) {
    return (
        <div
            className={cn(
                "fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                "shadow-sm"
            )}
            style={{ paddingRight: 'var(--removed-body-scroll-bar-size)' }}
        >
            <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 z-10">
                    <SidebarMenu classes={classes} />
                    <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {className}
                    </span>
                </div>

                {!hideTabs && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
                        <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
                            <TabsList className="bg-transparent h-10 p-0">
                                <TabsTrigger
                                    value="stream"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
                                >
                                    Stream
                                </TabsTrigger>
                                <TabsTrigger
                                    value="classwork"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
                                >
                                    Classwork
                                </TabsTrigger>
                                <TabsTrigger
                                    value="materials"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
                                >
                                    Materials
                                </TabsTrigger>
                                <TabsTrigger
                                    value="people"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
                                >
                                    People
                                </TabsTrigger>

                                <TabsTrigger
                                    value="analytics"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
                                >
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger
                                    value="live"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4 text-rose-500 hover:text-rose-600 data-[state=active]:text-rose-600 data-[state=active]:border-rose-500"
                                >
                                    Live
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                )}

                <div className="flex items-center gap-2 z-10 ml-auto bg-transparent">
                    {onCreateAssignment && onCreateAnnouncement && onCreatePoll && (
                        <CreationMenu
                            onCreateAssignment={onCreateAssignment}
                            onCreateAnnouncement={onCreateAnnouncement}
                            onCreatePoll={onCreatePoll}
                            onCreateMaterial={onCreateMaterial}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
