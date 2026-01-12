import { apiClient } from "./client";

import {
  TeacherCreate,
  TeacherRead,
  StudentCreate,
  StudentRead,
  ClassCreate,
  ClassRead,
  AssignmentCreate,
  AssignmentRead,
  FileCreate,
  FileRead,
  Material,
  Concept,
} from "../../types/school";
import { AssignmentStructureProposal } from "@/app/types/assignmentStructure";
import { UnderstandingScore } from "@/app/types/analytics";


// ==========================================================
// TEACHERS
// ==========================================================

export async function createTeacher(data: TeacherCreate): Promise<TeacherRead> {
  const response = await apiClient.post<TeacherRead>("/school/teachers", data);
  return response.data;
}

export async function listTeachers(): Promise<TeacherRead[]> {
  const response = await apiClient.get<TeacherRead[]>("/school/teachers");
  return response.data;
}

export async function getTeacher(id: number): Promise<TeacherRead> {
  const response = await apiClient.get<TeacherRead>(`/school/teachers/${id}`);
  return response.data;
}


// ==========================================================
// STUDENTS
// ==========================================================

export async function createStudent(data: StudentCreate): Promise<StudentRead> {
  const response = await apiClient.post<StudentRead>("/school/students", data);
  return response.data;
}

export async function listStudents(): Promise<StudentRead[]> {
  const response = await apiClient.get<StudentRead[]>("/school/students");
  return response.data;
}

export async function getStudent(id: number): Promise<StudentRead> {
  const response = await apiClient.get<StudentRead>(`/school/students/${id}`);
  return response.data;
}


// ==========================================================
// CLASSES
// ==========================================================

export async function createClass(data: ClassCreate): Promise<ClassRead> {
  const response = await apiClient.post<ClassRead>("/school/classes", data);
  return response.data;
}

export async function listClasses(): Promise<ClassRead[]> {
  const response = await apiClient.get<ClassRead[]>("/school/classes");
  return response.data;
}

export async function getClass(id: number): Promise<ClassRead> {
  const response = await apiClient.get<ClassRead>(`/school/classes/${id}`);
  return response.data;
}

export async function enrollStudentToClass(
  classId: number,
  studentId: number
): Promise<ClassRead> {
  const response = await apiClient.post<ClassRead>(
    `/school/classes/${classId}/students/${studentId}`
  );
  return response.data;
}

export async function joinClassByCode(
  join_code: string,
  student_id: number
): Promise<ClassRead> {
  const response = await apiClient.post<ClassRead>("/school/classes/join", {
    join_code,
    student_id,
  });
  return response.data;
}


// ==========================================================
// ASSIGNMENTS
// ==========================================================

export async function createAssignment(
  data: AssignmentCreate
): Promise<AssignmentRead> {
  const response = await apiClient.post<AssignmentRead>("/school/assignments", data);
  return response.data;
}

export async function listAssignments(): Promise<AssignmentRead[]> {
  const response = await apiClient.get<AssignmentRead[]>("/school/assignments");
  return response.data;
}

export async function getAssignment(id: number): Promise<AssignmentRead> {
  const response = await apiClient.get<AssignmentRead>(`/school/assignments/${id}`);
  return response.data;
}

export async function updateAssignment(
  id: number,
  data: Partial<AssignmentCreate>
): Promise<AssignmentRead> {
  const response = await apiClient.put<AssignmentRead>(`/school/assignments/${id}`, data);
  return response.data;
}

export async function getMaterials(classId: number): Promise<Material[]> {
  const response = await apiClient.get<Material[]>(`/school/classes/${classId}/materials`);
  return response.data;
}

export async function createMaterial(
  classId: number,
  data: { title: string; description?: string; teacher_id: number; concept_ids?: number[] }
): Promise<Material> {
  const response = await apiClient.post<Material>(`/school/classes/${classId}/materials`, {
    ...data,
    class_id: classId,
  });
  return response.data;
}

export async function getClassConcepts(classId: number): Promise<Concept[]> {
  const response = await apiClient.get<Concept[]>(`/school/classes/${classId}/concepts`);
  return response.data;
}

export async function analyzeMaterial(materialId: number): Promise<Concept[]> {
  const response = await apiClient.post<Concept[]>(
    `/school/materials/${materialId}/analyze`
  );
  return response.data;
}

export async function uploadMaterialFile(materialId: number, file: File): Promise<FileRead> {
  const formData = new FormData();
  formData.append("material_id", String(materialId));
  formData.append("upload", file);
  const response = await apiClient.post<FileRead>("/school/materials/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function uploadAssignmentFile(
  assignmentId: string,
  file: File
): Promise<FileRead> {
  const form = new FormData();
  form.append("assignment_id", assignmentId);
  form.append("upload", file);

  const response = await apiClient.post<FileRead>(
    "/school/files/upload",
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function analyzeAssignment(assignmentId: string): Promise<AssignmentStructureProposal> {
  const response = await apiClient.post<AssignmentStructureProposal>(
    `/school/assignments/${assignmentId}/analyze`
  );
  return response.data;
}

export async function updateAssignmentStructure(
  assignmentId: string,
  payload: AssignmentStructureProposal
): Promise<AssignmentStructureProposal> {
  const response = await apiClient.put<AssignmentStructureProposal>(
    `/school/assignments/${assignmentId}/structure`,
    payload
  );
  return response.data;
}

export async function scoreAssignment(assignmentId: string): Promise<UnderstandingScore[]> {
  const response = await apiClient.post<UnderstandingScore[]>(
    `/school/assignments/${assignmentId}/score`
  );
  return response.data;
}


// ==========================================================
// FILES
// ==========================================================

export async function createFile(data: FileCreate): Promise<FileRead> {
  const response = await apiClient.post<FileRead>("/school/files", data);
  return response.data;
}

export async function listFiles(): Promise<FileRead[]> {
  const response = await apiClient.get<FileRead[]>("/school/files");
  return response.data;
}

export async function getFile(id: number): Promise<FileRead> {
  const response = await apiClient.get<FileRead>(`/school/files/${id}`);
  return response.data;
}

export async function getFilePreviewUrl(id: number): Promise<string> {
  const downloadPath = `/school/files/${id}/download`;
  const base = apiClient.defaults.baseURL;

  if (!base) return downloadPath;

  try {
    return new URL(downloadPath, base).toString();
  } catch (err) {
    return downloadPath;
  }
}


export async function generateLiveQuestions(
  classId: number,
  conceptIds: number[],
  timeLimit: number
): Promise<{ generate_prompt: string; context_summary: string }> {
  const response = await apiClient.post<{ generate_prompt: string; context_summary: string }>(
    `/school/classes/${classId}/live/generate`,
    { concept_ids: conceptIds, time_limit: timeLimit }
  );
  return response.data;
}
