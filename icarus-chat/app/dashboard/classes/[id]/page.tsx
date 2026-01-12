"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, ArrowLeft, Megaphone, BarChart2, FileText, Paperclip } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassStatsRow } from "@/components/dashboard/ClassStatsRow";
import { StudentsCard } from "@/components/dashboard/StudentsCard";
import { AssignmentsList } from "@/components/dashboard/AssignmentsList";
import { getClassStyle } from "@/lib/constants";
import { ClassDetailNavbar } from "@/components/dashboard/ClassDetailNavbar";
import { ClassBanner } from "@/components/dashboard/ClassBanner";
import { StreamFeed } from "@/components/dashboard/StreamFeed";
import { CreateAssignmentDialog } from "@/components/dashboard/CreateAssignmentDialog";
import { CreateAnnouncementDialog } from "@/components/dashboard/CreateAnnouncementDialog";
import { CreatePollDialog } from "@/components/dashboard/CreatePollDialog";
import { ClassAnalyticsView } from "@/components/dashboard/ClassAnalyticsView";
import { StudentAnalyticsView } from "@/components/dashboard/StudentAnalyticsView";
import { PeopleList } from "@/components/dashboard/PeopleList";
import { LiveEventView } from "@/components/dashboard/LiveEventView";
import { CreateMaterialDialog } from "@/components/dashboard/CreateMaterialDialog";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { useAssignmentForm } from "@/app/hooks/dashboard/useAssignmentForm";
import { authStore } from "@/app/lib/auth/authStore";
import { createAnnouncement, createPoll, getClassAnnouncements, getClassPolls } from "@/app/lib/api/stream";
import { createMaterial, getMaterials, uploadMaterialFile, getClassConcepts } from "@/app/lib/api/school";
import { Announcement, Poll, Material, Concept } from "@/app/types/school";

import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { analyzeMaterial } from "@/app/lib/api/school";

