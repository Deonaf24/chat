"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Megaphone, BarChart2, FileText, MoreVertical, Paperclip } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Announcement, Poll, AssignmentRead, Material } from "@/app/types/school";

import { useClassContext } from "@/app/dashboard/classes/[id]/context";

type StreamItem =
    | { type: 'assignment'; data: AssignmentRead; date: string }
    | { type: 'announcement'; data: Announcement; date: string }
    | { type: 'poll'; data: Poll; date: string }
    | { type: 'material'; data: Material; date: string };

export function StreamFeed({ classNameLabel }: { classNameLabel?: string }) {
    const { assignments, announcements, polls, materials } = useClassContext();

    const feedItems = useMemo(() => {
        const items: StreamItem[] = [];

        assignments.forEach(a => {
            items.push({ type: 'assignment', data: a, date: a.created_at ? new Date(a.created_at).toISOString() : new Date().toISOString() });
        });

        announcements.forEach(a => {
            items.push({ type: 'announcement', data: a, date: a.created_at });
        });

        polls.forEach(p => {
            items.push({ type: 'poll', data: p, date: p.created_at });
        });

        if (materials) {
            materials.forEach(m => {
                items.push({ type: 'material', data: m, date: m.created_at });
            });
        }

        // Sort descending by date
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [assignments, announcements, polls, materials]);

    if (feedItems.length === 0) {
        return (
            <Card>
                <CardContent className="h-40 flex items-center justify-center text-muted-foreground italic">
                    No recent activity in this class.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {feedItems.map((item) => {
                if (item.type === 'assignment') {
                    return <StreamAssignmentCard key={`assign-${item.data.id}`} assignment={item.data} />;
                } else if (item.type === 'announcement') {
                    return <StreamAnnouncementCard key={`announce-${item.data.id}`} announcement={item.data} />;
                } else if (item.type === 'material') {
                    return <StreamMaterialCard key={`mat-${item.data.id}`} material={item.data} />;
                } else {
                    return <StreamPollCard key={`poll-${item.data.id}`} poll={item.data} />;
                }
            })}
        </div>
    );
}

function StreamAssignmentCard({ assignment }: { assignment: AssignmentRead }) {
    return (
        <Card className="border-l-4 border-l-blue-500 relative group">
            <Link
                href={`/dashboard/classes/${assignment.class_id}/assignments/${assignment.id}`}
                className="absolute inset-0 z-10"
            >
                <span className="sr-only">View Assignment</span>
            </Link>

            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-20 pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">
                            Teacher posted a new assignment: {assignment.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {assignment.created_at ? format(new Date(assignment.created_at), "MMM d, yyyy") : 'Just now'}
                        </CardDescription>
                    </div>
                </div>
                <div className="relative z-30 pointer-events-auto">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="relative z-0">
                {assignment.due_at && (
                    <div className="text-sm text-muted-foreground mt-1">
                        Due {format(new Date(assignment.due_at), "MMM d")}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StreamAnnouncementCard({ announcement }: { announcement: Announcement }) {
    return (
        <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Megaphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">
                            {announcement.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {format(new Date(announcement.created_at), "MMM d, yyyy")}
                        </CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
            </CardContent>
        </Card>
    );
}

function StreamPollCard({ poll }: { poll: Poll }) {
    return (
        <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <BarChart2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">
                            {poll.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {format(new Date(poll.created_at), "MMM d, yyyy")}
                        </CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {poll.description && (
                    <p className="text-sm text-muted-foreground">{poll.description}</p>
                )}
                <div className="space-y-3 pt-2">
                    <div className="font-medium text-sm">{poll.question}</div>
                    <div className="space-y-2">
                        {poll.options.map((option) => (
                            <div key={option.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer group">
                                <span className="text-sm">{option.text}</span>
                                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">0 votes</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function StreamMaterialCard({ material }: { material: Material }) {
    return (
        <Card className="border-l-4 border-l-purple-500 relative group">
            <Link
                href={`/dashboard/classes/${material.class_id}/materials`}
                className="absolute inset-0 z-10"
            >
                <span className="sr-only">View Material</span>
            </Link>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-20 pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <Paperclip className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">
                            Teacher posted a new material: {material.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {format(new Date(material.created_at), "MMM d, yyyy")}
                        </CardDescription>
                    </div>
                </div>
                <div className="relative z-30 pointer-events-auto">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="relative z-0">
                {material.description && <p className="text-sm mb-4">{material.description}</p>}
                {material.file_ids && material.file_ids.length > 0 && (
                    <div className="flex items-center gap-2 p-2 border rounded bg-muted/20">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Attachment(s) available</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
