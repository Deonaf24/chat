"use client";

import { useMemo, useState } from "react";
import { Plus, Loader2, Folder, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

import Navbar from "@/components/section/navbar/default";
import { Button } from "@/components/ui/button";
import { ClassStatsRow } from "@/components/dashboard/ClassStatsRow";
import { AssignmentsList } from "@/components/dashboard/AssignmentsList";
import { getClassStyle } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ClassDetailNavbar } from "@/components/dashboard/ClassDetailNavbar";
import { ClassBanner } from "@/components/dashboard/ClassBanner";
import { StreamFeed } from "@/components/dashboard/StreamFeed";
import { CreateAssignmentDialog } from "@/components/dashboard/CreateAssignmentDialog";
import { CreateAnnouncementDialog } from "@/components/dashboard/CreateAnnouncementDialog";
import { CreatePollDialog } from "@/components/dashboard/CreatePollDialog";
import { AnalyticsModeSelector, AnalyticsMode } from "@/components/dashboard/AnalyticsModeSelector";
import { PeopleList } from "@/components/dashboard/PeopleList";
import { LiveEventView } from "@/components/dashboard/LiveEventView";
import { CreateMaterialDialog } from "@/components/dashboard/CreateMaterialDialog";
import { AnalyticsTab } from "@/components/dashboard/class/AnalyticsTab";
import { MaterialCard } from "@/components/dashboard/class/MaterialCard";
import { ClassProvider } from "./context";

import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { useAssignmentForm } from "@/app/hooks/dashboard/useAssignmentForm";
import { useClassData } from "@/app/hooks/dashboard/useClassData";
import { useSmoothLoading } from "@/app/hooks/useSmoothLoading";
import { authStore } from "@/app/lib/auth/authStore";
import { createAnnouncement, createPoll } from "@/app/lib/api/stream";
import { createMaterial, uploadMaterialFile, analyzeMaterial } from "@/app/lib/api/school";

