"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreDistributionChartProps {
    scores: number[]; // Array of scores 0-1
}

export function ScoreDistributionChart({ scores }: ScoreDistributionChartProps) {
    // Process data into buckets
    const buckets = [
        { name: "0-59%", count: 0, fill: "#ef4444" }, // Red-500
        { name: "60-69%", count: 0, fill: "#f97316" }, // Orange-500
        { name: "70-79%", count: 0, fill: "#eab308" }, // Yellow-500 
        { name: "80-89%", count: 0, fill: "#84cc16" }, // Lime-500
        { name: "90-100%", count: 0, fill: "#22c55e" }, // Green-500
    ];

    scores.forEach(score => {
        const percentage = score * 100;
        if (percentage < 60) buckets[0].count++;
        else if (percentage < 70) buckets[1].count++;
        else if (percentage < 80) buckets[2].count++;
        else if (percentage < 90) buckets[3].count++;
        else buckets[4].count++;
    });

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>Number of students per score range.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={buckets}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
