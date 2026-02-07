"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreDistributionChartProps {
    scores: number[]; // Array of scores 0-1
}

export function ScoreDistributionChart({ scores }: ScoreDistributionChartProps) {
    // Process data into buckets
    const buckets = [
        { name: "F", count: 0, fill: "#ef4444" }, // Red-500
        { name: "D", count: 0, fill: "#f97316" }, // Orange-500
        { name: "C", count: 0, fill: "#eab308" }, // Yellow-500 
        { name: "B", count: 0, fill: "#3b82f6" }, // Blue-500
        { name: "A", count: 0, fill: "#22c55e" }, // Green-500
    ];

    scores.forEach(score => {
        const percentage = score * 100;
        if (percentage < 20) buckets[0].count++;
        else if (percentage < 40) buckets[1].count++;
        else if (percentage < 60) buckets[2].count++;
        else if (percentage < 80) buckets[3].count++;
        else buckets[4].count++;
    });

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Number of students per grade.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={buckets} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                                tickMargin={8}
                                tick={{ fontFamily: 'var(--font-soft)', fontSize: 14, fontWeight: 'bold' }}
                            />
                            <YAxis
                                allowDecimals={false}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                            >
                                {buckets.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
