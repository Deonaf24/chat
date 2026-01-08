"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthTeacher } from "@/app/hooks/dashboard/useAuthTeacher";
import { getAssignmentAnalytics } from "@/app/lib/api/analytics";
import { AssignmentAnalytics } from "@/app/types/analytics";

export default function AssignmentAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuthTeacher();
  const [analytics, setAnalytics] = useState<AssignmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assignmentId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    return Number.isNaN(numericId) ? null : numericId;
  }, [params]);

  useEffect(() => {
    if (authLoading || !assignmentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getAssignmentAnalytics(assignmentId)
      .then((response) => {
        if (!isMounted) return;
        setAnalytics(response);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load assignment analytics right now.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [assignmentId, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="grid h-dvh place-items-center">
        <p className="text-sm text-muted-foreground">Loading assignment analytics...</p>
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
          <p className="text-sm text-muted-foreground">Assignment analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight">Assignment insights</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Most understood concept</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {analytics.most_understood_concept ?? "No data yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Least understood concept</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {analytics.least_understood_concept ?? "No data yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Most understood question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {analytics.most_understood_question ?? "No data yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Least understood question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {analytics.least_understood_question ?? "No data yet"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
