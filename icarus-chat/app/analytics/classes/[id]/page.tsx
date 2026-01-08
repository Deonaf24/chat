"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthTeacher } from "@/app/hooks/dashboard/useAuthTeacher";
import { getClassAnalytics } from "@/app/lib/api/analytics";
import { ClassAnalytics } from "@/app/types/analytics";

export default function ClassAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuthTeacher();
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const classId = useMemo(() => {
    const idParam = params?.id;
    if (!idParam) return null;
    const numericId = Array.isArray(idParam) ? parseInt(idParam[0], 10) : parseInt(idParam as string, 10);
    return Number.isNaN(numericId) ? null : numericId;
  }, [params]);

  useEffect(() => {
    if (authLoading || !classId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getClassAnalytics(classId)
      .then((response) => {
        if (!isMounted) return;
        setAnalytics(response);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load class analytics right now.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, classId]);

  if (authLoading || loading) {
    return (
      <div className="grid h-dvh place-items-center">
        <p className="text-sm text-muted-foreground">Loading class analytics...</p>
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
          <p className="text-sm text-muted-foreground">Class analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight">Class overview</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Most understood assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {analytics.most_understood_assignment ?? "No data yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Least understood assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {analytics.least_understood_assignment ?? "No data yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Student ranking</CardTitle>
            <Badge variant="outline">{analytics.student_rankings.length} students</Badge>
          </CardHeader>
          <CardContent>
            {analytics.student_rankings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scores recorded yet.</p>
            ) : (
              <ol className="space-y-2">
                {analytics.student_rankings.map((ranking, index) => (
                  <li key={ranking.student_id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Student #{ranking.student_id}</p>
                      <p className="text-xs text-muted-foreground">Rank {index + 1}</p>
                    </div>
                    <Badge variant="secondary">{Math.round(ranking.average_score * 100)}%</Badge>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
