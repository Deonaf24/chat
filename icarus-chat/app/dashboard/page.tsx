"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassGrid } from "@/components/dashboard/ClassGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { authStore } from "@/app/lib/auth/authStore";
import { JoinClassDialog } from "@/components/dashboard/JoinClassDialog";
import { CreateClassDialog } from "@/components/dashboard/CreateClassDialog";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
// useState imported above

export default function DashboardPage() {
  const router = useRouter();
  const { user, teacher, student, loading: authLoading } = useDashboardAuth();
  const { classes, students, assignments, loading, initialized, error } = useDashboardData(
    user,
    teacher,
    student
  );

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const isStrictlyLoading = authLoading || loading || (!initialized && !!user);
  const showLoader = useSmoothLoading(isStrictlyLoading);

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  const handleClassSelect = (classId: number) => {
    router.push(`/dashboard/classes/${classId}`);
  };

  const getClassStats = (classId: number) => {
    return {
      studentCount: students.filter((s) => s.class_ids?.includes(classId)).length,
      assignmentCount: assignments.filter((a) => a.class_id === classId).length,
    }
  }

  if (showLoader) {
    return (
      <div className="grid h-dvh place-items-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (isStrictlyLoading) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      {/* Custom Header with SidebarMenu */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 z-10">
            <SidebarMenu classes={classes} role={teacher ? 'teacher' : student ? 'student' : undefined} />
            <a href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
              Socratica
            </a>
          </div>

          <div className="flex items-center gap-2 z-10 ml-auto bg-transparent">
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Welcome back, {teacher?.name ?? student?.name ?? user?.email ?? "User"}.
              {teacher ? " Manage your classes and track student progress." : " View your classes and track your progress."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {classes.length} Active Classes
            </Badge>
            {teacher && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await import("@/app/lib/api/school").then(m => m.syncGoogleCourses());
                    window.location.reload();
                  } catch (e) {
                    console.error("Sync failed", e);
                  }
                }}
              >
                Sync Google Classroom
              </Button>
            )}
            {student && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => setJoinDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Join Class</span>
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="bg-destructive/5 border-destructive/30 text-destructive mb-6">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {classes.length > 0 ? (
              <ClassGrid
                classes={classes}
                selectedClassId={null}
                onSelect={handleClassSelect}
                getStats={getClassStats}
                showCreate={!student}
                onCreate={() => setCreateDialogOpen(true)}
              />
            ) : (
              <div className="grid place-items-center h-64 border-2 border-dashed rounded-xl">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-muted-foreground">You don't have any classes yet.</p>
                  {student && (
                    <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
                      Join your first class
                    </Button>
                  )}
                  {teacher && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await import("@/app/lib/api/school").then(m => m.syncGoogleCourses());
                          window.location.reload();
                        } catch (e) {
                          console.error("Sync failed", e);
                        }
                      }}
                    >
                      Sync Google Classroom
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 min-w-[280px]">
            <UpcomingEvents classes={classes} assignments={assignments} />
          </div>
        </div>

        <JoinClassDialog
          open={joinDialogOpen}
          onOpenChange={setJoinDialogOpen}
          onJoinSuccess={() => window.location.reload()} // For now just reload to refresh data
        />

        <CreateClassDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => window.location.reload()}
        />
      </main>
    </div>
  );
}
