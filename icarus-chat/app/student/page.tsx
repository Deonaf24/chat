"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { ClassList } from "@/components/student/ClassList";
import { ErrorCard } from "@/components/student/ErrorCard";
import { JoinClassDialog } from "@/components/student/JoinClassDialog";
import { LoadingSkeletonList } from "@/components/student/LoadingSkeletonList";
import { StudentHeader } from "@/components/student/StudentHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStudent } from "@/app/hooks/student/useAuthStudent";
import { useJoinClass } from "@/app/hooks/student/useJoinClass";
import { useStudentData } from "@/app/hooks/student/useStudentData";
import { mapTeachersToUsernames } from "@/app/lib/student/teacherNameMap";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStudent();
  const { student, classes, teachers, usersById, loading, error, refresh } = useStudentData(user);
  const teacherUsernames = useMemo(() => mapTeachersToUsernames(teachers, usersById), [teachers, usersById]);
  const { joinOpen, setJoinOpen, joinCode, setJoinCode, joining, joinError, handleJoin } = useJoinClass(
    student,
    refresh,
  );

  const handleNavigateToClass = (classId: number) => {
    router.push(`/classes/${classId}`);
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar actions={[{ text: "Logout", onClick: logout }]} />

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-10">
        <StudentHeader user={user} onOpenJoin={() => setJoinOpen(true)} />

        <JoinClassDialog
          open={joinOpen}
          onOpenChange={setJoinOpen}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          joining={joining}
          joinError={joinError}
          onJoin={handleJoin}
        />

        {loading ? (
          <LoadingSkeletonList />
        ) : error ? (
          <ErrorCard message={error} />
        ) : classes.length ? (
          <ClassList classes={classes} teacherUsernames={teacherUsernames} onNavigate={handleNavigateToClass} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No classes yet</CardTitle>
              <CardDescription>Use the join code from your teacher to enroll.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
