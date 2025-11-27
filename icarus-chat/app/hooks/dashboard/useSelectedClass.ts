"use client";

import { useEffect, useMemo, useState } from "react";

import { ClassRead } from "@/app/types/school";

interface UseSelectedClassResult {
  selectedClassId: number | null;
  selectedClass: ClassRead | null;
  setSelectedClassId: (id: number) => void;
}

export function useSelectedClass(classes: ClassRead[]): UseSelectedClassResult {
  const [selectedClassId, setSelectedClassIdState] = useState<number | null>(null);

  useEffect(() => {
    if (classes.length === 0) return;
    setSelectedClassIdState((current) => current ?? classes[0].id ?? null);
  }, [classes]);

  const selectedClass = useMemo(
    () => classes.find((classItem) => classItem.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const setSelectedClassId = (id: number) => setSelectedClassIdState(id);

  return { selectedClassId, selectedClass, setSelectedClassId };
}
