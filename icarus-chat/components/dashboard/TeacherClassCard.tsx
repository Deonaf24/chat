import { Users, BookOpen } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassRead } from "@/app/types/school";
import { cn } from "@/lib/utils";

interface TeacherClassCardProps {
    classItem: ClassRead;
    studentCount: number;
    assignmentCount: number;
    onClick: () => void;
    theme: {
        gradient: string;
        overlay: string;
    };
}

export function TeacherClassCard({ classItem, studentCount, assignmentCount, onClick, theme }: TeacherClassCardProps) {
    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border-none",
                "flex flex-col h-[200px]"
            )}
            onClick={onClick}
        >
            {/* Decorative Gradient Background */}
            <div className={cn("absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity bg-gradient-to-br", theme.gradient)} />



            <CardHeader className="pb-2 z-10">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold tracking-tight">{classItem.name}</CardTitle>
                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                        Active
                    </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                    {classItem.description || "No description provided."}
                </CardDescription>
            </CardHeader>

            <CardContent className="z-10 mt-auto pb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{studentCount} Students</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        <span>{assignmentCount} Assignments</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
