"use client";

import Navbar from "@/components/section/navbar/default";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "signup";
type AccountType = "student" | "teacher";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/chat");
  };

  return (
    <div className="h-dvh grid grid-rows-[auto,1fr] bg-background">
      <div className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto w-full">
          <Navbar />
        </div>
      </div>

      <main className="min-h-0">
        <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 py-12">
          <div className="mb-8 w-full text-center md:mb-12">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to Icarus Chat</h1>
            <p className="text-sm text-muted-foreground">Access your workspace or create an account to get started.</p>
          </div>

          <Card className="w-full max-w-xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "login" ? "default" : "outline"}
                    onClick={() => setMode("login")}
                  >
                    Log in
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={mode === "signup" ? "default" : "outline"}
                    onClick={() => setMode("signup")}
                  >
                    Sign up
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/chat")}>Continue to chat</Button>
              </div>
              <div className="pt-2">
                <CardTitle className="text-2xl font-semibold">
                  {mode === "login" ? "Sign in" : "Create account"}
                </CardTitle>
                <CardDescription>
                  {mode === "login" ? "Enter your credentials to continue." : "Choose your role and set your credentials."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
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
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    {mode === "login" ? "Log in" : "Create account"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/chat")}>
                    Continue without signing in
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
