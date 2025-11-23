"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ChatLayout from "@/components/section/chatlayout/default";
import { authStore } from "@/app/lib/auth/authStore";

export default function ChatPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

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
        router.replace("/student");
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

  return <ChatLayout />;
}
