"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  GraduationCap,
  Loader2,
  Plus,
  Users,
} from "lucide-react";

import Navbar from "@/components/section/navbar/default";
import { authStore } from "@/app/lib/auth/authStore";
import {
  createAssignment,
  listAssignments,
  listClasses,
  createFile,
  listStudents,
  listTeachers,
} from "@/app/lib/api/school";
import { listUsers } from "@/app/lib/api/auth";
import { postUpload } from "@/app/lib/api/upload";
import {
  AssignmentCreate,
  AssignmentRead,
  ClassRead,
  StudentRead,
  TeacherRead,
} from "@/app/types/school";
import { User } from "@/app/types/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AssignmentFormState {
  title: string;
  description: string;
  dueDate: string;
}

interface AssignmentAnalytics {
  confusionRate: number;
  hardestQuestion: string;
  strongestQuestion: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<TeacherRead | null>(null);
  const [classes, setClasses] = useState<ClassRead[]>([]);
  const [students, setStudents] = useState<StudentRead[]>([]);
  const [usersById, setUsersById] = useState<Record<number, User>>({});
  const [assignments, setAssignments] = useState<AssignmentRead[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>({
    title: "",
    description: "",
    dueDate: "",
  });

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
        if (!currentUser.is_teacher) {
          router.replace("/student");
          return;
        }
        setUser(currentUser);
        fetchDashboardData(currentUser);
      })
      .catch(() => {
        router.replace("/");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const fetchDashboardData = async (currentUser: User) => {
    setLoading(true);
    setError(null);
    try {
      const [teacherList, classList, studentList, assignmentList, userList] = await Promise.all([
        listTeachers(),
        listClasses(),
        listStudents(),
        listAssignments(),
        listUsers(),
      ]);

      const teacherRecord = teacherList.find((entry) => entry.user_id === currentUser.id) ?? null;
      setTeacher(teacherRecord);

      const teacherIdentifier = teacherRecord?.id ?? currentUser.id;
      const teacherClasses = teacherIdentifier
        ? classList.filter((classItem) => classItem.teacher_id === teacherIdentifier)
        : [];

      setClasses(teacherClasses);
      setStudents(studentList);
      setUsersById(
        userList.reduce<Record<number, User>>((acc, entry) => {
          if (entry.id === undefined) return acc;
          return { ...acc, [entry.id]: entry };
        }, {}),
      );

      const teacherAssignments = assignmentList.filter((assignment) =>
        teacherClasses.some((classItem) => classItem.id === assignment.class_id),
      );
      setAssignments(teacherAssignments);

      if (teacherClasses.length && !selectedClassId) {
        setSelectedClassId(teacherClasses[0].id);
      }
    } catch (err) {
      setError("Unable to load your dashboard right now.");
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = useMemo(
    () => classes.find((classItem) => classItem.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const studentsInSelectedClass = useMemo(
    () =>
      selectedClassId
        ? students.filter((student) => student.class_ids?.includes(selectedClassId))
        : [],
    [selectedClassId, students],
  );

  const assignmentsForSelectedClass = useMemo(
    () => assignments.filter((assignment) => assignment.class_id === selectedClassId),
    [assignments, selectedClassId],
  );

  const analyticsForAssignment = (assignment: AssignmentRead): AssignmentAnalytics => {
    const base = (assignment.id % 7) * 10;
    const confusionRate = Math.min(95, 20 + base);
    const hardestQuestion = `Question ${(assignment.id % 5) + 1}`;
    const strongestQuestion = `Question ${((assignment.id + 2) % 5) + 1}`;

    return {
      confusionRate,
      hardestQuestion,
      strongestQuestion,
    };
  };

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({ title: "", description: "", dueDate: "" });
    setAssignmentFile(null);
  };

  const handleCreateAssignment = async () => {
    if (!selectedClassId || !user) return;

    if (assignmentFile && assignmentFile.type !== "application/pdf") {
      setError("Only PDF files are supported for assignments right now.");
      return;
    }

    setCreatingAssignment(true);
    setError(null);

    try {
      const payload: AssignmentCreate = {
        title: assignmentForm.title,
        description: assignmentForm.description,
        due_at: assignmentForm.dueDate ? new Date(assignmentForm.dueDate) : undefined,
        class_id: selectedClassId,
        teacher_id: teacher?.id ?? user.id,
      };

      const newAssignment = await createAssignment(payload);

      if (assignmentFile) {
        const uploadResult = await postUpload(assignmentFile);
        await createFile({
          filename: uploadResult.filename,
          path: uploadResult.filename,
          assignment_id: newAssignment.id,
        });
      }

      setAssignments((prev) => [newAssignment, ...prev]);
      setShowAssignmentDialog(false);
      resetAssignmentForm();
    } catch (err) {
      setError("Could not create assignment just yet. Please try again.");
    } finally {
      setCreatingAssignment(false);
    }
  };

  if (loading) {
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
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Your classes</CardTitle>
                    <CardDescription>Navigate between your sections.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {classes.length} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No classes found. Add a class in the school admin to get started.
                  </p>
                ) : (
                  <ScrollArea className="h-[320px] pr-3">
                    <div className="space-y-2">
                      {classes.map((classItem) => (
                        <button
                          key={classItem.id}
                          type="button"
                          onClick={() => setSelectedClassId(classItem.id)}
                          className={cn(
                            "w-full rounded-lg border px-4 py-3 text-left transition hover:border-primary/60",
                            selectedClassId === classItem.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-transparent bg-background",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium leading-tight">{classItem.name}</p>
                              {classItem.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {classItem.description}
                                </p>
                              )}
                            </div>
                            <Badge variant={selectedClassId === classItem.id ? "default" : "outline"}>
                              {classItem.student_ids.length} students
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4" />
                  Teacher profile
                </CardTitle>
                <CardDescription>Context from the school roster.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Logged in as</span>
                  <span className="font-medium">{user?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Teacher record</span>
                  <span className="font-medium">{teacher?.id ?? "Pending setup"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Classes linked</span>
                  <span className="font-medium">{classes.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current class</p>
                <h2 className="text-2xl font-semibold leading-tight">
                  {selectedClass ? selectedClass.name : "Select a class"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => fetchDashboardData(user!)} disabled={loading}>
                  Refresh data
                </Button>
                <Button onClick={() => setShowAssignmentDialog(true)} disabled={!selectedClass}>
                  <Plus className="mr-2 h-4 w-4" />
                  New assignment
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>Students</CardDescription>
                  <CardTitle className="text-3xl font-semibold">
                    {studentsInSelectedClass.length || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Assignments</CardDescription>
                  <CardTitle className="text-3xl font-semibold">
                    {assignmentsForSelectedClass.length || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Roster coverage</CardDescription>
                  <CardTitle className="text-3xl font-semibold">
                    {selectedClass ? `${selectedClass.student_ids.length} enrolled` : "—"}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Students
                  </CardTitle>
                  <CardDescription>Roster pulled from the school service.</CardDescription>
                </div>
                <Badge variant="outline">{studentsInSelectedClass.length} in class</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {studentsInSelectedClass.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No students are attached to this class yet.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {studentsInSelectedClass.map((student) => (
                      <div
                        key={student.id}
                        className="rounded-lg border bg-background px-4 py-3 text-sm shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {usersById[student.user_id]?.username ?? `Student #${student.id}`}
                          </span>
                          <Badge variant="secondary">Enrolled</Badge>
                        </div>
                        <p className="text-muted-foreground">User ID: {student.user_id}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpenText className="h-4 w-4" />
                    Assignments
                  </CardTitle>
                  <CardDescription>Includes upcoming analytics hooks.</CardDescription>
                </div>
                <Badge variant="outline">{assignmentsForSelectedClass.length} total</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignmentsForSelectedClass.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No assignments yet. Create one to start collecting insights.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {assignmentsForSelectedClass.map((assignment) => {
                      const analytics = analyticsForAssignment(assignment);
                      return (
                        <div
                          key={assignment.id}
                          className="rounded-xl border bg-background/60 p-4 shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold leading-tight">
                                {assignment.title}
                              </h3>
                              {assignment.description && (
                                <p className="text-sm text-muted-foreground">
                                  {assignment.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <BarChart3 className="h-3.5 w-3.5" />
                              Analytics ready soon
                            </Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-lg bg-muted/40 p-3">
                              <p className="text-xs uppercase text-muted-foreground">
                                Confusion rate
                              </p>
                              <p className="text-2xl font-semibold">{analytics.confusionRate}%</p>
                              <p className="text-xs text-muted-foreground">
                                Future endpoint: % of students who indicate confusion.
                              </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-3">
                              <p className="text-xs uppercase text-muted-foreground">
                                Hardest question
                              </p>
                              <p className="text-base font-medium">{analytics.hardestQuestion}</p>
                              <p className="text-xs text-muted-foreground">
                                Future endpoint: question with the most struggle.
                              </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-3">
                              <p className="text-xs uppercase text-muted-foreground">
                                Most understood
                              </p>
                              <p className="text-base font-medium">{analytics.strongestQuestion}</p>
                              <p className="text-xs text-muted-foreground">
                                Future endpoint: question students get right away.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create assignment</DialogTitle>
            <DialogDescription>
              Publish a new assignment for {selectedClass?.name ?? "your class"}. Analytics will be displayed once data is
              available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="assignment-title">
                Title
              </label>
              <Input
                id="assignment-title"
                value={assignmentForm.title}
                onChange={(event) =>
                  setAssignmentForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Ex: Unit 3 comprehension check"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="assignment-description">
                Description
              </label>
              <Textarea
                id="assignment-description"
                value={assignmentForm.description}
                onChange={(event) =>
                  setAssignmentForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="What should students focus on?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="assignment-due">
                Due date (optional)
              </label>
              <Input
                id="assignment-due"
                type="date"
                value={assignmentForm.dueDate}
                onChange={(event) =>
                  setAssignmentForm((prev) => ({ ...prev, dueDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="assignment-file">
                Attachment (PDF only)
              </label>
              <Input
                id="assignment-file"
                type="file"
                accept="application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setAssignmentFile(file ?? null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Optional: attach a PDF for students to reference. Uploads will be linked to the assignment.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAssignment}
              disabled={!assignmentForm.title || creatingAssignment || !selectedClass}
            >
              {creatingAssignment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
