"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssignmentRead, FileRead } from "@/app/types/school";
import { format } from "date-fns";
import { Paperclip, Settings } from "lucide-react";
import { EditAssignmentDialog } from "./EditAssignmentDialog";

interface AssignmentDetailsViewProps {
    assignment: AssignmentRead;
    files: FileRead[];
    onUpdate?: () => void;
}

export function AssignmentDetailsView({ assignment, files, onUpdate }: AssignmentDetailsViewProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                        <CardDescription>
                            Due {assignment.due_at ? format(new Date(assignment.due_at), "PPP p") : "No due date"}
                            <span className="mx-2">•</span>
                            Level {assignment.level || 1}
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-base leading-relaxed">
                            {assignment.description || "No description provided."}
                        </p>
                    </div>

                    {/* Placeholder for attachments */}
                    {assignment.file_ids && assignment.file_ids.length > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Attachments</h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {files.map((file) => (
                                    <div key={file.id} className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
                                        <div className="h-8 w-8 rounded bg-background flex items-center justify-center border shadow-sm">
                                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{file.filename}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                </CardContent>
            </Card>

            <EditAssignmentDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                assignment={assignment}
                onAssignmentUpdated={(updated) => {
                    setIsEditOpen(false);
                    onUpdate?.();
                }}
            />
        </div>
    );
}
