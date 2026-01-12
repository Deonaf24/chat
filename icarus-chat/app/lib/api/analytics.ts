import { apiClient } from "./client";

import {
  AssignmentAnalytics,
  ClassAnalytics,
  StudentAnalytics,
  AssignmentStructureReviewRead,
  AssignmentStructureReview,
  ConceptPayload
} from "@/app/types/analytics";

export async function getStudentAnalytics(studentId: number): Promise<StudentAnalytics> {
  const response = await apiClient.get<StudentAnalytics>(`/analytics/students/${studentId}`);
  return response.data;
}

export async function getAssignmentAnalytics(assignmentId: number): Promise<AssignmentAnalytics> {
  const response = await apiClient.get<AssignmentAnalytics>(`/analytics/assignments/${assignmentId}`);
  return response.data;
}

export async function getClassAnalytics(classId: number): Promise<ClassAnalytics> {
  const response = await apiClient.get<ClassAnalytics>(`/analytics/classes/${classId}`);
  return response.data;
}

export async function getClassConcepts(classId: number): Promise<ConceptPayload[]> {
  const response = await apiClient.get<ConceptPayload[]>(`/school/classes/${classId}/concepts`);
  return response.data;
}

export async function getAssignmentStructure(assignmentId: number): Promise<AssignmentStructureReviewRead> {
  const response = await apiClient.get<AssignmentStructureReviewRead>(`/school/assignments/${assignmentId}/structure`);
  return response.data;
}

export async function analyzeAssignment(assignmentId: number): Promise<AssignmentStructureReviewRead> {
  const response = await apiClient.post<AssignmentStructureReviewRead>(`/school/assignments/${assignmentId}/analyze`);
  return response.data;
}

export async function updateAssignmentStructure(
  assignmentId: number,
  payload: AssignmentStructureReview
): Promise<AssignmentStructureReviewRead> {
  const response = await apiClient.put<AssignmentStructureReviewRead>(`/school/assignments/${assignmentId}/structure`, payload);
  return response.data;
}
