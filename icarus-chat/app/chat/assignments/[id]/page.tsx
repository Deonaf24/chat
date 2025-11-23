"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ChatLayout from "@/components/section/chatlayout/default";
import { authStore } from "@/app/lib/auth/authStore";
import { getAssignment, getFile } from "@/app/lib/api/school";
import { AssignmentRead, FileRead } from "@/app/types/school";
import { Button } from "@/components/ui/button";

export default function AssignmentChatPage() {
  const params = useParams();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<AssignmentRead | null>(null);
  const [files, setFiles] = useState<FileRead[]>([]);
  const [error, setError] = useState<string | null>(null);

  const assignmentId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    return Number.isNaN(numericId) ? null : numericId;
  }, [params]);

  useEffect(() => {
    let isMounted = true;

    authStore
      .hydrate()
      .then((user) => {
        if (!isMounted) return;
        if (!user) {
          router.replace("/");
          return;
        }
        if (user.is_teacher) {
          router.replace("/dashboard");
          return;
        }
        setCheckingAuth(false);
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    if (!assignmentId) {
      setError("Invalid assignment.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const assignmentRecord = await getAssignment(assignmentId);
        const relatedFiles = assignmentRecord.file_ids?.length
          ? await Promise.all(assignmentRecord.file_ids.map((fileId) => getFile(fileId)))
          : [];
        if (!isMounted) return;
        setAssignment(assignmentRecord);
        setFiles(relatedFiles);
      } catch (err) {
        if (!isMounted) return;
        setError("Unable to load this assignment right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [assignmentId, checkingAuth]);

  if (checkingAuth || loading) {
    return (
      <div className="grid h-dvh place-items-center px-6">
        <p className="text-sm text-muted-foreground">Loading assignment chat...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="grid h-dvh place-items-center px-6">
        <div className="max-w-md space-y-3 text-center">
          <p className="text-lg font-semibold">Unable to open assignment chat</p>
          <p className="text-sm text-muted-foreground">{error ?? "This assignment could not be found."}</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>Go back</Button>
            <Button onClick={() => router.replace("/student")}>Student dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatLayout
      assignment={{
        title: assignment.title,
        description: assignment.description,
        dueAt: assignment.due_at,
        files,
      }}
    />
  );
}
