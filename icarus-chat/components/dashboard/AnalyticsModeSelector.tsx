"use client";

import { useState, useEffect, useRef } from "react";
import { Users, GraduationCap, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";

export type AnalyticsMode = 'class' | 'student' | 'assignment';

interface AnalyticsModeSelectorProps {
    currentMode: AnalyticsMode;
    onChange: (mode: AnalyticsMode) => void;
    className?: string;
}

export function AnalyticsModeSelector({ currentMode, onChange, className }: AnalyticsModeSelectorProps) {
    const [isCompact, setIsCompact] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { scrollY } = useScroll();
    const lastScrollY = useRef(0);
    const [lastDirection, setLastDirection] = useState<"up" | "down">("up");

    useMotionValueEvent(scrollY, "change", (latest) => {
        const diff = latest - lastScrollY.current;
        const direction = diff > 0 ? "down" : "up";

        // Only compact if we've moved significantly to avoid jitter
        if (latest < 50) {
            setIsCompact(false);
        } else if (direction === "down" && latest > 50) {
            setIsCompact(true);
        } else if (direction === "up") {
            // Only expand if we are scrolling up significantly or near top
            if (diff < -5) setIsCompact(false);
        }

        lastScrollY.current = latest;
    });

    const modes: { id: AnalyticsMode; label: string; icon: React.ReactNode }[] = [
        { id: 'class', label: 'Class', icon: <GraduationCap className="h-4 w-4" /> },
        { id: 'student', label: 'Student', icon: <Users className="h-4 w-4" /> },
        { id: 'assignment', label: 'Assignment', icon: <FileText className="h-4 w-4" /> },
    ];

    // Determine what to show
    const showFull = !isCompact || isHovered;

    return (
        <motion.div
            className={cn("fixed right-8 top-32 z-50", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.2, delay: 0.1 }}
        >
            <motion.div
                className={cn(
                    "bg-background/80 backdrop-blur-lg border shadow-lg flex items-center overflow-hidden",
                    showFull ? "rounded-full p-1.5 gap-1" : "rounded-full p-2"
                )}
                layout
                transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {modes.map((mode) => {
                        const isActive = currentMode === mode.id;

                        // In compact mode, only render the active item
                        if (!showFull && !isActive) return null;

                        return (
                            <motion.button
                                key={mode.id}
                                layout
                                onClick={() => onChange(mode.id)}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                                className={cn(
                                    "relative rounded-full text-sm font-medium transition-colors flex items-center justify-center",
                                    showFull ? "px-4 py-2 gap-2" : "h-10 w-10",
                                    isActive
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeAnalyticsMode"
                                        className="absolute inset-0 bg-primary rounded-full"
                                        initial={false}
                                        transition={{ type: "tween", duration: 0.2 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {mode.icon}
                                    {showFull && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.15 } }}>{mode.label}</motion.span>}
                                </span>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
