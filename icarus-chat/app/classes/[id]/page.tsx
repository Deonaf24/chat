"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAuthUser } from "@/app/hooks/class/useAuthUser";
import { useClassData } from "@/app/hooks/class/useClassData";
import { useClassId } from "@/app/hooks/class/useClassId";
import { mapTeacherName } from "@/app/lib/class/mapTeacherName";
import { authStore } from "@/app/lib/auth/authStore";
import { AssignmentsCard } from "@/components/class-page/AssignmentsCard";
import { ClassHeaderCard } from "@/components/class-page/ClassHeaderCard";
import { ErrorCard } from "@/components/class-page/ErrorCard";
import { LoadingSkeleton } from "@/components/class-page/LoadingSkeleton";
import { ClassNavigationSidebar } from "@/components/section/sidebar/class-navigation";
import Navbar from "@/components/section/navbar/default";

export default function ClassPage() {
  const router = useRouter();
  const { user } = useAuthUser();
  const classId = useClassId();
  const { loading, error, classData, assignments, teachers, usersById, classes } = useClassData(classId, user);

  const teacherName = useMemo(() => mapTeacherName(classData, teachers, usersById), [classData, teachers, usersById]);

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar actions={[{ text: "Logout", onClick: handleLogout }]} />
      <ClassNavigationSidebar
        classes={classes}
        currentClassId={classId}
        loading={loading}
        onNavigate={(path) => router.push(path)}
      />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 pb-16 pt-10">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorCard message={error} />
        ) : classData ? (
          <>
            <ClassHeaderCard
              classData={classData}
              teacherName={teacherName}
              analyticsHref={`/analytics/classes/${classData.id}`}
            />
            <AssignmentsCard assignments={assignments} />
          </>
        ) : null}
      </main>
    </div>
  );
}
