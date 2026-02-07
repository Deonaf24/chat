"use client";

import { useMemo, useState } from "react";
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
import { updateTeacher, updateStudent, uploadAvatar } from "@/app/lib/api/school";
import { ProfileAvatarUploader } from "@/components/settings/ProfileAvatarUploader";

export default function SettingsPage() {
    const router = useRouter();
    const { user, teacher, student, loading: authLoading, refreshAuth } = useDashboardAuth();
    const { classes, loading: dataLoading, refresh } = useDashboardData(
        user,
        teacher,
        student
    );

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Derived state for initial values
    const currentName = teacher?.name ?? student?.name ?? user?.full_name ?? "";
    const currentEmail = teacher?.email ?? student?.email ?? user?.email ?? "";
    const currentAvatar = teacher?.profile_picture_url ?? student?.profile_picture_url;
    const role = teacher ? "Teacher" : student ? "Student" : "User";

    // Local state for editing
    const [editName, setEditName] = useState(currentName);
    const [editEmail, setEditEmail] = useState(currentEmail);

    const isLoading = authLoading || dataLoading;

    const handleLogout = () => {
        authStore.logout();
        router.replace("/");
    };

    // Update local state when data loads/changes
    useMemo(() => {
        if (!isEditing) {
            setEditName(currentName);
            setEditEmail(currentEmail);
        }
    }, [currentName, currentEmail, isEditing]);


    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (teacher) {
                await updateTeacher(teacher.id, { name: editName, email: editEmail });
            } else if (student) {
                await updateStudent(student.id, { name: editName, email: editEmail });
            }
            await refreshAuth(); // Refresh the auth data to update displayed name
            await refresh();     // Also refresh dashboard data if needed
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const { url } = await uploadAvatar(file);
            if (teacher) {
                await updateTeacher(teacher.id, { profile_picture_url: url });
            } else if (student) {
                await updateStudent(student.id, { profile_picture_url: url });
            }
            await refreshAuth();
            await refresh();
        } catch (error) {
            console.error("Failed to upload avatar", error);
        } finally {
            setIsUploading(false);
        }
    };

    const getInitials = (name: string) => {
        return (name || "User")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };


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
                        <SidebarMenu classes={classes} role={teacher ? 'teacher' : student ? 'student' : undefined} />
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

                                    <ProfileAvatarUploader
                                        currentImageUrl={currentAvatar}
                                        initials={getInitials(currentName)}
                                        onUpload={handleAvatarUpload}
                                        isUploading={isUploading}
                                    />

                                    <div className="space-y-1">
                                        <h3 className="font-medium text-lg">{currentName || "User"}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Shield className="h-3 w-3" />
                                            <span className="capitalize">{role} Account</span>
                                        </div>
                                    </div>
                                    <div className="md:ml-auto flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                                                <Button onClick={handleSave} disabled={isSaving || !editName.trim() || !editEmail.trim()}>
                                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Save Changes
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={isEditing ? editName : currentName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            disabled={!isEditing || isSaving}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="pl-9"
                                                value={isEditing ? editEmail : currentEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                disabled={!isEditing || isSaving}
                                            />
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
                                    <div className="flex-1 space-y-0.5">
                                        <Label className="text-base">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails about new assignments and announcements.
                                        </p>
                                    </div>
                                    <Switch defaultChecked /> // Mocked
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex-1 space-y-0.5">
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
