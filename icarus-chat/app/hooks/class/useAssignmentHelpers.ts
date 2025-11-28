"use client";

import { AssignmentRead } from "@/app/types/school";

const fortyEightHoursMs = 48 * 60 * 60 * 1000;

export function isDueSoon(assignment: AssignmentRead) {
  if (!assignment.due_at) return false;
  const dueTime = new Date(assignment.due_at).getTime();
  const now = Date.now();

  return dueTime - now <= fortyEightHoursMs && dueTime >= now;
}

export function formatDueDate(assignment: AssignmentRead) {
  if (!assignment.due_at) return "No due date";

  return new Date(assignment.due_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
