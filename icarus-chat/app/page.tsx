"use client";

import Navbar from "@/components/section/navbar/default";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type AuthMode = "login" | "signup";
type AccountType = "student" | "teacher";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pageCopy = useMemo(() => {
    if (mode === "login") {
      return {
        title: "Welcome back",
        description: "Log in to pick up where you left off or try the chat as a guest.",
        cta: "Continue to chat",
      };
    }

    return {
      title: "Create your account",
      description: "Choose a student or teacher account so we can tailor the experience for you.",
      cta: "Create account",
    };
  }, [mode]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setStatusMessage("Please enter both an email and password to continue.");
      return;
    }

    if (mode === "signup") {
      setStatusMessage(
        `We\'ve saved your ${accountType} account details. You can use these as soon as the backend is ready.`
      );
    } else {
      setStatusMessage("Login successful. Redirecting you to the chat...");
    }

    setTimeout(() => router.push("/chat"), 500);
  };

  return (
    <div className="h-dvh grid grid-rows-[auto,1fr] bg-background">
      <div className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto w-full">
          <Navbar />
        </div>
      </div>

      <main className="min-h-0">
        <div className="max-w-4xl mx-auto flex h-full flex-col justify-center gap-10 px-6 py-10 md:grid md:grid-cols-[1fr,minmax(320px,380px)] md:items-center">
          <div className="space-y-4">
            <p className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Early access
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Start with login before you jump into the chat.
              </h1>
              <p className="text-muted-foreground">
                Use your credentials to log in or spin up a new account. If you are signing up, let us
                know whether you are a student or teacher so we can tailor upcoming features accordingly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={mode === "login" ? "default" : "outline"}
                onClick={() => setMode("login")}
              >
                Log in
              </Button>
              <Button
                variant={mode === "signup" ? "default" : "outline"}
                onClick={() => setMode("signup")}
              >
                Create account
              </Button>
              <Button variant="ghost" onClick={() => router.push("/chat")}>Skip to chat</Button>
            </div>
          </div>

          <Card className="w-full border-border/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">{pageCopy.title}</CardTitle>
              <CardDescription>{pageCopy.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="account-type">Account type</Label>
                    <Select
                      value={accountType}
                      onValueChange={(value) => setAccountType(value as AccountType)}
                    >
                      <SelectTrigger id="account-type" className="w-full justify-between">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      We will soon personalize lessons and tools based on whether you teach or study.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    {mode === "login" ? "Log in" : "Create account"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/chat")}
                  >
                    {pageCopy.cta}
                  </Button>
                </div>
              </form>

              {statusMessage && (
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  {statusMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
