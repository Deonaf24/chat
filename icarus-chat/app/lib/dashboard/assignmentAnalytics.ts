import { AssignmentRead } from "@/app/types/school";

export interface AssignmentAnalyticsResult {
  confusionRate: number;
  hardestQuestion: string;
  strongestQuestion: string;
}

export function analyticsForAssignment(assignment: AssignmentRead): AssignmentAnalyticsResult {
  const base = (Number(assignment.id) % 7) * 10;
  const confusionRate = Math.min(95, 20 + base);
  const hardestQuestion = `Question ${(Number(assignment.id) % 5) + 1}`;
  const strongestQuestion = `Question ${((Number(assignment.id) + 2) % 5) + 1}`;

  return {
    confusionRate,
    hardestQuestion,
    strongestQuestion,
  };
}
