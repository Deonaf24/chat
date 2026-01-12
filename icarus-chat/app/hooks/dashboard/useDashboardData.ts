"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listUsers } from "@/app/lib/api/auth";
import { listAssignments, listClasses, listStudents, listTeachers } from "@/app/lib/api/school";
import { AssignmentRead, ClassRead, StudentRead, TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface UseDashboardDataResult {
  classes: ClassRead[];
  students: StudentRead[];
  teachers: TeacherRead[];
  assignments: AssignmentRead[];
  usersById: Record<number, User>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addAssignment: (assignment: AssignmentRead) => void;
}

export function useDashboardData(
  user: User | null,
  teacher: TeacherRead | null,
  student: StudentRead | null
): UseDashboardDataResult {
  const [classes, setClasses] = useState<ClassRead[]>([]);
  const [teachersList, setTeachersList] = useState<TeacherRead[]>([]);
  const [students, setStudents] = useState<StudentRead[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
  const [usersById, setUsersById] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teacherIdentifier = useMemo(() => teacher?.id ?? user?.id ?? null, [teacher, user]);
  const studentIdentifier = useMemo(() => student?.id ?? null, [student]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const [teacherList, classList, studentList, assignmentList, userList] = await Promise.all([
        listTeachers(),
        listClasses(),
        listStudents(),
        listAssignments(),
        listUsers(),
      ]);

      let relevantClasses: ClassRead[] = [];

      if (teacher) {
        const resolvedTeacherId = teacherIdentifier ?? teacherList.find((entry) => entry.user_id === user.id)?.id;
        relevantClasses = resolvedTeacherId
          ? classList.filter((classItem) => classItem.teacher_id === resolvedTeacherId)
          : [];
      } else if (student) {
        // Find classes where student is enrolled
        // This is tricky because we need the student object, but we have student list.
        // Assuming the student object passed in has correct id. 
        // We can check class.student_ids if available (it is in ClassRead)
        relevantClasses = classList.filter(c => c.student_ids.includes(student.id));
      }

      setTeachersList(teacherList);
      setClasses(relevantClasses);
      setStudents(studentList);
      setUsersById(
        userList.reduce<Record<number, User>>((accumulator, entry) => {
          if (entry.id === undefined) return accumulator;
          return { ...accumulator, [entry.id]: entry };
        }, {}),
      );

      // Filter assignments for relevant classes
      const relevantAssignments = assignmentList.filter((assignment) =>
        relevantClasses.some((classItem) => classItem.id === assignment.class_id),
      );
      setAssignments(relevantAssignments);
    } catch (fetchError) {
      setError("Unable to load your dashboard right now.");
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  }, [teacher, student, teacherIdentifier, studentIdentifier, user]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [fetchData, user]);

  const addAssignment = useCallback((assignment: AssignmentRead) => {
    setAssignments((previous) => [assignment, ...previous]);
  }, []);

  return { classes, students, teachers: teachersList, assignments, usersById, loading, error, refresh: fetchData, addAssignment };
}
