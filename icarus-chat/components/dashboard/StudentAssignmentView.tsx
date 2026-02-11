import { useState } from "react";
import { format } from "date-fns";
import { Upload, X, FileText, Loader2, MessageCircle, AlertCircle, CheckCircle, File as FileIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AssignmentRead, FileRead } from "@/app/types/school";
import { getFilePreviewUrl } from "@/app/lib/api/school";

interface StudentAssignmentViewProps {
    assignment: AssignmentRead;
    files: FileRead[];
}

export function StudentAssignmentView({ assignment, files }: StudentAssignmentViewProps) {
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derive status from prop
    const submission = assignment.submission;
    const isSubmitted = submission?.status === "TURNED_IN" || submission?.status === "RETURNED";
    const grade = submission?.grade;

    // Mock date for now if not in payload (we didn't add timestamp to StudentAssignment model yet)
    const [submittedDate, setSubmittedDate] = useState<Date | null>(isSubmitted ? new Date() : null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSubmissionFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!submissionFile) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);
        setSubmittedDate(new Date());
        toast.success("Assignment submitted successfully!");
    };

    const handleUnsubmit = () => {
        if (confirm("Are you sure you want to unsubmit? This will allow you to upload a new file.")) {
            setIsSubmitted(false);
            setSubmittedDate(null);
            setSubmissionFile(null);
            toast.info("Submission withdrawn.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">
                                    Due {assignment.due_at ? format(new Date(assignment.due_at), "PPP p") : "No due date"}
                                </span>
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" variant="default" className="gap-2">
                            <Link href={`/chat/assignments/${assignment.id}`}>
                                <MessageCircle className="h-4 w-4" />
                                Chat with AI
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                {assignment.description || "No instructions provided."}
                            </p>
                        </div>

                        {files.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium">Attachments</h3>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {files.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.url || `${process.env.NEXT_PUBLIC_API_URL}/school/files/${file.id}/download`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                                        >
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <FileIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.filename}</p>
                                                <p className="text-xs text-muted-foreground">Click to view</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Your Work</CardTitle>
                            {isSubmitted ? (
                                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25 border-0">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Submitted
                                </Badge>
                            ) : (
                                <Badge variant="secondary">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Assigned
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isSubmitted ? (
                            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                                <div className="flex items-start gap-3">
                                    <FileIcon className="w-8 h-8 text-primary/50" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {submissionFile?.name || "submission.pdf"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Submitted {submittedDate ? format(submittedDate, "MMM d, h:mm a") : "previously"}
                                        </p>
                                        {grade !== undefined && grade !== null && (
                                            <p className="text-sm font-medium text-primary mt-1">
                                                Grade: {grade}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative"
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {submissionFile ? (
                                    <>
                                        <FileIcon className="h-8 w-8 text-primary mb-2" />
                                        <p className="text-sm font-medium">{submissionFile.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Add or create</p>
                                        <p className="text-xs text-muted-foreground mt-1">Upload a file for your submission</p>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {isSubmitted ? (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleUnsubmit}
                            >
                                Unsubmit
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                onClick={handleSubmit}
                                disabled={!submissionFile || isSubmitting}
                            >
                                {isSubmitting ? "Turning in..." : "Turn in"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
