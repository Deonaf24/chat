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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";

interface CreatePollDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (title: string, description: string, question: string, options: string[]) => Promise<void>;
}

export function CreatePollDialog({
    open,
    onOpenChange,
    onSubmit,
}: CreatePollDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]); // Start with 2 empty options
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return; // Minimum 2 options
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const isValid = question.trim() && options.every(opt => opt.trim().length > 0) && options.length >= 2 && title.trim();

    const handleSubmit = async () => {
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            await onSubmit(title, description, question, options);
            setTitle("");
            setDescription("");
            setQuestion("");
            setOptions(["", ""]);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create poll", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create a Poll</DialogTitle>
                    <DialogDescription>
                        Ask a question and let your students vote.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Poll Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="Add context..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="question">Question</Label>
                        <Input
                            id="question"
                            placeholder="What would you like to ask?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Options</Label>
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                />
                                {options.length > 2 && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(index)} className="shrink-0 h-10 w-10">
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={handleAddOption} className="mt-1">
                            <Plus className="h-3.5 w-3.5 mr-2" />
                            Add Option
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Post Poll"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
