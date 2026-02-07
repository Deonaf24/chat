"use client";

import Link from "next/link";
import { Home, BookOpen, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Class } from "@/app/types/school";
import { getClassStyle } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarContentProps {
    classes: Class[];
    role?: 'teacher' | 'student';
    className?: string;
    onNavigate?: () => void; // Optional callback to close sheet on mobile
}

export function SidebarContent({ classes, role, className, onNavigate }: SidebarContentProps) {
    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            <div className="flex-1 py-4 flex flex-col min-h-0">
                <div className="px-3 mb-2 flex-shrink-0">
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild onClick={onNavigate}>
                        <Link href="/dashboard">
                            <Home className="h-5 w-5" />
                            Home
                        </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild onClick={onNavigate}>
                        <Link href="/dashboard/calendar">
                            <Calendar className="h-5 w-5" />
                            Calendar
                        </Link>
                    </Button>

                    {/* Planner Link */}
                    {(role === 'teacher' || role === 'student') && (
                        <Button variant="ghost" className="w-full justify-start gap-2" asChild onClick={onNavigate}>
                            <Link href="/dashboard/planner">
                                <BookOpen className="h-5 w-5" />
                                {role === 'teacher' ? 'Lesson Planner' : 'Study Planner'}
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="px-6 py-2 flex-shrink-0">
                    <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-2">
                        Classes
                    </h3>
                </div>

                <ScrollArea className="flex-1 px-3">
                    <div className="space-y-1">
                        {classes.map((c, index) => {
                            const style = getClassStyle(index);
                            return (
                                <Button
                                    key={c.id}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 px-3 h-10 rounded-r-md rounded-l-none border-l-4 hover:bg-muted/10", // Left border band
                                        style.border
                                    )}
                                    asChild
                                    onClick={onNavigate}
                                >
                                    <Link href={`/dashboard/classes/${c.id}`}>
                                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />

                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="truncate w-full text-sm font-medium text-foreground">
                                                {c.name}
                                            </span>
                                        </div>
                                    </Link>
                                </Button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>

            <div className="border-t p-4 mt-auto">
                <Button variant="ghost" className="w-full justify-start gap-2" asChild onClick={onNavigate}>
                    <Link href="/settings">
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </Button>
            </div>
        </div>
    );
}
