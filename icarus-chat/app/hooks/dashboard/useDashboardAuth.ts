"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listTeachers, listStudents } from "@/app/lib/api/school";
import { authStore } from "@/app/lib/auth/authStore";
import { TeacherRead, StudentRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface UseDashboardAuthResult {
  user: User | null;
  teacher: TeacherRead | null;
  student: StudentRead | null;
  loading: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  refreshAuth: () => Promise<void>;
}

export function useDashboardAuth(): UseDashboardAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<TeacherRead | null>(null);
  const [student, setStudent] = useState<StudentRead | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateAuth = useCallback(async () => {
    try {
      const currentUser = await authStore.hydrate();

      if (!currentUser) {
        router.replace("/");
        return;
      }

      setUser(currentUser);

      if (currentUser.is_teacher) {
        const teacherList = await listTeachers();
        const teacherRecord = teacherList.find((entry) => entry.user_id === currentUser.id) ?? null;
        setTeacher(teacherRecord);
      } else {
        const studentList = await listStudents();
        const studentRecord = studentList.find((entry) => entry.user_id === currentUser.id) ?? null;
        setStudent(studentRecord);
      }

    } catch (error) {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  const refreshAuth = useCallback(async () => {
    // Re-fetch the teacher/student profile from the API
    if (!user) return;

    try {
      if (user.is_teacher) {
        const teacherList = await listTeachers();
        const teacherRecord = teacherList.find((entry) => entry.user_id === user.id) ?? null;
        setTeacher(teacherRecord);
      } else {
        const studentList = await listStudents();
        const studentRecord = studentList.find((entry) => entry.user_id === user.id) ?? null;
        setStudent(studentRecord);
      }
    } catch (error) {
      console.error("Failed to refresh auth data", error);
    }
  }, [user]);

  return {
    user,
    teacher,
    student,
    loading,
    isTeacher: !!teacher || (user?.is_teacher ?? false),
    isStudent: !!student || (!user?.is_teacher && !!user),
    refreshAuth
  };
}

