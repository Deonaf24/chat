
export interface Grade {
    grade: string;
    colorClass: string;
    colorHex: string;
}

export function getGrade(score: number | null | undefined): Grade {
    // Handle null/undefined or invalid scores
    if (score === null || score === undefined || isNaN(score)) {
        return { grade: 'N/A', colorClass: 'text-muted-foreground font-soft font-bold', colorHex: '#9ca3af' };
    }

    // effectiveScore should be 0-100. Assume inputs <= 1 are decimals (0.85 -> 85), > 1 are percentages.
    // However, some edge cases might be 1.0 (100%) vs 1 (1%).
    // Contextually in this app, scores seem to be 0.0-1.0 mostly (average_score).
    // Safest bet: if < 0, 0. If <= 1, multiply by 100. But what if someone has 0.5%? Unlikely.
    // Let's assume input is 0.0 - 1.0 based on `Math.round(score * 100)`.

    const effectiveScore = score * 100;

    // Evenly distributed 0-100 scale (20% per letter)
    if (effectiveScore >= 93.33) return { grade: 'A+', colorClass: 'text-green-600 font-soft font-bold', colorHex: '#16a34a' };
    if (effectiveScore >= 86.66) return { grade: 'A', colorClass: 'text-green-500 font-soft font-bold', colorHex: '#22c55e' };
    if (effectiveScore >= 80) return { grade: 'A-', colorClass: 'text-green-500 font-soft font-bold', colorHex: '#22c55e' };

    if (effectiveScore >= 73.33) return { grade: 'B+', colorClass: 'text-blue-500 font-soft font-bold', colorHex: '#3b82f6' };
    if (effectiveScore >= 66.66) return { grade: 'B', colorClass: 'text-blue-500 font-soft font-bold', colorHex: '#3b82f6' };
    if (effectiveScore >= 60) return { grade: 'B-', colorClass: 'text-blue-500 font-soft font-bold', colorHex: '#3b82f6' };

    if (effectiveScore >= 53.33) return { grade: 'C+', colorClass: 'text-yellow-600 font-soft font-bold', colorHex: '#ca8a04' };
    if (effectiveScore >= 46.66) return { grade: 'C', colorClass: 'text-yellow-600 font-soft font-bold', colorHex: '#ca8a04' };
    if (effectiveScore >= 40) return { grade: 'C-', colorClass: 'text-yellow-600 font-soft font-bold', colorHex: '#ca8a04' };

    if (effectiveScore >= 33.33) return { grade: 'D+', colorClass: 'text-orange-500 font-soft font-bold', colorHex: '#f97316' };
    if (effectiveScore >= 26.66) return { grade: 'D', colorClass: 'text-orange-500 font-soft font-bold', colorHex: '#f97316' };
    if (effectiveScore >= 20) return { grade: 'D-', colorClass: 'text-orange-500 font-soft font-bold', colorHex: '#f97316' };

    return { grade: 'F', colorClass: 'text-red-500 font-soft font-bold', colorHex: '#ef4444' };
}
