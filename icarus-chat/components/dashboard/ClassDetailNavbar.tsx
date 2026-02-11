"use client";

import { Plus, ChevronRight } from "lucide-react";
import { Class } from "@/app/types/school";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { CreationMenu } from "./CreationMenu";
import { SidebarMenu } from "./SidebarMenu";
import LaunchUI from "../logos/launch-ui";

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
    role?: 'teacher' | 'student';
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
    role,
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
                <div className="flex items-center gap-2 sm:gap-4 z-10">
                    <SidebarMenu classes={classes} role={role} />
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
                            <span className="font-bold text-lg sm:text-xl hidden sm:block text-foreground">Socratica</span>
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-foreground truncate max-w-[100px] sm:max-w-[200px]">
                            {className}
                        </span>
                    </div>
                </div>

                {!hideTabs && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
                        <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
                            <TabsList className="bg-transparent h-10 p-0">
                                <TabsTrigger
                                    value="analytics"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
                                >
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger
                                    value="classwork"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
                                >
                                    Classwork
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
