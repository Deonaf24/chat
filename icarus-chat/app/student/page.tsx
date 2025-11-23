"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { authStore } from "@/app/lib/auth/authStore";
import {
  getStudent,
  joinClassByCode,
  listClasses,
  listStudents,
  listTeachers,
} from "@/app/lib/api/school";
import { listUsers } from "@/app/lib/api/auth";
import { ClassRead, StudentRead, TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const accentGradients = [
  "from-primary/80 to-primary/60",
  "from-emerald-500/80 to-emerald-400/70",
  "from-blue-500/80 to-cyan-400/70",
  "from-orange-500/80 to-amber-400/70",
  "from-purple-500/80 to-fuchsia-500/70",
];

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentRead | null>(null);
  const [classes, setClasses] = useState<ClassRead[]>([]);
  const [teachers, setTeachers] = useState<TeacherRead[]>([]);
  const [usersById, setUsersById] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

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
        if (currentUser.is_teacher) {
          router.replace("/dashboard");
          return;
        }
        setUser(currentUser);
        fetchStudentData(currentUser);
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

  const fetchStudentData = async (currentUser: User) => {
    setLoading(true);
    setError(null);
    try {
      const [studentList, classList, teacherList, userList] = await Promise.all([
        listStudents(),
        listClasses(),
        listTeachers(),
        listUsers(),
      ]);

      const studentRecord = studentList.find((entry) => entry.user_id === currentUser.id);
      if (!studentRecord) {
        setError("We couldn't find your student profile.");
        setStudent(null);
        setClasses([]);
        return;
      }

      const detailedStudent = await getStudent(studentRecord.id);
      const enrolledClassIds = detailedStudent.class_ids ?? [];
      const enrolledClasses = classList.filter(
        (classItem) =>
          enrolledClassIds.includes(classItem.id) || classItem.student_ids?.includes(detailedStudent.id),
      );

      setStudent(detailedStudent);
      setClasses(enrolledClasses);
      setTeachers(teacherList);
      setUsersById(userList.reduce((acc, entry) => ({ ...acc, [entry.id]: entry }), {}));
    } catch (err) {
      setError("Unable to load your classes right now.");
    } finally {
      setLoading(false);
    }
  };

  const teacherUsernames = useMemo(() => {
    return teachers.reduce<Record<number, string>>((acc, teacher) => {
      const username = usersById[teacher.user_id]?.username ?? "Teacher";
      return { ...acc, [teacher.id]: username };
    }, {});
  }, [teachers, usersById]);

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  const handleJoinClass = async () => {
    if (!student || !user) return;
    setJoining(true);
    setJoinError(null);
    try {
      await joinClassByCode(joinCode, student.id);
      setJoinCode("");
      setJoinOpen(false);
      await fetchStudentData(user);
    } catch (err) {
      setJoinError("Unable to join class with that code. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleNavigateToClass = (classId: number) => {
    router.push(`/classes/${classId}`);
  };

  const renderClassBubble = (classItem: ClassRead, index: number) => {
    const gradient = accentGradients[index % accentGradients.length];
    const teacherName = classItem.teacher_id ? teacherUsernames[classItem.teacher_id] : "";

    return (
      <Card
        key={classItem.id}
        className={cn(
          "group cursor-pointer overflow-hidden border-none shadow-md transition hover:-translate-y-0.5",
          "bg-gradient-to-br text-primary-foreground",
        )}
        onClick={() => handleNavigateToClass(classItem.id)}
      >
        <div className={cn("h-2 w-full", `bg-gradient-to-r ${gradient}`)} />
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-foreground drop-shadow-sm">
            {classItem.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-base text-muted-foreground">
            <Badge variant="secondary" className="bg-background/80 text-foreground shadow-sm">
              Class
            </Badge>
            {teacherName ? (
              <span className="text-sm text-muted-foreground">Taught by {teacherName}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Teacher assignment pending</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar
        actions={[
          { text: "Logout", onClick: handleLogout },
        ]}
      />

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-10">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Welcome back</p>
            <h1 className="text-4xl font-semibold leading-tight">
              {user ? `${user.username}'s classes` : "Your classes"}
            </h1>
            <p className="text-muted-foreground">Keep up with your courses and join new ones.</p>
          </div>
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full">
                +
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a class</DialogTitle>
                <DialogDescription>
                  Enter the class join code provided by your teacher to enroll.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Input
                  placeholder="Enter join code"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  disabled={joining}
                />
                {joinError ? <p className="text-sm text-destructive">{joinError}</p> : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setJoinOpen(false)} disabled={joining}>
                  Cancel
                </Button>
                <Button onClick={handleJoinClass} disabled={joining || !joinCode.trim()}>
                  {joining ? "Joining..." : "Join"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : classes.length ? (
          <div className="flex flex-col gap-4">
            {classes.map((classItem, index) => renderClassBubble(classItem, index))}
          </div>
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
