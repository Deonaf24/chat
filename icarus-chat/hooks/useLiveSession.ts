import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveSession, LiveQuestion } from '@/app/types/live';
import {
    getLiveSessionStatus,
    getNextQuestion,
    endLiveSession
} from '@/app/lib/api/live';
import { generateLiveQuestions } from '@/app/lib/api/school';
import { toast } from "sonner";

/**
 * Hook to manage live session lifecycle (Start, Status, End) and student polling.
 */
export function useLiveSession(sessionId: number | null | undefined, role: 'teacher' | 'student', studentId?: number) {
    const [session, setSession] = useState<LiveSession | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<LiveQuestion | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Polling interval ref
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch session status (Poll)
    const fetchSessionStatus = useCallback(async () => {
        if (!sessionId) return;
        try {
            const sessionData = await getLiveSessionStatus(sessionId);
            setSession(sessionData);

            // If session ended, clear question
            if (sessionData.status === 'ended') {
                setCurrentQuestion(null);
            }
        } catch (error) {
            console.error("Polling error", error);
            // Don't set global error on poll failure to avoid UI flickering, just log
        }
    }, [sessionId]);

    // Fetch next question (Student: Manual / Initial)
    const fetchNextQuestion = useCallback(async () => {
        if (!sessionId || !studentId || role !== 'student') return;
        try {
            const question = await getNextQuestion(sessionId, studentId);
            setCurrentQuestion(question);
        } catch (error) {
            console.error("Failed to fetch next question", error);
        }
    }, [sessionId, studentId, role]);

    const startSession = async (classId: number, conceptIds: number[], timeLimit: number, questionTypes: string[]) => {
        setLoading(true);
        try {
            // Note: We're using the generate API which creates AND starts the session
            // In a real app we might want to separate generation from starting
            // For now sticking to the existing pattern
            // Note: generateLiveQuestions is imported from school api in original code, 
            // but let's assume we standardise or it is available via an import.
            // Actually, looking at original code, generateLiveQuestions was imported from school.ts
            // We should verify where it is. Assuming school.ts for now or we import it here.
            // Wait, I need to make sure I have the import right.
            // The original code imported `generateLiveQuestions` from `@/app/lib/api/school`.
            // I will use that.
            throw new Error("Use useLiveSessionGenerator for creation logic to keep this hook focused.");
        } catch (err) {
            setError("Failed to start session");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const endSession = async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            await endLiveSession(sessionId);
            toast.success("Session ended");
            await fetchSessionStatus(); // Update local state immediately
        } catch (err) {
            toast.error("Failed to end session");
            setError("Failed to end session");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!sessionId) {
            setSession(null);
            setCurrentQuestion(null);
            return;
        }

        // Initial fetch
        setLoading(true);
        fetchSessionStatus().finally(() => setLoading(false));

        // If student, fetch initial question
        if (role === 'student' && studentId) {
            fetchNextQuestion();
        }

        // Start Polling Session Status
        pollRef.current = setInterval(fetchSessionStatus, 3000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [sessionId, role, studentId, fetchSessionStatus, fetchNextQuestion]);

    return {
        session,
        currentQuestion,
        loading,
        error,
        refreshSession: fetchSessionStatus,
        fetchNextQuestion,
        endSession
    };
}

