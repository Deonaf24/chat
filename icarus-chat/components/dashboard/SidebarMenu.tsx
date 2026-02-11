"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Class } from "@/app/types/school";
import { SidebarContent } from "./SidebarContent";

interface SidebarMenuProps {
    classes: Class[];
    role?: 'teacher' | 'student';
}

export function SidebarMenu({ classes, role }: SidebarMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
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

                <SidebarContent
                    classes={classes}
                    role={role}
                    onNavigate={() => setOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
