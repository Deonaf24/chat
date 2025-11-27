"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listUsers } from "@/app/lib/api/auth";
import { listAssignments, listClasses, listStudents, listTeachers } from "@/app/lib/api/school";
import { AssignmentRead, ClassRead, StudentRead, TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface UseDashboardDataResult {
  classes: ClassRead[];
  students: StudentRead[];
  assignments: AssignmentRead[];
  usersById: Record<number, User>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addAssignment: (assignment: AssignmentRead) => void;
}

export function useDashboardData(user: User | null, teacher: TeacherRead | null): UseDashboardDataResult {
  const [classes, setClasses] = useState<ClassRead[]>([]);
  const [students, setStudents] = useState<StudentRead[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
  const [usersById, setUsersById] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teacherIdentifier = useMemo(() => teacher?.id ?? user?.id ?? null, [teacher, user]);

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

      const resolvedTeacherId = teacherIdentifier ?? teacherList.find((entry) => entry.user_id === user.id)?.id;
      const teacherClasses = resolvedTeacherId
        ? classList.filter((classItem) => classItem.teacher_id === resolvedTeacherId)
        : [];

      setClasses(teacherClasses);
      setStudents(studentList);
      setUsersById(
        userList.reduce<Record<number, User>>((accumulator, entry) => {
          if (entry.id === undefined) return accumulator;
          return { ...accumulator, [entry.id]: entry };
        }, {}),
      );

      const teacherAssignments = assignmentList.filter((assignment) =>
        teacherClasses.some((classItem) => classItem.id === assignment.class_id),
      );
      setAssignments(teacherAssignments);
    } catch (fetchError) {
      setError("Unable to load your dashboard right now.");
    } finally {
      setLoading(false);
    }
  }, [teacherIdentifier, user]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [fetchData, user]);

  const addAssignment = useCallback((assignment: AssignmentRead) => {
    setAssignments((previous) => [assignment, ...previous]);
  }, []);

  return { classes, students, assignments, usersById, loading, error, refresh: fetchData, addAssignment };
}
