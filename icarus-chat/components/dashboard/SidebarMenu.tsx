"use client";

import Link from "next/link";
import { Menu, Home, BookOpen, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Class } from "@/app/types/school";
import { getClassStyle } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarMenuProps {
    classes: Class[];
}

export function SidebarMenu({ classes }: SidebarMenuProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] p-0 flex flex-col">
                <div className="border-b">
                    <div className="flex h-24 items-center gap-2 px-6">
                        <SheetTitle className="flex items-center gap-2">
                            <span className="font-bold text-xl">Socratica</span>
                        </SheetTitle>
                    </div>
                </div>
                <div className="flex-1 py-4 flex flex-col min-h-0">
                    <div className="px-3 mb-2 flex-shrink-0">
                        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                            <Link href="/dashboard">
                                <Home className="h-5 w-5" />
                                Home
                            </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                            <Link href="/dashboard/calendar">
                                <Calendar className="h-5 w-5" />
                                Calendar
                            </Link>
                        </Button>
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
                                    >
                                        <Link href={`/dashboard/classes/${c.id}`}>
                                            {/* Removed the colored container, just keeping simple icon or even no icon if preferred, but keeping icon for now as per "not so far to the right" adjustment */}
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
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                        <Link href="/settings">
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
