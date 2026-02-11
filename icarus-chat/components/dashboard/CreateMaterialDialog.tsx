import { useState } from "react";
import { Loader2, Upload, Check, X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Concept } from "@/app/types/school";
import { cn } from "@/lib/utils";

interface CreateMaterialDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (title: string, description: string, file: File | null, conceptIds: number[]) => Promise<void>;
    availableConcepts?: Concept[];
}

export function CreateMaterialDialog({ open, onOpenChange, onSubmit, availableConcepts = [] }: CreateMaterialDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([]);
    const [openCombobox, setOpenCombobox] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSubmitting(true);
        try {
            await onSubmit(title, description, file, selectedConceptIds);
            // Reset form
            setTitle("");
            setDescription("");
            setFile(null);
            setSelectedConceptIds([]);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleConcept = (id: number) => {
        setSelectedConceptIds((current) =>
            current.includes(id)
                ? current.filter((cId) => cId !== id)
                : [...current, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Material</DialogTitle>
                    <DialogDescription>
                        Share resources like slides, notes, or documents with your class.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="material-title">Title</Label>
                        <Input
                            id="material-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Week 1 Lecture Slides"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="material-desc">Description (Optional)</Label>
                        <Textarea
                            id="material-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details about this material..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Concepts (Optional)</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedConceptIds.map(id => {
                                const concept = availableConcepts.find(c => c.id === id);
                                if (!concept) return null;
                                return (
                                    <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => toggleConcept(id)}>
                                        {concept.name}
                                        <X className="ml-1 h-3 w-3" />
                                    </Badge>
                                );
                            })}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 border-dashed"
                                onClick={() => setOpenCombobox(!openCombobox)}
                            >
                                <Plus className="mr-1 h-3 w-3" />
                                Add Concept
                            </Button>
                        </div>

                        {openCombobox && (
                            <div className="border rounded-md mt-2">
                                <Command className="h-[200px]">
                                    <CommandInput placeholder="Search concepts..." />
                                    <CommandList>
                                        <CommandEmpty>No concept found.</CommandEmpty>
                                        <CommandGroup heading="Suggestions">
                                            {availableConcepts.map((concept) => (
                                                <CommandItem
                                                    key={concept.id}
                                                    value={concept.name}
                                                    onSelect={() => {
                                                        toggleConcept(concept.id);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedConceptIds.includes(concept.id) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {concept.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Attachment</Label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-muted-foreground"
                                onClick={() => document.getElementById("material-file-upload")?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {file ? file.name : "Upload file"}
                            </Button>
                            <input
                                id="material-file-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setFile(f);
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting || !title.trim()}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
