import { useState, useEffect, useRef } from 'react';

interface UseSmoothLoadingOptions {
    delay?: number; // Delay before showing loader (ms) - e.g. 200ms
    minDuration?: number; // Minimum time loader stays visible (ms) - e.g. 600ms
}

export function useSmoothLoading(
    isLoading: boolean,
    { delay = 200, minDuration = 400 }: UseSmoothLoadingOptions = {}
): boolean {
    const [showLoader, setShowLoader] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isLoading) {
            // Start loading requested
            if (timerRef.current) clearTimeout(timerRef.current);

            // Set delay before showing
            timerRef.current = setTimeout(() => {
                setShowLoader(true);
                startTimeRef.current = Date.now();
            }, delay);
        } else {
            // Stop loading requested
            if (timerRef.current) clearTimeout(timerRef.current);

            if (startTimeRef.current) {
                // Loader was shown, check if we need to keep it visible to meet minDuration
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = minDuration - elapsed;

                if (remaining > 0) {
                    timerRef.current = setTimeout(() => {
                        setShowLoader(false);
                        startTimeRef.current = null;
                    }, remaining);
                } else {
                    setShowLoader(false);
                    startTimeRef.current = null;
                }
            } else {
                // Loader wasn't shown yet (finished before delay), just cancel pending show
                setShowLoader(false);
            }
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            // We don't reset startTimeRef here because if it unmounts and remounts rapidly 
            // (e.g. strict mode or fast navigation), we ideally want shared state but hooks are local.
            // For now, simple cleanup is fine.
        };
    }, [isLoading, delay, minDuration]);

    return showLoader;
}
