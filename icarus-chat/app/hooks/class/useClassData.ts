"use client";

import { useCallback, useEffect, useState } from "react";

import { getClass, getStudent, listAssignments, listClasses, listStudents, listTeachers } from "@/app/lib/api/school";
import { listUsers } from "@/app/lib/api/auth";
import { User } from "@/app/types/auth";
import { AssignmentRead, ClassRead, StudentRead, TeacherRead } from "@/app/types/school";

const assignmentSorter = (a: AssignmentRead, b: AssignmentRead) => {
  const timeA = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
  const timeB = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
  return timeA - timeB;
};

export function useClassData(classId: number | null, user: User | null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<ClassRead | null>(null);
  const [teachers, setTeachers] = useState<TeacherRead[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
  const [usersById, setUsersById] = useState<Record<number, User>>({});
  const [classes, setClasses] = useState<ClassRead[]>([]);
  const [student, setStudent] = useState<StudentRead | null>(null);

  const fetchData = useCallback(async () => {
    if (!classId) {
      setClassData(null);
      setAssignments([]);
      setClasses([]);
      setStudent(null);
      setLoading(false);
      return;
    }

    if (!user) {
      setClassData(null);
      setAssignments([]);
      setClasses([]);
      setStudent(null);
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [classRecord, teacherList, assignmentList, userList, classList, studentList] = await Promise.all([
        getClass(classId),
        listTeachers(),
        listAssignments(),
        listUsers(),
        listClasses(),
        listStudents(),
      ]);

      const studentRecord = studentList.find((entry) => entry.user_id === user.id) ?? null;
      const detailedStudent = studentRecord ? await getStudent(studentRecord.id) : null;

      setClassData(classRecord);
      setTeachers(teacherList);
      const classAssignments = assignmentList
        .filter((assignment) => assignment.class_id === classId)
        .sort(assignmentSorter);
      setAssignments(classAssignments);

      setUsersById(
        userList.reduce<Record<number, User>>((acc, entry) => {
          if (entry.id === undefined) return acc;
          return { ...acc, [entry.id]: entry };
        }, {}),
      );

      if (detailedStudent) {
        const enrolledClassIds = detailedStudent.class_ids ?? [];
        const enrolledClasses = classList.filter(
          (classItem) => enrolledClassIds.includes(classItem.id) || classItem.student_ids?.includes(detailedStudent.id),
        );
        setClasses(enrolledClasses);
        setStudent(detailedStudent);
      } else {
        setClasses([]);
        setStudent(null);
      }
    } catch (err) {
      setError("Unable to load this class right now.");
    } finally {
      setLoading(false);
    }
  }, [classId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { loading, error, classData, assignments, teachers, usersById, classes, student, refresh: fetchData };
}
