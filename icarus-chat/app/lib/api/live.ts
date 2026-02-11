import { apiClient } from "./client";
import { LiveSession, LiveQuestion, LiveAnswerResponse, LiveAnswerRequest, LiveStatsResponse, LiveDashboardStats } from "@/app/types/live";

const ROOT = "/live";

/**
 * Start a live session (Teacher only)
 */
export async function startLiveSession(sessionId: number): Promise<LiveSession> {
    const { data } = await apiClient.post<LiveSession>(`${ROOT}/${sessionId}/start`);
    return data;
}

/**
 * Advance to next question (Teacher only)
 */
export async function nextQuestion(sessionId: number): Promise<LiveSession> {
    const { data } = await apiClient.post<LiveSession>(`${ROOT}/${sessionId}/next`);
    return data;
}

/**
 * End session (Teacher only)
 */
export async function endLiveSession(sessionId: number): Promise<LiveSession> {
    const { data } = await apiClient.post<LiveSession>(`${ROOT}/${sessionId}/end`);
    return data;
}

/**
 * Get current session status (Polled by Student & Teacher)
 */
export async function getLiveSessionStatus(sessionId: number): Promise<LiveSession> {
    const { data } = await apiClient.get<LiveSession>(`${ROOT}/${sessionId}/status`);
    return data;
}

/**
 * Get next question for student (Self-paced)
 */
export async function getNextQuestion(sessionId: number, studentId: number): Promise<LiveQuestion | null> {
    try {
        const { data } = await apiClient.get<LiveQuestion | null>(`${ROOT}/${sessionId}/next_question?student_id=${studentId}`);
        return data; // null if finished
    } catch {
        return null;
    }
}

/**
 * Submit answer (Student only)
 */
export async function submitLiveAnswer(questionId: number, studentId: number, answer: string, timeSpent: number): Promise<LiveAnswerResponse> {
    const payload: LiveAnswerRequest = {
        student_id: studentId,
        answer: answer,
        time_spent_seconds: timeSpent
    };
    const { data } = await apiClient.post<LiveAnswerResponse>(`${ROOT}/${questionId}/answer`, payload);
    return data;
}


/**
 * Find active session for a class
 */
export async function getActiveSession(classId: number): Promise<LiveSession | null> {
    try {
        const { data } = await apiClient.get<LiveSession>(`${ROOT}/class/${classId}/active`);
        return data;
    } catch (error) {
        return null;
    }
}

/**
 * Get stats for session
 */
export async function getLiveStats(sessionId: number): Promise<LiveDashboardStats> {
    const { data } = await apiClient.get<LiveDashboardStats>(`${ROOT}/${sessionId}/stats`);
    return data;
}


/**
 * Get unscored responses for grading
 */
import { LiveResponseRead } from "@/app/types/live";
export async function getGradingTasks(sessionId: number): Promise<LiveResponseRead[]> {
    const { data } = await apiClient.get<LiveResponseRead[]>(`${ROOT}/${sessionId}/grading`);
    return data;
}

/**
 * Grade a response
 */
export async function gradeResponse(responseId: number, isCorrect: boolean): Promise<LiveAnswerResponse> {
    const { data } = await apiClient.post<LiveAnswerResponse>(`${ROOT}/response/${responseId}/grade`, { is_correct: isCorrect });
    return data;
}

// Session History API Functions
import { LiveSessionSummary, LiveDetailedStats } from "@/app/types/live";

/**
 * Get session history for a class
 */
export async function getSessionHistory(classId: number): Promise<LiveSessionSummary[]> {
    const { data } = await apiClient.get<LiveSessionSummary[]>(`${ROOT}/class/${classId}/history`);
    return data;
}

/**
 * Get detailed stats for a past session
 */
export async function getDetailedSessionStats(sessionId: number): Promise<LiveDetailedStats> {
    const { data } = await apiClient.get<LiveDetailedStats>(`${ROOT}/${sessionId}/detailed_stats`);
    return data;
}
