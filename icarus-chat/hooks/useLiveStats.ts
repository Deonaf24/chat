import { useState, useEffect, useRef } from 'react';
import { LiveDashboardStats } from '@/app/types/live';
import { getLiveStats } from '@/app/lib/api/live';

export function useLiveStats(sessionId: number | null, isActive: boolean) {
    const [stats, setStats] = useState<LiveDashboardStats | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!sessionId || !isActive) return;

        const fetchStats = async () => {
            try {
                // Don't set global loading true on poll to avoid flicker
                const data = await getLiveStats(sessionId);
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch active stats", error);
            }
        };

        // Initial fetch
        setLoading(true);
        fetchStats().finally(() => setLoading(false));

        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, [sessionId, isActive]);

    return { stats, loading };
}
