export interface LiveAnswerRequest {
    student_id: number;
    answer: string;
    time_spent_seconds: number;
}

export interface LiveAnswerResponse {
    status: string;
    is_correct: boolean;
    correct_answer?: string;
}

export interface LiveQuestion {
    id: number;
    text: string;
    question_type: string;
    options?: string[];
    order: number;
}

export interface LiveSession {
    id: number;
    class_id: number;
    status: "active" | "ended";
    current_question_index: number;
    questions: LiveQuestion[];
}

export interface LiveQueryResponse {
    session: LiveSession;
    context_summary: string;
}

export interface LiveStatsResponse {
    question_id: number | null;
    total_responses: number;
    distribution: Record<string, number>;
}

export interface LiveDashboardStats {
    session_id: number;
    total_students: number;
    questions: LiveStatsResponse[];
}

export interface LiveResponseRead {
    id: number;
    question_id: number;
    question_text?: string;
    student_id: number;
    answer: string;
    is_correct?: boolean;
}

// Session History Types
export interface LiveSessionSummary {
    id: number;
    class_id: number;
    status: "active" | "ended";
    created_at: string;
    ended_at?: string;
    question_count: number;
    response_count: number;
    participant_count: number;
}

export interface StudentQuestionResult {
    question_id: number;
    question_text: string;
    question_type: string;
    answer?: string;
    is_correct?: boolean;
    time_spent_seconds: number;
}

export interface StudentSessionResult {
    student_id: number;
    total_correct: number;
    total_answered: number;
    responses: StudentQuestionResult[];
}

export interface LiveDetailedStats {
    session_id: number;
    class_id: number;
    created_at: string;
    ended_at?: string;
    questions: LiveQuestion[];
    student_results: StudentSessionResult[];
    overall_accuracy: number;
}
