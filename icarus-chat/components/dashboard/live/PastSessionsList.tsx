"use client";

import { format } from "date-fns";
import { History, HelpCircle, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LiveSessionSummary } from "@/app/types/live";

interface PastSessionsListProps {
    sessions: LiveSessionSummary[];
    onSelect: (sessionId: number) => void;
}

export function PastSessionsList({ sessions, onSelect }: PastSessionsListProps) {
    if (sessions.length === 0) return null;

    return (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Past Sessions</h3>
            </div>
            <div className="grid gap-3">
                {sessions.map((session) => (
                    <Card
                        key={session.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onSelect(session.id)}
                    >
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="font-medium">
                                        {format(new Date(session.created_at), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <HelpCircle className="h-3 w-3" />
                                            {session.question_count} questions
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {session.participant_count} students
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
