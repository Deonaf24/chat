"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  AssignmentConceptDetail,
  AssignmentQuestion,
  AssignmentStructureProposal,
  QuestionConceptLink,
} from "@/app/types/assignmentStructure";

interface UseAssignmentStructureOptions {
  assignmentId?: number | null;
  initialStructure?: AssignmentStructureProposal | null;
}

interface UseAssignmentStructureResult {
  structure: AssignmentStructureProposal | null;
  assignmentConceptIds: number[];
  setStructure: (structure: AssignmentStructureProposal | null) => void;
  addConcept: () => void;
  updateConcept: (index: number, updates: Partial<AssignmentConceptDetail>) => void;
  removeConcept: (conceptId: number) => void;
  addQuestion: () => void;
  updateQuestion: (index: number, updates: Partial<AssignmentQuestion>) => void;
  removeQuestion: (questionId: number) => void;
  updateAssignmentConceptIds: (conceptIds: number[]) => void;
  buildPayload: (options?: { approve?: boolean }) => AssignmentStructureProposal | null;
}

const createQuestionConceptLinks = (questions: AssignmentQuestion[]): QuestionConceptLink[] =>
  questions.flatMap((question) =>
    question.concept_ids.map((conceptId) => ({
      question_id: question.id,
      concept_id: conceptId,
    }))
  );

export function useAssignmentStructure({
  assignmentId,
  initialStructure = null,
}: UseAssignmentStructureOptions = {}): UseAssignmentStructureResult {
  const [structure, setStructure] = useState<AssignmentStructureProposal | null>(initialStructure);
  const tempIdRef = useRef(-1);

  const assignmentConceptIds = useMemo(
    () => (structure ? structure.assignment_concepts.map((item) => item.concept_id) : []),
    [structure]
  );

  const addConcept = useCallback(() => {
    setStructure((prev) => {
      if (!prev) return prev;
      const newConcept: AssignmentConceptDetail = {
        id: tempIdRef.current--,
        name: "",
        description: "",
      };
      return { ...prev, concepts: [...prev.concepts, newConcept] };
    });
  }, []);

  const updateConcept = useCallback((index: number, updates: Partial<AssignmentConceptDetail>) => {
    setStructure((prev) => {
      if (!prev) return prev;
      const concepts = [...prev.concepts];
      concepts[index] = { ...concepts[index], ...updates };
      return { ...prev, concepts };
    });
  }, []);

  const removeConcept = useCallback((conceptId: number) => {
    setStructure((prev) => {
      if (!prev) return prev;
      const concepts = prev.concepts.filter((concept) => concept.id !== conceptId);
      const questions = prev.questions.map((question) => ({
        ...question,
        concept_ids: question.concept_ids.filter((id) => id !== conceptId),
      }));
      const assignment_concepts = prev.assignment_concepts.filter((item) => item.concept_id !== conceptId);
      return { ...prev, concepts, questions, assignment_concepts };
    });
  }, []);

  const addQuestion = useCallback(() => {
    setStructure((prev) => {
      if (!prev) return prev;
      const newQuestion: AssignmentQuestion = {
        id: tempIdRef.current--,
        assignment_id: prev.assignment_id ?? assignmentId ?? 0,
        prompt: "",
        position: prev.questions.length + 1,
        concept_ids: [],
      };
      return { ...prev, questions: [...prev.questions, newQuestion] };
    });
  }, [assignmentId]);

  const updateQuestion = useCallback((index: number, updates: Partial<AssignmentQuestion>) => {
    setStructure((prev) => {
      if (!prev) return prev;
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], ...updates };
      return { ...prev, questions };
    });
  }, []);

  const removeQuestion = useCallback((questionId: number) => {
    setStructure((prev) => {
      if (!prev) return prev;
      const questions = prev.questions.filter((question) => question.id !== questionId);
      return { ...prev, questions };
    });
  }, []);

  const updateAssignmentConceptIds = useCallback((conceptIds: number[]) => {
    setStructure((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        assignment_concepts: conceptIds.map((concept_id) => ({ concept_id })),
      };
    });
  }, []);

  const buildPayload = useCallback(
    (options?: { approve?: boolean }) => {
      if (!structure) return null;
      return {
        ...structure,
        structure_approved: options?.approve ?? structure.structure_approved,
        question_concepts: createQuestionConceptLinks(structure.questions),
      };
    },
    [structure]
  );

  return {
    structure,
    assignmentConceptIds,
    setStructure,
    addConcept,
    updateConcept,
    removeConcept,
    addQuestion,
    updateQuestion,
    removeQuestion,
    updateAssignmentConceptIds,
    buildPayload,
  };
}
