export interface UnderstandingScore {
  student_id: number;
  assignment_id: number;
  question_id?: number | null;
  concept_id?: number | null;
  score: number;
  confidence?: number | null;
  source: string;
}

export interface StudentAnalytics {
  student_id: number;
  questions_asked: number;
  easiest_assignment: string | null;
  hardest_assignment: string | null;
  most_understood_concept: string | null;
  least_understood_concept: string | null;
}

export interface AssignmentAnalytics {
  assignment_id: number;
  most_understood_concept: string | null;
  least_understood_concept: string | null;
  most_understood_question: string | null;
  least_understood_question: string | null;
}

export interface StudentRanking {
  student_id: number;
  average_score: number;
}

export interface ClassAnalytics {
  class_id: number;
  most_understood_assignment: string | null;
  least_understood_assignment: string | null;
  student_rankings: StudentRanking[];
}
