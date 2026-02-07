import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AssignmentRead, StudentRead } from "@/app/types/school"

import { getGrade } from "@/lib/grading";

interface GradesViewProps {
    students: StudentRead[];
    assignments: AssignmentRead[];
}

export function GradesView({ students, assignments }: GradesViewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Grades</CardTitle>
                <CardDescription>View student performance across all assignments.</CardDescription>
            </CardHeader>
            <CardContent>
                {students.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No students enrolled.</p>
                ) : (
                    <Table>
                        <TableCaption>A list of recent grades.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Student</TableHead>
                                {assignments.map(a => (
                                    <TableHead key={a.id} className="text-center">{a.title}</TableHead>
                                ))}
                                <TableHead className="text-right">Average</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name || "Student"}</TableCell>
                                    {assignments.map(a => {
                                        const score = Math.random() * 0.4 + 0.6;
                                        const grade = getGrade(score);
                                        return (
                                            <TableCell key={a.id} className={`text-center ${grade.colorClass}`}>
                                                {grade.grade}
                                            </TableCell>
                                        )
                                    })}
                                    <TableCell className="text-right font-bold text-blue-500">B</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
