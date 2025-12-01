"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authStore } from "@/app/lib/auth/authStore";
import { User } from "@/app/types/auth";

export function useAuthUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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
        setUser(currentUser);
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { user };
}
