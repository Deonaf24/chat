"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export function PlannerCalendar() {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Schedule</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="font-medium">February 2026</div>
                    <Button variant="outline" size="icon">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="h-[600px] flex items-center justify-center text-muted-foreground border-dashed">
                <CardContent className="flex flex-col items-center gap-4">
                    <CalendarIcon className="h-12 w-12 opacity-20" />
                    <div className="text-center space-y-1">
                        <p className="font-medium">No lessons scheduled</p>
                        <p className="text-sm">Generated lessons will appear here.</p>
                    </div>
                    <Button variant="secondary" className="mt-4">
                        Sync with Calendar
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
