"use client";

import { useCallback, useState } from "react";

import { joinClassByCode } from "@/app/lib/api/school";
import { StudentRead } from "@/app/types/school";

interface UseJoinClassResult {
  joinOpen: boolean;
  setJoinOpen: (open: boolean) => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  joining: boolean;
  joinError: string | null;
  handleJoin: () => Promise<void>;
}

export function useJoinClass(
  student: StudentRead | null,
  refresh: () => Promise<void>,
): UseJoinClassResult {
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoin = useCallback(async () => {
    if (!student) return;

    setJoining(true);
    setJoinError(null);

    try {
      await joinClassByCode(joinCode, student.id);
      setJoinCode("");
      setJoinOpen(false);
      await refresh();
    } catch (error) {
      setJoinError("Unable to join class with that code. Please try again.");
    } finally {
      setJoining(false);
    }
  }, [joinCode, refresh, student]);

  return {
    joinOpen,
    setJoinOpen,
    joinCode,
    setJoinCode,
    joining,
    joinError,
    handleJoin,
  };
}
