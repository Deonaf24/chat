"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

export function useClassId() {
  const params = useParams();

  return useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;

    const idValue = Array.isArray(idParam) ? idParam[0] : idParam;
    const numericId = Number.parseInt(idValue, 10);

    return Number.isNaN(numericId) ? null : numericId;
  }, [params]);
}
