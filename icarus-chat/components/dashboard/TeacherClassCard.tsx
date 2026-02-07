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
                "flex flex-col h-[180px] py-0 gap-0"
            )}
            onClick={onClick}
        >
            {/* Decorative Gradient Background */}
            <div className={cn("absolute inset-0 bg-gradient-to-br", theme.overlay)} />

            <CardHeader className="pb-2 z-10 pt-6 px-6">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl font-bold tracking-tight text-white line-clamp-2 leading-tight">{classItem.name}</CardTitle>
                    <div className="flex gap-1 items-center">

                        <Badge variant="outline" className="bg-white/20 text-white border-white/20 backdrop-blur-sm shrink-0">
                            Active
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="z-10 mt-auto pb-6 px-6">
                <div className="flex items-center gap-1.5 text-sm text-white/90 font-medium">
                    <Users className="h-4 w-4 text-white/80" />
                    <span>{studentCount} Students</span>
                </div>
            </CardContent>
        </Card>
    );
}
