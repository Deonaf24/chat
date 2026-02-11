import type {
  AssignmentStructureProposal,
  AssignmentConceptDetail,
  AssignmentQuestion,
  QuestionConceptLink,
} from "@/app/types/assignmentStructure";
import type {
  AssignmentAnalytics,
  ClassAnalytics,
  StudentAnalytics,
  UnderstandingScore,
} from "@/app/types/analytics";

const concepts: AssignmentConceptDetail[] = [
  { id: 1, name: "Algebra", description: "Linear equations" },
];

const questions: AssignmentQuestion[] = [
  { id: 10, assignment_id: 123, prompt: "Solve x+2=4", position: 1, concept_ids: [1] },
];

const links: QuestionConceptLink[] = [{ question_id: 10, concept_id: 1 }];

const structure: AssignmentStructureProposal = {
  assignment_id: 123,
  concepts,
  questions,
  question_concepts: links,
  assignment_concepts: [{ concept_id: 1 }],
  structure_approved: false,
};

const studentAnalytics: StudentAnalytics = {
  student_id: 17,
  questions_asked: 12,
  easiest_assignment: "Worksheet 1",
  hardest_assignment: "Quiz 3",
  most_understood_concept: "Algebra",
  least_understood_concept: "Fractions",
};

const assignmentAnalytics: AssignmentAnalytics = {
  assignment_id: 123,
  most_understood_concept: "Algebra",
  least_understood_concept: "Fractions",
  most_understood_question: "Solve x+2=4",
  least_understood_question: "Find slope",
};

const classAnalytics: ClassAnalytics = {
  class_id: 55,
  most_understood_assignment: "Worksheet 1",
  least_understood_assignment: "Quiz 3",
  student_rankings: [
    { student_id: 17, average_score: 0.82 },
    { student_id: 18, average_score: 0.74 },
  ],
};

const score: UnderstandingScore = {
  student_id: 17,
  assignment_id: 123,
  question_id: 10,
  concept_id: 1,
  score: 0.82,
  confidence: 0.64,
  source: "ollama",
};

void structure;
void studentAnalytics;
void assignmentAnalytics;
void classAnalytics;
void score;
