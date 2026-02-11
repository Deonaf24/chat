export interface AssignmentConcept {
  concept_id: number;
}

export interface AssignmentConceptDetail {
  id: number;
  name: string;
  description: string;
}

export interface AssignmentQuestion {
  id: number;
  assignment_id: number;
  prompt: string;
  position: number;
  concept_ids: number[];
}

export interface QuestionConceptLink {
  question_id: number;
  concept_id: number;
}

export interface AssignmentStructureProposal {
  assignment_id: number;
  concepts: AssignmentConceptDetail[];
  questions: AssignmentQuestion[];
  question_concepts: QuestionConceptLink[];
  assignment_concepts: AssignmentConcept[];
  structure_approved: boolean;
}
