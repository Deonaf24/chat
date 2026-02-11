"use client";

import { motion } from "motion/react";
import {
    BarChart3,
    BookOpen,
    Users,
    TrendingUp,
    Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsEmptyStateProps {
    title?: string;
    subtitle?: string;
}

const features = [
    {
        icon: BookOpen,
        title: "Track Understanding",
        description: "See how well students grasp concepts"
    },
    {
        icon: BarChart3,
        title: "Identify Focus Areas",
        description: "Spot topics that need more attention"
    },
    {
        icon: Users,
        title: "Student Progress",
        description: "Monitor individual and class performance"
    }
];

export function AnalyticsEmptyState({
    title = "Your Analytics Journey Begins Soon",
    subtitle = "Analytics will appear automatically once students start submitting assignments and engaging with course materials."
}: AnalyticsEmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-12 px-4"
        >
            {/* Illustration */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative mb-8"
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-3xl rounded-full" />

                {/* Main illustration container */}
                <div className="relative bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 rounded-2xl p-8 backdrop-blur-sm">
                    {/* Chart placeholder with dotted lines */}
                    <div className="w-64 h-40 relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="border-t border-dashed border-muted-foreground/50" />
                            ))}
                        </div>

                        {/* Animated wave line */}
                        <svg
                            viewBox="0 0 256 160"
                            className="absolute inset-0 w-full h-full"
                            fill="none"
                        >
                            <motion.path
                                d="M0 120 Q32 100, 64 110 T128 90 T192 100 T256 80"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                className="text-muted-foreground/40"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 0.3 }}
                            />
                            <motion.path
                                d="M0 80 Q32 60, 64 70 T128 50 T192 60 T256 40"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-blue-400/60"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            />
                        </svg>

                        {/* Floating icons */}
                        <motion.div
                            className="absolute -top-4 -left-4 p-2 bg-background/80 rounded-lg border border-border/50 shadow-lg"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <BookOpen className="h-5 w-5 text-blue-400/70" />
                        </motion.div>

                        <motion.div
                            className="absolute -top-2 -right-4 p-2 bg-background/80 rounded-lg border border-border/50 shadow-lg"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <TrendingUp className="h-5 w-5 text-purple-400/70" />
                        </motion.div>

                        <motion.div
                            className="absolute -bottom-4 right-8 p-2 bg-background/80 rounded-lg border border-border/50 shadow-lg"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.9 }}
                        >
                            <Sparkles className="h-5 w-5 text-amber-400/70" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Text content */}
            <motion.div
                className="text-center max-w-lg mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <h2 className="text-2xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                    {subtitle}
                </p>
            </motion.div>

            {/* Feature cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    >
                        <Card className="bg-muted/30 border-border/50 hover:bg-muted/50 transition-colors">
                            <CardContent className="pt-6 pb-5 px-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 rounded-lg bg-background/80 border border-border/50">
                                        <feature.icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Guidance note */}
            <motion.div
                className="mt-10 text-center max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
            >
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    <span className="font-medium text-muted-foreground">Tip:</span> Assign work to your students or
                    wait for them to engage with existing materials. Insights will unlock as they interact with the system.
                </p>
            </motion.div>
        </motion.div>
    );
}
