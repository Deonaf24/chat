"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { authStore } from "@/app/lib/auth/authStore";
import { getClass, listTeachers } from "@/app/lib/api/school";
import { listUsers } from "@/app/lib/api/auth";
import { ClassRead, TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [classData, setClassData] = useState<ClassRead | null>(null);
  const [teachers, setTeachers] = useState<TeacherRead[]>([]);
  const [usersById, setUsersById] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const classId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    return Number.isNaN(numericId) ? null : numericId;
  }, [params]);

  useEffect(() => {
    let isMounted = true;

    authStore
      .hydrate()
      .then((currentUser) => {
        if (!isMounted) return;
        if (!currentUser) {
          router.replace("/");
          return;
        }
        setUser(currentUser);
        if (classId) {
          fetchClassData();
        }
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/");
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, classId]);

  const fetchClassData = async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    try {
      const [classRecord, teacherList, userList] = await Promise.all([
        getClass(classId),
        listTeachers(),
        listUsers(),
      ]);
      setClassData(classRecord);
      setTeachers(teacherList);
      setUsersById(
        userList.reduce<Record<number, User>>((acc, entry) => {
          if (entry.id === undefined) return acc;
          return { ...acc, [entry.id]: entry };
        }, {}),
      );
    } catch (err) {
      setError("Unable to load this class right now.");
    } finally {
      setLoading(false);
    }
  };

  const teacherName = useMemo(() => {
    if (!classData?.teacher_id) return null;
    const teacherRecord = teachers.find((entry) => entry.id === classData.teacher_id);
    return teacherRecord ? usersById[teacherRecord.user_id]?.username ?? null : null;
  }, [classData, teachers, usersById]);

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar actions={[{ text: "Logout", onClick: handleLogout }]} />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 pb-16 pt-10">
        {loading ? (
          <Skeleton className="h-36 w-full" />
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : classData ? (
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Class</Badge>
                {teacherName ? (
                  <span className="text-sm text-muted-foreground">Taught by {teacherName}</span>
                ) : null}
              </div>
              <CardTitle className="text-3xl font-semibold">{classData.name}</CardTitle>
              {classData.description ? (
                <CardDescription>{classData.description}</CardDescription>
              ) : (
                <CardDescription>No class description provided yet.</CardDescription>
              )}
            </CardHeader>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
