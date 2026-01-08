import { apiClient } from "./client";

import { AssignmentAnalytics, ClassAnalytics, StudentAnalytics } from "@/app/types/analytics";

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
