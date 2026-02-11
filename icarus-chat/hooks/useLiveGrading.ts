import { useState, useEffect, useCallback } from 'react';
import { LiveResponseRead } from '@/app/types/live';
import { getGradingTasks, gradeResponse } from '@/app/lib/api/live';
import { toast } from "sonner";

export function useLiveGrading(sessionId: number | null, isEnded: boolean) {
    const [gradingTasks, setGradingTasks] = useState<LiveResponseRead[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGrading = useCallback(async () => {
        if (!sessionId || !isEnded) return;

        setLoading(true);
        try {
            const tasks = await getGradingTasks(sessionId);
            setGradingTasks(tasks);
        } catch (error) {
            console.error("Failed to load grading tasks", error);
            toast.error("Failed to load grading tasks");
        } finally {
            setLoading(false);
        }
    }, [sessionId, isEnded]);

    useEffect(() => {
        fetchGrading();
    }, [fetchGrading]);

    const submitGrade = async (responseId: number, isCorrect: boolean) => {
        try {
            await gradeResponse(responseId, isCorrect);
            // Optimistic update
            setGradingTasks(prev => prev.filter(t => t.id !== responseId));
            toast.success("Grade saved");
        } catch (error) {
            toast.error("Failed to save grade");
            throw error;
        }
    };

    return {
        gradingTasks,
        loading,
        submitGrade,
        refreshGrading: fetchGrading
    };
}
