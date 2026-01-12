"use client";

import { useCallback, useState } from "react";

import { createAssignment, uploadAssignmentFile } from "@/app/lib/api/school";
import { AssignmentCreate, AssignmentRead, TeacherRead } from "@/app/types/school";
import { User } from "@/app/types/auth";

interface AssignmentFormState {
  title: string;
  description: string;
  dueDate: string;
  level: number;
}

interface UseAssignmentFormArgs {
  selectedClassId: number | null;
  user: User | null;
  teacher: TeacherRead | null;
  onAssignmentCreated?: (assignment: AssignmentRead) => void;
}

interface UseAssignmentFormResult {
  assignmentForm: AssignmentFormState;
  assignmentFile: File | null;
  creatingAssignment: boolean;
  error: string | null;
  showDialog: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  updateAssignmentForm: (updates: Partial<AssignmentFormState>) => void;
  handleFileChange: (file: File | null) => void;
  handleCreateAssignment: () => Promise<void>;
}

export function useAssignmentForm({
  selectedClassId,
  user,
  teacher,
  onAssignmentCreated,
}: UseAssignmentFormArgs): UseAssignmentFormResult {
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>({
    title: "",
    description: "",
    dueDate: "",
    level: 1,
  });
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const resetForm = () => {
    setAssignmentForm({ title: "", description: "", dueDate: "", level: 1 });
    setAssignmentFile(null);
  };

  const updateAssignmentForm = (updates: Partial<AssignmentFormState>) => {
    setAssignmentForm((previous) => ({ ...previous, ...updates }));
  };

  const handleFileChange = (file: File | null) => {
    setAssignmentFile(file);
  };

  const handleCreateAssignment = useCallback(async () => {
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
        level: assignmentForm.level,
      };

      const newAssignment = await createAssignment(payload);

      if (assignmentFile) {
        await uploadAssignmentFile(newAssignment.id, assignmentFile);
      }

      onAssignmentCreated?.(newAssignment);
      setShowDialog(false);
      resetForm();
    } catch (creationError) {
      setError("Could not create assignment just yet. Please try again.");
    } finally {
      setCreatingAssignment(false);
    }
  }, [assignmentFile, assignmentForm, onAssignmentCreated, selectedClassId, teacher?.id, user]);

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  return {
    assignmentForm,
    assignmentFile,
    creatingAssignment,
    error,
    showDialog,
    openDialog,
    closeDialog,
    updateAssignmentForm,
    handleFileChange,
    handleCreateAssignment,
  };
}
