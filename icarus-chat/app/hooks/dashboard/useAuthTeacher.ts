"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listTeachers } from "@/app/lib/api/school";
import { authStore } from "@/app/lib/auth/authStore";
import { TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface UseAuthTeacherResult {
  user: User | null;
  teacher: TeacherRead | null;
  loading: boolean;
}

export function useAuthTeacher(): UseAuthTeacherResult {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<TeacherRead | null>(null);
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

        if (!currentUser.is_teacher) {
          router.replace("/student");
          return;
        }

        setUser(currentUser);

        const teacherList = await listTeachers();
        if (!isActive) return;

        const teacherRecord = teacherList.find((entry) => entry.user_id === currentUser.id) ?? null;
        setTeacher(teacherRecord);
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

  return { user, teacher, loading };
}
