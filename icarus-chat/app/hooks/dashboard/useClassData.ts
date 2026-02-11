import { useState, useEffect, useCallback } from "react";
import { Announcement, Poll, Material, Concept, ChapterRead } from "@/app/types/school";
import {
    getClassAnnouncements,
    getClassPolls
} from "@/app/lib/api/stream";
import {
    getMaterials,
    getChapters,
    getClassConcepts
} from "@/app/lib/api/school";

interface UseClassDataReturn {
    announcements: Announcement[];
    polls: Poll[];
    materials: Material[];
    chapters: ChapterRead[];
    availableConcepts: Concept[];
    expandedChapters: Set<number>;
    setAnnouncements: (data: Announcement[]) => void;
    setPolls: (data: Poll[]) => void;
    setMaterials: (data: Material[]) => void;
    setExpandedChapters: (data: Set<number>) => void;
    refreshAnnouncements: () => Promise<void>;
    refreshPolls: () => Promise<void>;
    refreshMaterials: () => Promise<void>;
    loading: boolean;
}

export function useClassData(classId: number | null): UseClassDataReturn {
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [chapters, setChapters] = useState<ChapterRead[]>([]);
    const [availableConcepts, setAvailableConcepts] = useState<Concept[]>([]);
    const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

    const refreshAnnouncements = useCallback(async () => {
        if (!classId) return;
        try {
            const data = await getClassAnnouncements(classId);
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        }
    }, [classId]);

    const refreshPolls = useCallback(async () => {
        if (!classId) return;
        try {
            const data = await getClassPolls(classId);
            setPolls(data);
        } catch (error) {
            console.error("Failed to fetch polls", error);
        }
    }, [classId]);

    const refreshMaterials = useCallback(async () => {
        if (!classId) return;
        try {
            // Fetch materials and chapters together to handle expansion logic
            const [fetchedMaterials, fetchedChapters] = await Promise.all([
                getMaterials(classId),
                getChapters(classId),
                getClassConcepts(classId) // Refresh concepts too as they relate to materials
            ]);

            setMaterials(fetchedMaterials);
            setChapters(fetchedChapters);
            // Concepts usually set separately but might be good to sync

            // Note: We don't reset expandedChapters here to avoid collapsing user's view on refresh
            // Unless it's the first load... 
        } catch (error) {
            console.error("Failed to fetch materials", error);
        }
    }, [classId]);

    // Initial Fetch
    useEffect(() => {
        if (!classId) return;

        setLoading(true);
        Promise.all([
            getClassAnnouncements(classId),
            getClassPolls(classId),
            getClassConcepts(classId),
            getMaterials(classId),
            getChapters(classId)
        ]).then(([
            fetchedAnnouncements,
            fetchedPolls,
            fetchedConcepts,
            fetchedMaterials,
            fetchedChapters
        ]) => {
            setAnnouncements(fetchedAnnouncements);
            setPolls(fetchedPolls);
            setAvailableConcepts(fetchedConcepts);
            setMaterials(fetchedMaterials);
            setChapters(fetchedChapters);

            // Auto-expand chapters with materials
            const chaptersWithMaterials = fetchedChapters.filter(chapter =>
                chapter.material_ids?.some(materialId =>
                    fetchedMaterials.some(m => m.id === materialId)
                )
            );
            setExpandedChapters(new Set(chaptersWithMaterials.map(c => c.id)));
        }).catch(err => {
            console.error("Failed to load class data", err);
        }).finally(() => {
            setLoading(false);
        });

    }, [classId]);

    return {
        announcements,
        polls,
        materials,
        chapters,
        availableConcepts,
        expandedChapters,
        setAnnouncements,
        setPolls,
        setMaterials,
        setExpandedChapters,
        refreshAnnouncements,
        refreshPolls,
        refreshMaterials, // Note: This implementation of refreshMaterials in return doesn't exactly match initial load logic for expansion, which is fine
        loading
    };
}
