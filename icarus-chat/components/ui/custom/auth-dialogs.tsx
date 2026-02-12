"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { isAxiosError } from "axios";

import { authStore } from "@/app/lib/auth/authStore";
import { User } from "@/app/types/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
      fill="#4285F4"
    />
    <path
      d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
      fill="#34A853"
    />
    <path
      d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
      fill="#FBBC04"
    />
    <path
      d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
      fill="#EA4335"
    />
  </svg>
);

const SCOPES_ENV = process.env.NEXT_PUBLIC_GOOGLE_SCOPES || "";
const SCOPES_LIST = SCOPES_ENV ? SCOPES_ENV.split(" ") : [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/drive.readonly",
  "openid",
  "email",
  "profile"
];

console.log("Requested Scopes:", SCOPES_LIST.join(" "));

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: (user: User) => void;
}

const defaultError = "Something went wrong. Please try again.";

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { detail?: string } | string | undefined;
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;
  }
  return defaultError;
};

export function LoginDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setError(null);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const user = await authStore.googleLogin({ code: codeResponse.code, is_teacher: false, is_signup: false });
        onAuthSuccess?.(user);
        onOpenChange(false);
        reset();
      } catch (e) {
        setError("Google Login Failed");
      }
    },
    onError: () => {
      setError("Google Login Failed");
    },
    flow: 'auth-code',
    scope: SCOPES_LIST.join(" "),
    // @ts-ignore
    prompt: 'consent'
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await authStore.login(email, password);
      onAuthSuccess?.(user);
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const disableSubmit = loading || !email || !password;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log in</DialogTitle>
          <DialogDescription>
            Access your workspace with your email and password.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              value={email}
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={disableSubmit}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log in
            </Button>
          </DialogFooter>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => googleLogin()}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >
  );
}

export function SignUpDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [step, setStep] = useState<'form' | 'role_selection'>('form');
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep('form');
    setGoogleToken(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("student");
    setError(null);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const requiredMissing = useMemo(
    () =>
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      loading,
    [confirmPassword, email, firstName, lastName, loading, password],
  );

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setGoogleToken(codeResponse.code);
      setStep('role_selection');
      setError(null);
    },
    onError: () => {
      setError("Google Login Failed");
    },
    flow: 'auth-code',
    scope: SCOPES_LIST.join(" "),
    // @ts-ignore
    prompt: 'consent'
  });

  const handleGoogleSubmit = async () => {
    if (!googleToken) return;
    setLoading(true);
    try {
      const user = await authStore.googleLogin({ code: googleToken, is_teacher: role === 'teacher', is_signup: true });
      onAuthSuccess?.(user);
      onOpenChange(false);
      reset();
    } catch (e) {
      setError("Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const user = await authStore.register(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        role === "teacher",
      );
      onAuthSuccess?.(user);
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === 'form' ? "Create your account" : "Complete your profile"}</DialogTitle>
          {step === 'role_selection' && (
            <DialogDescription>
              Please select your role to finish setting up your account.
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 'form' ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="signup-firstName">First Name</Label>
                <Input
                  id="signup-firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-lastName">Last Name</Label>
                <Input
                  id="signup-lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Create a password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm">Confirm password</Label>
              <Input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter your password"
              />
            </div>

            <div className="space-y-2">
              <Label>I&apos;m a</Label>
              <div className="grid grid-cols-2 gap-3">
                {["teacher", "student"].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={role === value ? "default" : "outline"}
                    className="flex items-center justify-center gap-2"
                    onClick={() => setRole(value as "teacher" | "student")}
                    disabled={loading}
                  >
                    {role === value && <Check className="h-4 w-4" />}
                    <span className="capitalize">{value}</span>
                  </Button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={requiredMissing}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign up
              </Button>
            </DialogFooter>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => googleLogin()}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-base">I am a...</Label>
              <div className="grid grid-cols-2 gap-4">
                {["teacher", "student"].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={role === value ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center gap-2 text-lg"
                    onClick={() => setRole(value as "teacher" | "student")}
                    disabled={loading}
                  >
                    {role === value && <Check className="h-6 w-6 mb-1" />}
                    <span className="capitalize">{value}</span>
                  </Button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleGoogleSubmit}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Sign Up
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('form')}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