export default function ClassDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, teacher, student, loading: authLoading, isTeacher } = useDashboardAuth();
    const [activeTab, setActiveTab] = useState("analytics");
    const [analyticsMode, setAnalyticsMode] = useState<AnalyticsMode>('class');

    const { classes, students, teachers, assignments, usersById, loading, initialized, addAssignment } = useDashboardData(
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

    // Fetch Class-specific Data (Announcements, Polls, Materials, Concepts)
    const classDataHook = useClassData(classId);

    // Destructure for local usage if needed, or just access from hook result
    const {
        announcements,
        polls,
        materials,
        chapters,
        availableConcepts,
        expandedChapters,
        setExpandedChapters,
        refreshAnnouncements,
        refreshPolls,
        refreshMaterials
    } = classDataHook;


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

    // Modal State
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [isPollOpen, setIsPollOpen] = useState(false);
    const [isMaterialOpen, setIsMaterialOpen] = useState(false);

    // Material View State
    const [conceptFilter, setConceptFilter] = useState<number | null>(null);

    const handleCreateAnnouncement = async (title: string, content: string) => {
        if (!classId) return;
        await createAnnouncement(classId, title, content);
        refreshAnnouncements();
    };

    const handleCreatePoll = async (title: string, description: string, question: string, options: string[]) => {
        if (!classId) return;
        await createPoll(classId, title, description, question, options);
        refreshPolls();
    };

    const handleCreateMaterial = async (title: string, description: string, file: File | null, conceptIds: number[]) => {
        if (!classId || !teacher) return;
        const material = await createMaterial(classId, {
            title,
            description,
            teacher_id: teacher.id,
            concept_ids: conceptIds
        });

        if (file) {
            await uploadMaterialFile(material.id, file);
        }
        refreshMaterials();
    };


    const isStrictlyLoading = authLoading || loading || (!initialized && !!user);
    const showLoader = useSmoothLoading(isStrictlyLoading);

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

    if (showLoader) {
        return (
            <div className="grid h-dvh place-items-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading class details...</span>
                </div>
            </div>
        );
    }

    if (isStrictlyLoading) {
        return null;
    }

    if (!initialized) {
        return null;
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

    const dashboardData = {
        students: studentsInSelectedClass,
        teachers,
        assignments: assignmentsForSelectedClass,
        usersById
    };

    return (
        <ClassProvider
            classId={classId!}
            isTeacher={!!teacher}
            currentUserId={user?.id}
            classData={classDataHook}
            dashboardData={dashboardData}
        >
            <div
                className="min-h-dvh bg-muted/30"
                style={{
                    '--primary': classStyle?.oklch,
                    '--ring': classStyle?.oklch,
                    '--accent-foreground': classStyle?.oklch,
                    '--secondary-foreground': classStyle?.oklch,
                    '--secondary': classStyle?.oklchLight,
                    '--accent': classStyle?.oklchLight,
                    '--sidebar-primary': classStyle?.oklch,
                    '--sidebar-ring': classStyle?.oklch,
                    '--sidebar-accent': classStyle?.oklchLight,
                    '--sidebar-accent-foreground': classStyle?.oklch,
                } as React.CSSProperties}
            >
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
                    role={teacher ? 'teacher' : student ? 'student' : undefined}
                />

                {/* Added pt-28 (24 + 4) to account for fixed h-24 navbar */}
                <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">

                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {activeTab === "stream" && (
                                    <div className="space-y-6">
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

                                        <StreamFeed classNameLabel={selectedClass.name} />
                                    </div>
                                )}

                                {activeTab === "classwork" && (
                                    <AssignmentsList assignments={assignmentsForSelectedClass} />
                                )}

                                {activeTab === "materials" && (
                                    <div className="space-y-6">
                                        {/* Concept Filter */}
                                        {availableConcepts.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-muted-foreground">Filter by concept:</span>
                                                <Button
                                                    variant={conceptFilter === null ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setConceptFilter(null)}
                                                >
                                                    All
                                                </Button>
                                                {availableConcepts.map(concept => (
                                                    <Button
                                                        key={concept.id}
                                                        variant={conceptFilter === concept.id ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setConceptFilter(conceptFilter === concept.id ? null : concept.id)}
                                                    >
                                                        {concept.name}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Chapter-organized Materials */}
                                        {chapters.length === 0 && materials.length === 0 ? (
                                            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                                <h3 className="text-lg font-medium text-foreground">Class Materials</h3>
                                                <p>No materials have been posted for this class yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Materials organized by chapter */}
                                                {chapters.sort((a, b) => a.order - b.order).map(chapter => {
                                                    const chapterMaterials = materials.filter(m => chapter.material_ids?.includes(m.id));
                                                    const filteredMaterials = conceptFilter
                                                        ? chapterMaterials.filter(m => m.concept_ids?.includes(conceptFilter))
                                                        : chapterMaterials;

                                                    if (filteredMaterials.length === 0 && conceptFilter) return null;

                                                    const isExpanded = expandedChapters.has(chapter.id);

                                                    return (
                                                        <div key={chapter.id} className="border rounded-lg overflow-hidden">
                                                            <button
                                                                onClick={() => {
                                                                    const newExpanded = new Set(expandedChapters);
                                                                    if (isExpanded) {
                                                                        newExpanded.delete(chapter.id);
                                                                    } else {
                                                                        newExpanded.add(chapter.id);
                                                                    }
                                                                    setExpandedChapters(newExpanded);
                                                                }}
                                                                className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", classStyle?.light || "bg-primary/10")}>
                                                                        <Folder className={cn("h-4 w-4", classStyle?.text || "text-primary")} />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <h3 className="font-semibold">{chapter.title}</h3>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
                                                                            {chapter.description && ` • ${chapter.description}`}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </button>

                                                            <AnimatePresence initial={false}>
                                                                {isExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="p-4 border-t">
                                                                            {filteredMaterials.length === 0 ? (
                                                                                <p className="text-sm text-muted-foreground italic py-4 text-center">No materials in this chapter</p>
                                                                            ) : (
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                    {filteredMaterials.map((material) => (
                                                                                        <MaterialCard
                                                                                            key={material.id}
                                                                                            material={material}
                                                                                            onAnalyze={async () => {
                                                                                                try {
                                                                                                    await analyzeMaterial(material.id);
                                                                                                    refreshMaterials();
                                                                                                } catch (e) {
                                                                                                    console.error("Analysis failed", e);
                                                                                                }
                                                                                            }}
                                                                                            availableConcepts={availableConcepts}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}

                                                {/* Uncategorized materials (not in any chapter) */}
                                                {(() => {
                                                    const allChapterMaterialIds = chapters.flatMap(c => c.material_ids || []);
                                                    const uncategorized = materials.filter(m => !allChapterMaterialIds.includes(m.id));
                                                    const filtered = conceptFilter
                                                        ? uncategorized.filter(m => m.concept_ids?.includes(conceptFilter))
                                                        : uncategorized;

                                                    if (filtered.length === 0) return null;

                                                    return (
                                                        <div className="border rounded-lg overflow-hidden">
                                                            <div className="p-4 bg-muted/30">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-lg bg-gray-500/10 flex items-center justify-center">
                                                                        <Folder className="h-4 w-4 text-gray-500" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-semibold">Other Materials</h3>
                                                                        <p className="text-xs text-muted-foreground">{filtered.length} material{filtered.length !== 1 ? 's' : ''}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 border-t">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {filtered.map((material) => (
                                                                        <MaterialCard
                                                                            key={material.id}
                                                                            material={material}
                                                                            onAnalyze={async () => {
                                                                                try {
                                                                                    await analyzeMaterial(material.id);
                                                                                    refreshMaterials();
                                                                                } catch (e) {
                                                                                    console.error("Analysis failed", e);
                                                                                }
                                                                            }}
                                                                            availableConcepts={availableConcepts}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "people" && (
                                    <div className="space-y-6">
                                        {(() => {
                                            const index = classes.findIndex(c => c.id === selectedClass.id);
                                            const style = getClassStyle(index >= 0 ? index : 0);

                                            return (
                                                <PeopleList
                                                    accentColorClass={style.text}
                                                />
                                            );
                                        })()}
                                    </div>
                                )}

                                {activeTab === "analytics" && (
                                    <AnalyticsTab
                                        mode={analyticsMode}
                                        currentStudentId={student?.id}
                                    />
                                )}

                                {activeTab === "live" && (
                                    <LiveEventView classId={selectedClass.id} isTeacher={isTeacher} studentId={student?.id} />
                                )}
                            </motion.div>

                        </AnimatePresence>

                        {/* Floating Analytics Selector - Rendered independently to support exit animations */}
                        <AnimatePresence>
                            {isTeacher && activeTab === "analytics" && (
                                <AnalyticsModeSelector
                                    currentMode={analyticsMode}
                                    onChange={setAnalyticsMode}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </main >

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
        </ClassProvider>
    );
}
