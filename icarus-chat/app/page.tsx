"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authStore } from "@/app/lib/auth/authStore";
import { LoginDialog, SignUpDialog } from "@/components/ui/custom/auth-dialogs";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    authStore.hydrate().then((user) => {
      if (!isMounted) return;
      if (user) router.replace("/chat");
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleAuthSuccess = () => {
    router.push("/chat");
  };

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 px-6 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-24 top-24 -z-10 h-60 w-60 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-10 left-20 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center">
        <div className="space-y-4">

          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-10xl">
            Socratica
          </h1>
          <p className="text-lg text-muted-foreground">
            Log in or create an account
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" onClick={() => setLoginOpen(true)}>
            Log in
          </Button>
          <Button size="lg" variant="outline" onClick={() => setSignUpOpen(true)}>
            Sign up
          </Button>
        </div>
      </div>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onAuthSuccess={handleAuthSuccess}
      />
      <SignUpDialog
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
        onAuthSuccess={handleAuthSuccess}
      />
    </main>
  );
}
