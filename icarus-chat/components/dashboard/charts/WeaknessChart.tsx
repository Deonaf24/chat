"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeaknessGroup } from "@/app/types/analytics";

interface WeaknessChartProps {
    groups: WeaknessGroup[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#8b5cf6'];

export function WeaknessChart({ groups }: WeaknessChartProps) {
    const data = groups.map((g, index) => ({
        name: g.concept_name,
        value: g.students.length,
        fill: COLORS[index % COLORS.length]
    }));

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Struggling Students by Topic</CardTitle>
                <CardDescription>Breakdown of students grouped by their weakest concept.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Legend verticalAlign="bottom" height={undefined} wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