export default function ClassDetailPage() {
    const params = useParams();
    // ... rest of component


    const router = useRouter();
    const { user, teacher, student, loading: authLoading, isTeacher } = useDashboardAuth();
    const [activeTab, setActiveTab] = useState("stream");

    const { classes, students, teachers, assignments, usersById, loading, refresh, addAssignment } = useDashboardData(
        user,
        teacher,
        student
    );

    const classId = useMemo(() => {
        const id = params?.id;
        return id ? Number(id) : null;
    }, [params]);

    const selectedClass = useMemo(
        () => classes.find((c) => c.id === classId),
        [classes, classId]
    );



    // Assignment creation state
    const {
        assignmentForm,
        assignmentFile,
        creatingAssignment,
        error: assignmentError,
        showDialog,
        openDialog,
        closeDialog,
        updateAssignmentForm,
        handleFileChange,
        handleCreateAssignment,
    } = useAssignmentForm({
        selectedClassId: Number(params.id),
        user,
        teacher,
        onAssignmentCreated: addAssignment
    });

    // Stream creation state
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [isPollOpen, setIsPollOpen] = useState(false);

    // Stream Data State
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);


    // Material Data State
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isMaterialOpen, setIsMaterialOpen] = useState(false);
    const [availableConcepts, setAvailableConcepts] = useState<Concept[]>([]);

    useEffect(() => {
        if (!params.id) return;
        // In a real app we'd fetch these inside useDashboardData or a specialized hook
        // For now, simple fetch on mount/param change
        const token = "mock_token"; // TODO: grab from authStore
        const classId = Number(params.id);

        getClassAnnouncements(classId, token).then(setAnnouncements).catch(console.error);
        getClassPolls(classId, token).then(setPolls).catch(console.error);
        getMaterials(classId).then(setMaterials).catch(console.error);
        getClassConcepts(classId).then(setAvailableConcepts).catch(console.error);
    }, [params.id]);

    const handleCreateAnnouncement = async (title: string, content: string) => {
        if (!params.id) return;
        await createAnnouncement(Number(params.id), title, content, "mock_token");
        // refresh data
        const token = "mock_token";
        const classId = Number(params.id);
        getClassAnnouncements(classId, token).then(setAnnouncements).catch(console.error);
    };

    const handleCreatePoll = async (title: string, description: string, question: string, options: string[]) => {
        if (!params.id) return;
        await createPoll(Number(params.id), title, description, question, options, "mock_token");
        // refresh data
        const token = "mock_token";
        const classId = Number(params.id);
        getClassPolls(classId, token).then(setPolls).catch(console.error);
    }

    const handleCreateMaterial = async (title: string, description: string, file: File | null, conceptIds: number[]) => {
        if (!params.id || !teacher) return;
        const classId = Number(params.id);
        const material = await createMaterial(classId, {
            title,
            description,
            teacher_id: teacher.id,
            concept_ids: conceptIds
        });

        if (file) {
            await uploadMaterialFile(material.id, file);
        }

        getMaterials(classId).then(setMaterials).catch(console.error);
    }

    const isLoading = authLoading || loading;

    // Calculate style based on global class index to match dashboard
    // const classStyle = ... -> (Leaving this comment, logic seems missing/deleted too? No, I need to restore that too if it's missing)

    // Wait, I need to check if classStyle is defined.
    // In the current file (lines 204-206), classStyle calculation is missing/commented out!
    // I need to restore classStyle, studentsInSelectedClass, etc.

    const classStyle = useMemo(() => {
        if (!selectedClass || classes.length === 0) return null;
        const index = classes.findIndex(c => c.id === selectedClass.id);
        const validIndex = index >= 0 ? index : 0;
        return getClassStyle(validIndex);
    }, [selectedClass, classes]);

    const studentsInSelectedClass = useMemo(
        () => (classId ? students.filter((student) => student.class_ids?.includes(classId)) : []),
        [classId, students],
    );

    const assignmentsForSelectedClass = useMemo(
        () => assignments.filter((assignment) => assignment.class_id === classId),
        [assignments, classId],
    );

    const handleLogout = () => {
        authStore.logout();
        router.replace("/");
    };

    if (isLoading) {
        return (
            <div className="grid h-dvh place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading class details...</span>
                </div>
            </div>
        );
    }

    if (!selectedClass) {
        return (
            <div className="min-h-dvh bg-muted/30">
                <Navbar name="Socratica" homeUrl="/dashboard" actions={[{ text: "Dashboard", href: "/dashboard" }]} />
                <div className="grid h-[80vh] place-items-center">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold">Class Not Found</h2>
                        <p className="text-muted-foreground">The class you are looking for does not exist.</p>
                        <Button asChild>
                            <Link href="/dashboard">Return to Dashboard</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh bg-muted/30">
            {/* Permanent Class Navbar */}
            <ClassDetailNavbar
                className={selectedClass.name}
                classes={classes}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onCreateAssignment={isTeacher ? openDialog : undefined}
                onCreateAnnouncement={isTeacher ? () => setIsAnnouncementOpen(true) : undefined}
                onCreatePoll={isTeacher ? () => setIsPollOpen(true) : undefined}
                onCreateMaterial={isTeacher ? () => setIsMaterialOpen(true) : undefined}
            />

            {/* Added pt-28 (24 + 4) to account for fixed h-24 navbar */}
            <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

                    <TabsContent value="stream" className="space-y-6">
                        <ClassBanner
                            className={selectedClass.name}
                            description={selectedClass.description}
                            joinCode={selectedClass.join_code}
                            theme={classStyle?.overlay}
                        />

                        <ClassStatsRow
                            studentsCount={studentsInSelectedClass.length}
                            assignmentsCount={assignmentsForSelectedClass.length}
                            rosterLabel={`${selectedClass.student_ids.length} enrolled`}
                        />

                        {/* Recent Activity / Stream Feed */}
                        <StreamFeed
                            assignments={assignmentsForSelectedClass}
                            announcements={announcements}
                            polls={polls}
                            materials={materials}
                            classNameLabel={selectedClass.name}
                        />
                    </TabsContent>

                    <TabsContent value="classwork" className="space-y-6">
                        <AssignmentsList assignments={assignmentsForSelectedClass} />
                    </TabsContent>

                    <TabsContent value="materials" className="space-y-6">
                        {materials.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                <h3 className="text-lg font-medium text-foreground">Class Materials</h3>
                                <p>Resource library coming soon.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {materials.map((material) => (
                                    <MaterialCard
                                        key={material.id}
                                        material={material}
                                        onAnalyze={async () => {
                                            try {
                                                await analyzeMaterial(material.id);
                                                // Refresh materials
                                                getMaterials(selectedClass.id).then(setMaterials);
                                                // Refresh concepts
                                                getClassConcepts(selectedClass.id).then(setAvailableConcepts);
                                            } catch (e) {
                                                console.error("Analysis failed", e);
                                            }
                                        }}
                                        availableConcepts={availableConcepts}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="people" className="space-y-6">
                        {(() => {
                            const index = classes.findIndex(c => c.id === selectedClass.id);
                            const style = getClassStyle(index >= 0 ? index : 0);
                            const teacher = teachers.find(t => t.id === selectedClass.teacher_id);

                            return (
                                <PeopleList
                                    classId={selectedClass.id}
                                    teacher={teacher}
                                    students={studentsInSelectedClass}
                                    usersById={usersById}
                                    accentColorClass={style.text}
                                    isTeacher={isTeacher}
                                />
                            );
                        })()}
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        {isTeacher ? (
                            <ClassAnalyticsView classId={selectedClass.id} />
                        ) : student?.id ? (
                            <StudentAnalyticsView studentId={student.id} />
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                Analytics not available.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="live" className="space-y-6">
                        <LiveEventView classId={selectedClass.id} isTeacher={isTeacher} />
                    </TabsContent>
                </Tabs>
            </main>

            <CreateAssignmentDialog
                open={showDialog}
                onOpenChange={(isOpen) => (isOpen ? openDialog() : closeDialog())}
                assignmentForm={assignmentForm}
                assignmentFile={assignmentFile}
                creating={creatingAssignment}
                error={assignmentError}
                classNameLabel={selectedClass?.name || ""}
                onChange={updateAssignmentForm}
                onFileChange={handleFileChange}
                onSubmit={handleCreateAssignment}
            />
            <CreateAnnouncementDialog
                open={isAnnouncementOpen}
                onOpenChange={setIsAnnouncementOpen}
                onSubmit={handleCreateAnnouncement}
            />
            <CreatePollDialog
                open={isPollOpen}
                onOpenChange={setIsPollOpen}
                onSubmit={handleCreatePoll}
            />
            <CreateMaterialDialog
                open={isMaterialOpen}
                onOpenChange={setIsMaterialOpen}
                onSubmit={handleCreateMaterial}
                availableConcepts={availableConcepts}
            />
        </div>
    );
}

function MaterialCard({ material, onAnalyze, availableConcepts }: { material: Material, onAnalyze: () => Promise<void>, availableConcepts: Concept[] }) {
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            await onAnalyze();
        } finally {
            setAnalyzing(false);
        }
    };

    const materialConcepts = material.concept_ids?.map(id => availableConcepts.find(c => c.id === id)).filter(Boolean) || [];

    return (
        <Card className="border-l-4 border-l-purple-500 flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base truncate">{material.title}</CardTitle>
                    {material.file_ids && material.file_ids.length > 0 && <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />}
                </div>
                <CardDescription className="text-xs">
                    {format(new Date(material.created_at), "MMM d, yyyy")}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                {material.description && <p className="text-sm line-clamp-2 text-muted-foreground mb-4">{material.description}</p>}
                {!material.description && <p className="text-sm italic text-muted-foreground mb-4">No description</p>}

                {materialConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {materialConcepts.map(c => (
                            <Badge key={c!.id} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                {c!.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
            <div className="p-4 pt-0 mt-auto flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-primary"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                >
                    {analyzing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                    {materialConcepts.length > 0 ? "Re-analyze" : "Analyze AI"}
                </Button>
            </div>
        </Card>
    );
}
