"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listStudents } from "@/app/lib/api/school";
import { authStore } from "@/app/lib/auth/authStore";
import { StudentRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface UseAuthStudentResult {
  user: User | null;
  student: StudentRead | null;
  logout: () => void;
}

export function useAuthStudent(): UseAuthStudentResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentRead | null>(null);

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

        if (currentUser.is_teacher) {
          router.replace("/dashboard");
          return;
        }

        setUser(currentUser);

        const studentList = await listStudents();
        if (!isActive) return;

        const studentRecord = studentList.find((entry) => entry.user_id === currentUser.id) ?? null;
        setStudent(studentRecord);
      } catch (error) {
        if (!isActive) return;
        router.replace("/");
      }
    };

    hydrateAuth();

    return () => {
      isActive = false;
    };
  }, [router]);

  const logout = useCallback(() => {
    authStore.logout();
    router.replace("/");
  }, [router]);

  return { user, student, logout };
}
