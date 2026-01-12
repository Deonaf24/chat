"use client";

import { useEffect, useState } from "react";
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
}

export function useDashboardAuth(): UseDashboardAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<TeacherRead | null>(null);
  const [student, setStudent] = useState<StudentRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const hydrateAuth = async () => {
      try {
        const currentUser = await authStore.hydrate();

        if (!isActive) return;

        if (!currentUser) {
          router.replace("/");
          return;
        }

        setUser(currentUser);

        if (currentUser.is_teacher) {
          const teacherList = await listTeachers();
          if (!isActive) return;
          const teacherRecord = teacherList.find((entry) => entry.user_id === currentUser.id) ?? null;
          setTeacher(teacherRecord);
        } else {
          const studentList = await listStudents();
          if (!isActive) return;
          const studentRecord = studentList.find((entry) => entry.user_id === currentUser.id) ?? null;
          setStudent(studentRecord);
        }

      } catch (error) {
        if (!isActive) return;
        router.replace("/");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    hydrateAuth();

    return () => {
      isActive = false;
    };
  }, [router]);

  return {
    user,
    teacher,
    student,
    loading,
    isTeacher: !!teacher || (user?.is_teacher ?? false),
    isStudent: !!student || (!user?.is_teacher && !!user)
  };
}
