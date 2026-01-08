"use client";

import { useMemo } from "react";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassList } from "@/components/dashboard/ClassList";
import { TeacherProfileCard } from "@/components/dashboard/TeacherProfileCard";
import { ClassStatsRow } from "@/components/dashboard/ClassStatsRow";
import { StudentsCard } from "@/components/dashboard/StudentsCard";
import { AssignmentsCard } from "@/components/dashboard/AssignmentsCard";
import { CreateAssignmentDialog } from "@/components/dashboard/CreateAssignmentDialog";
import { useAuthTeacher } from "@/app/hooks/dashboard/useAuthTeacher";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { useSelectedClass } from "@/app/hooks/dashboard/useSelectedClass";
import { useAssignmentForm } from "@/app/hooks/dashboard/useAssignmentForm";
import { analyticsForAssignment } from "@/app/lib/dashboard/assignmentAnalytics";
import { authStore } from "@/app/lib/auth/authStore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, teacher, loading: authLoading } = useAuthTeacher();
  const { classes, students, assignments, usersById, loading, error, refresh, addAssignment } = useDashboardData(
    user,
    teacher,
  );
  const { selectedClassId, selectedClass, setSelectedClassId } = useSelectedClass(classes);
  const {
    assignmentForm,
    assignmentFile,
    creatingAssignment,
    error: assignmentError,
    showDialog,
    openDialog,
    closeDialog,
    updateAssignmentForm,
    handleFileChange,
    handleCreateAssignment,
  } = useAssignmentForm({ selectedClassId, user, teacher, onAssignmentCreated: addAssignment });

  const isLoading = authLoading || loading;

  const studentsInSelectedClass = useMemo(
    () => (selectedClassId ? students.filter((student) => student.class_ids?.includes(selectedClassId)) : []),
    [selectedClassId, students],
  );

  const assignmentsForSelectedClass = useMemo(
    () => assignments.filter((assignment) => assignment.class_id === selectedClassId),
    [assignments, selectedClassId],
  );

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  if (isLoading) {
    return (
      <div className="grid h-dvh place-items-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your teacher dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <Navbar
        name="Socratica"
        homeUrl="/dashboard"
        actions={[{ text: "Chat", href: "/chat" }, { text: "Logout", onClick: handleLogout }]}
      />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Teacher workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your classes, manage assignments, and view student understanding at a glance.
          </p>
        </div>

        {error && (
          <Card className="bg-destructive/5 border-destructive/30 text-destructive">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          <div className="space-y-4">
            <ClassList classes={classes} selectedClassId={selectedClassId} onSelect={setSelectedClassId} />
            <TeacherProfileCard user={user} teacher={teacher} classCount={classes.length} />
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current class</p>
                <h2 className="text-2xl font-semibold leading-tight">{selectedClass?.name ?? "Select a class"}</h2>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={refresh} disabled={loading}>
                  Refresh data
                </Button>
                <Button asChild variant="outline" disabled={!selectedClass}>
                  <Link href={selectedClass ? `/analytics/classes/${selectedClass.id}` : "#"}>Analytics</Link>
                </Button>
                <Button onClick={openDialog} disabled={!selectedClass}>
                  <Plus className="mr-2 h-4 w-4" />
                  New assignment
                </Button>
              </div>
            </div>

            <ClassStatsRow
              studentsCount={studentsInSelectedClass.length}
              assignmentsCount={assignmentsForSelectedClass.length}
              rosterLabel={selectedClass ? `${selectedClass.student_ids.length} enrolled` : "—"}
            />

            <StudentsCard students={studentsInSelectedClass} usersById={usersById} />
            <AssignmentsCard
              assignments={assignmentsForSelectedClass}
              analyticsForAssignment={analyticsForAssignment}
            />
          </div>
        </div>
      </main>

      <CreateAssignmentDialog
        open={showDialog}
        onOpenChange={(isOpen) => (isOpen ? openDialog() : closeDialog())}
        assignmentForm={assignmentForm}
        assignmentFile={assignmentFile}
        creating={creatingAssignment}
        error={assignmentError}
        classNameLabel={selectedClass?.name ?? "your class"}
        onChange={updateAssignmentForm}
        onFileChange={handleFileChange}
        onSubmit={handleCreateAssignment}
      />
    </div>
  );
}
