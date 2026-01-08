"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthTeacher } from "@/app/hooks/dashboard/useAuthTeacher";
import { getStudentAnalytics } from "@/app/lib/api/analytics";
import { StudentAnalytics } from "@/app/types/analytics";

export default function StudentAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuthTeacher();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    return Number.isNaN(numericId) ? null : numericId;
  }, [params]);

  useEffect(() => {
    if (authLoading || !studentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getStudentAnalytics(studentId)
      .then((response) => {
        if (!isMounted) return;
        setAnalytics(response);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load student analytics right now.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, studentId]);

  if (authLoading || loading) {
    return (
      <div className="grid h-dvh place-items-center">
        <p className="text-sm text-muted-foreground">Loading student analytics...</p>
      </div>
    );
  }

  if (!analytics || error) {
    return (
      <div className="grid h-dvh place-items-center px-6">
        <div className="max-w-md space-y-3 text-center">
          <p className="text-lg font-semibold">Unable to open analytics</p>
          <p className="text-sm text-muted-foreground">{error ?? "Analytics data not available."}</p>
          <button className="text-sm text-primary underline" onClick={() => router.back()}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <Navbar
        name="Socratica"
        homeUrl="/dashboard"
        actions={[{ text: "Dashboard", href: "/dashboard" }]}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-6 pb-16 pt-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Student analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight">Student overview</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Questions asked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{analytics.questions_asked}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Easiest assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{analytics.easiest_assignment ?? "No data yet"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Hardest assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{analytics.hardest_assignment ?? "No data yet"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Most understood concept</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{analytics.most_understood_concept ?? "No data yet"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Least understood concept</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{analytics.least_understood_concept ?? "No data yet"}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
