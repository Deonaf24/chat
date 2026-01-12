"use client";

import { useState } from "react";
import { Plus, FileText, Megaphone, BarChart2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreationMenuProps {
    onCreateAssignment: () => void;
    onCreateAnnouncement: () => void;
    onCreatePoll: () => void;
    onCreateMaterial?: () => void;
}

export function CreationMenu({
    onCreateAssignment,
    onCreateAnnouncement,
    onCreatePoll,
    onCreateMaterial,
}: CreationMenuProps) {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onCreateAssignment} className="cursor-pointer gap-2">
                    <FileText className="h-4 w-4" />
                    Assignment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreateMaterial} className="cursor-pointer gap-2">
                    <Paperclip className="h-4 w-4" />
                    Material
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreateAnnouncement} className="cursor-pointer gap-2">
                    <Megaphone className="h-4 w-4" />
                    Announcement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreatePoll} className="cursor-pointer gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Poll
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
