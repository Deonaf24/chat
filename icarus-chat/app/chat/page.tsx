"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ChatLayout from "@/components/section/chatlayout/default";
import { authStore } from "@/app/lib/auth/authStore";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  // Fix: Access user from the hook or state properly. 
  // Since we are in a client component, we can use a hook or rely on the hydration result if we stored it.
  // But simpler: just use the local storage or wait for hydration?
  // Actually, we are checking `checking` state which blocks render until hydration. 
  // But we need `isTeacher` for the render return.
  // Let's use a state initialized during hydration.

  const [isTeacher, setIsTeacher] = useState(false);

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
        setIsTeacher(!!user.is_teacher);
        setChecking(false);
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="grid h-dvh place-items-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  const initialPrompt = searchParams.get("prompt") || undefined;
  const classIdParam = searchParams.get("classId");
  const associatedClassId = classIdParam ? parseInt(classIdParam) : undefined;

  // Mock assignment context for Lesson Planning
  // Determine Context based on User Role.

  const planningContext = isTeacher ? {
    id: "planning",
    title: "Lesson Planner",
    description: "AI Assistant for lesson planning",
    level: 2
  } : {
    id: "study-planning",
    title: "Study Planner",
    description: "AI Assistant for study planning",
    level: 1
  };

  return <ChatLayout assignment={planningContext} initialPrompt={initialPrompt} associatedClassId={associatedClassId} />;
}
