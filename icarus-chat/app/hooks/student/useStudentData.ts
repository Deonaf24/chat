"use client";

import { useCallback, useEffect, useState } from "react";

import { listUsers } from "@/app/lib/api/auth";
import { getStudent, listClasses, listStudents, listTeachers } from "@/app/lib/api/school";
import { ClassRead, StudentRead, TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface UseStudentDataResult {
  student: StudentRead | null;
  classes: ClassRead[];
  teachers: TeacherRead[];
  usersById: Record<number, User>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useStudentData(user: User | null): UseStudentDataResult {
  const [student, setStudent] = useState<StudentRead | null>(null);
  const [classes, setClasses] = useState<ClassRead[]>([]);
  const [teachers, setTeachers] = useState<TeacherRead[]>([]);
  const [usersById, setUsersById] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [studentList, classList, teacherList, userList] = await Promise.all([
        listStudents(),
        listClasses(),
        listTeachers(),
        listUsers(),
      ]);

      const studentRecord = studentList.find((entry) => entry.user_id === user.id);
      if (!studentRecord) {
        setError("We couldn't find your student profile.");
        setStudent(null);
        setClasses([]);
        setTeachers([]);
        return;
      }

      const detailedStudent = await getStudent(studentRecord.id);
      const enrolledClassIds = detailedStudent.class_ids ?? [];
      const enrolledClasses = classList.filter(
        (classItem) =>
          enrolledClassIds.includes(classItem.id) || classItem.student_ids?.includes(detailedStudent.id),
      );

      setStudent(detailedStudent);
      setClasses(enrolledClasses);
      setTeachers(teacherList);
      setUsersById(
        userList.reduce<Record<number, User>>((accumulator, entry) => {
          if (entry.id === undefined) return accumulator;
          return { ...accumulator, [entry.id]: entry };
        }, {}),
      );
    } catch (fetchError) {
      setError("Unable to load your classes right now.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [fetchData, user]);

  return { student, classes, teachers, usersById, loading, error, refresh: fetchData };
}
