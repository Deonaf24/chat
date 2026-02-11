"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Paperclip, Loader2, Sparkles } from "lucide-react";
import { Material, Concept } from "@/app/types/school";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MaterialCardProps {
    material: Material;
    onAnalyze: () => Promise<void>;
    availableConcepts: Concept[];
}

export function MaterialCard({ material, onAnalyze, availableConcepts }: MaterialCardProps) {
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            await onAnalyze();
        } finally {
            setAnalyzing(false);
        }
    };

    const materialConcepts = material.concept_ids?.map(id => availableConcepts.find(c => c.id === id)).filter(Boolean) || [];

    return (
        <Card className="border-l-4 border-l-purple-500 flex flex-col h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base truncate" title={material.title}>{material.title}</CardTitle>
                    {material.file_ids && material.file_ids.length > 0 && <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />}
                </div>
                <CardDescription className="text-xs">
                    {format(new Date(material.created_at), "MMM d, yyyy")}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                {material.description && <p className="text-sm line-clamp-2 text-muted-foreground mb-4">{material.description}</p>}
                {!material.description && <p className="text-sm italic text-muted-foreground mb-4">No description</p>}

                {materialConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {materialConcepts.map(c => (
                            <Badge key={c!.id} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                {c!.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
            <div className="p-4 pt-0 mt-auto flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-primary"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                >
                    {analyzing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                    {materialConcepts.length > 0 ? "Re-analyze" : "Analyze AI"}
                </Button>
            </div>
        </Card>
    );
}
