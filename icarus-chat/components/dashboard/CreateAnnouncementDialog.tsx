"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is available, or use alert

interface CreateAnnouncementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (title: string, content: string) => Promise<void>;
}

export function CreateAnnouncementDialog({
    open,
    onOpenChange,
    onSubmit,
}: CreateAnnouncementDialogProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() || !title.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(title, content);
            setTitle("");
            setContent("");
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to post announcement", error);
            // toast.error("Failed to post announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Make an Announcement</DialogTitle>
                    <DialogDescription>
                        Share updates, news, or materials with your class.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium leading-none">
                            Title
                        </label>
                        <Input
                            id="title"
                            placeholder="Announcement Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium leading-none">
                            Content
                        </label>
                        <Textarea
                            id="content"
                            placeholder="Announce something to your class..."
                            className="min-h-[150px] resize-none text-base"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!content.trim() || !title.trim() || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            "Post"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
