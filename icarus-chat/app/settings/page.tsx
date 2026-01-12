"use client";

import { useMemo } from "react";
import { Loader2, User, Mail, Shield, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { authStore } from "@/app/lib/auth/authStore";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
    const router = useRouter();
    const { user, teacher, student, loading: authLoading } = useDashboardAuth();
    const { classes, loading: dataLoading } = useDashboardData(
        user,
        teacher,
        student
    );

    const isLoading = authLoading || dataLoading;

    const handleLogout = () => {
        authStore.logout();
        router.replace("/");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const displayName = teacher?.name ?? student?.name ?? user?.full_name ?? "User";
    const displayEmail = user?.email ?? "";
    const role = teacher ? "Teacher" : student ? "Student" : "User";

    if (isLoading) {
        return (
            <div className="grid h-dvh place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-muted/30">
            {/* Custom Header with SidebarMenu */}
            <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 z-10">
                        <SidebarMenu classes={classes} />
                        <a href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
                            Socratica
                        </a>
                    </div>

                    <div className="flex items-center gap-2 z-10 ml-auto bg-transparent">
                        <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 mb-8">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                    </div>

                    <div className="grid gap-6">
                        {/* Profile Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile
                                </CardTitle>
                                <CardDescription>Your personal information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={`https://avatar.vercel.sh/${user?.id}`} />
                                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h3 className="font-medium text-lg">{displayName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Shield className="h-3 w-3" />
                                            <span className="capitalize">{role} Account</span>
                                        </div>
                                    </div>
                                    <div className="md:ml-auto">
                                        <Button variant="outline">Edit Profile</Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" defaultValue={displayName} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" type="email" className="pl-9" defaultValue={displayEmail} disabled />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preferences Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notifications
                                </CardTitle>
                                <CardDescription>Manage how you receive notifications.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails about new assignments and announcements.
                                        </p>
                                    </div>
                                    <Switch defaultChecked /> // Mocked
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Stream Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications when new posts are made to the class stream.
                                        </p>
                                    </div>
                                    <Switch defaultChecked /> // Mocked
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
