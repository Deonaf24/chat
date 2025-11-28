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
} from "@/app/types/school";


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

export function getFilePreviewUrl(fileId: number): string {
  return `${apiClient.defaults.baseURL}/school/files/${fileId}/download`;
}
