export interface UnderstandingScore {
  student_id: number;
  assignment_id: number;
  question_id?: number | null;
  concept_id?: number | null;
  score: number;
  confidence?: number | null;
  source: string;
}

export interface AssignmentScoreSummary {
  assignment_id: number;
  assignment_title: string;
  average_score: number;
}

export interface StudentAnalytics {
  student_id: number;
  questions_asked: number;
  easiest_assignment: AssignmentScoreSummary | null;
  hardest_assignment: AssignmentScoreSummary | null;
  most_understood_concept: ConceptScoreSummary | null;
  least_understood_concept: ConceptScoreSummary | null;
}

export interface ConceptScoreSummary {
  concept_id: number;
  concept_name: string;
  average_score: number;
}

export interface QuestionScoreSummary {
  question_id: number;
  question_prompt: string;
  average_score: number;
}

export interface AssignmentAnalytics {
  assignment_id: number;
  most_understood_concept: ConceptScoreSummary | null;
  least_understood_concept: ConceptScoreSummary | null;
  most_understood_question: QuestionScoreSummary | null;
  least_understood_question: QuestionScoreSummary | null;
  student_rankings: StudentScoreSummary[];
  weakness_groups: WeaknessGroup[];
}

export interface WeaknessGroup {
  concept_id: number;
  concept_name: string;
  students: StudentScoreSummary[];
  average_score: number;
}

export interface StudentScoreSummary {
  student_id: number;
  student_name: string;
  average_score: number;
  best_concept?: string;
  worst_concept?: string;
}

export interface ClassAnalytics {
  class_id: number;
  most_understood_assignment: AssignmentScoreSummary | null;
  least_understood_assignment: AssignmentScoreSummary | null;
  student_rankings: StudentScoreSummary[];
  weakness_groups: WeaknessGroup[];
  class_status?: string | null;
  class_status_color?: string | null;
}

export interface ConceptPayload {
  id?: number;
  name: string;
  description?: string | null;
}

export interface AssignmentQuestionPayload {
  id?: number;
  prompt: string;
  position?: number | null;
  concept_ids: number[];
}

export interface QuestionConceptLink {
  question_id: number;
  concept_id: number;
}

export interface AssignmentConceptLink {
  concept_id: number;
}

export interface AssignmentStructureReview {
  assignment_id: number;
  concepts: ConceptPayload[];
  questions: AssignmentQuestionPayload[];
  question_concepts: QuestionConceptLink[];
  assignment_concepts: AssignmentConceptLink[];
}


export interface AssignmentStructureReviewRead extends AssignmentStructureReview {
  structure_approved: boolean;
}

export interface ConceptScoreNode {
  concept_id: number;
  concept_name: string;
  understanding_score: number;
}

export interface ChapterAnalytics {
  chapter_id: number;
  chapter_title: string;
  understanding_score: number;
  concepts: ConceptScoreNode[];
}
