"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { authStore } from "@/app/lib/auth/authStore";
import {
  getClass,
  getStudent,
  listAssignments,
  listClasses,
  listStudents,
  listTeachers,
} from "@/app/lib/api/school";
import { listUsers } from "@/app/lib/api/auth";
import { ClassRead, TeacherRead, AssignmentRead, StudentRead } from "@/app/types/school";
import { User } from "@/app/types/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlarmClock, Home, Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function ClassPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [classData, setClassData] = useState<ClassRead | null>(null);
  const [teachers, setTeachers] = useState<TeacherRead[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
  const [usersById, setUsersById] = useState<Record<number, User>>({});
  const [classes, setClasses] = useState<ClassRead[]>([]);
  const [student, setStudent] = useState<StudentRead | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/");
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (user && classId) {
      fetchClassData(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, classId]);

  const fetchClassData = async (currentUser: User) => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    try {
      const [classRecord, teacherList, assignmentList, userList, classList, studentList] =
        await Promise.all([
        getClass(classId),
        listTeachers(),
        listAssignments(),
        listUsers(),
        listClasses(),
        listStudents(),
      ]);

      const studentRecord = studentList.find((entry) => entry.user_id === currentUser.id) ?? null;
      const detailedStudent = studentRecord ? await getStudent(studentRecord.id) : null;

      setClassData(classRecord);
      setTeachers(teacherList);
      const classAssignments = assignmentList
        .filter((assignment) => assignment.class_id === classId)
        .sort((a, b) => {
          const timeA = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
          const timeB = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
          return timeA - timeB;
        });
      setAssignments(classAssignments);
      setUsersById(
        userList.reduce<Record<number, User>>((acc, entry) => {
          if (entry.id === undefined) return acc;
          return { ...acc, [entry.id]: entry };
        }, {}),
      );

      if (detailedStudent) {
        const enrolledClassIds = detailedStudent.class_ids ?? [];
        const enrolledClasses = classList.filter(
          (classItem) =>
            enrolledClassIds.includes(classItem.id) || classItem.student_ids?.includes(detailedStudent.id),
        );
        setClasses(enrolledClasses);
        setStudent(detailedStudent);
      } else {
        setClasses([]);
        setStudent(null);
      }
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

  const isDueSoon = (assignment: AssignmentRead) => {
    if (!assignment.due_at) return false;
    const dueTime = new Date(assignment.due_at).getTime();
    const now = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;

    return dueTime - now <= fortyEightHoursMs && dueTime >= now;
  };

  const formatDueDate = (assignment: AssignmentRead) => {
    if (!assignment.due_at) return "No due date";
    return new Date(assignment.due_at).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar actions={[{ text: "Logout", onClick: handleLogout }]} />
      <div className="fixed left-4 top-20 z-40 md:left-6">
        <Button
          variant="outline"
          size="icon"
          className="shadow-sm"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open class sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-80">
          <div className="flex flex-col gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Quick navigation</p>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Classes</h2>
                <Badge variant="secondary">{classes.length}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  router.push("/student");
                  setSidebarOpen(false);
                }}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <div className="rounded-lg border bg-muted/40 p-2">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : classes.length ? (
                  <div className="space-y-2">
                    {classes.map((classItem) => (
                      <Button
                        key={classItem.id}
                        variant={classItem.id === classId ? "secondary" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => {
                          router.push(`/classes/${classItem.id}`);
                          setSidebarOpen(false);
                        }}
                      >
                        <span className="truncate text-left">{classItem.name}</span>
                        {classItem.id === classId ? <Badge variant="outline">Viewing</Badge> : null}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 text-sm text-muted-foreground">No enrolled classes yet.</p>
                )}
              </div>
            </div>
            {student ? (
              <p className="text-xs text-muted-foreground">Signed in as {user?.username ?? "Student"}</p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
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
          <>
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

            <Card>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle>Assignments</CardTitle>
                  <CardDescription>Upcoming work for this class.</CardDescription>
                </div>
                <Badge variant="outline">{assignments.length} total</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assignments yet for this class.</p>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="group cursor-pointer rounded-xl border bg-background/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        onClick={() => router.push(`/chat/assignments/${assignment.id}`)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Assignment</Badge>
                              {isDueSoon(assignment) ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlarmClock className="h-3.5 w-3.5" />
                                  Due soon
                                </Badge>
                              ) : null}
                            </div>
                            <h3 className="text-lg font-semibold leading-tight">{assignment.title}</h3>
                            {assignment.description ? (
                              <p className="text-sm text-muted-foreground">{assignment.description}</p>
                            ) : null}
                          </div>
                          <Badge variant="outline">Due {formatDueDate(assignment)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
