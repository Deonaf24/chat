export const CARD_STYLES = [
    {
        border: "border-l-red-500",
        gradient: "from-red-500 to-transparent",
        solid: "bg-red-500",
        light: "bg-red-50",
        overlay: "from-red-500 to-red-700",
        text: "text-red-600",
        oklch: "oklch(0.637 0.237 25.331)",
        oklchLight: "oklch(0.97 0.01 25.331)"
    },
    {
        border: "border-l-blue-500",
        gradient: "from-blue-500 to-transparent",
        solid: "bg-blue-500",
        light: "bg-blue-50",
        overlay: "from-blue-600 to-blue-500",
        text: "text-blue-600",
        oklch: "oklch(0.623 0.214 259.815)",
        oklchLight: "oklch(0.97 0.01 259.815)"
    },
    {
        border: "border-l-amber-500",
        gradient: "from-amber-500 to-transparent",
        solid: "bg-amber-500",
        light: "bg-amber-50",
        overlay: "from-amber-600 to-amber-500",
        text: "text-amber-600",
        oklch: "oklch(0.769 0.188 70.08)",
        oklchLight: "oklch(0.97 0.01 70.08)"
    },
    {
        border: "border-l-violet-500",
        gradient: "from-violet-500 to-transparent",
        solid: "bg-violet-500",
        light: "bg-violet-50",
        overlay: "from-violet-600 to-violet-500",
        text: "text-violet-600",
        oklch: "oklch(0.606 0.25 273.428)",
        oklchLight: "oklch(0.97 0.01 273.428)"
    },
    {
        border: "border-l-emerald-500",
        gradient: "from-emerald-500 to-transparent",
        solid: "bg-emerald-500",
        light: "bg-emerald-50",
        overlay: "from-emerald-600 to-emerald-500",
        text: "text-emerald-600",
        oklch: "oklch(0.696 0.17 162.48)",
        oklchLight: "oklch(0.97 0.01 162.48)"
    },
    {
        border: "border-l-rose-500",
        gradient: "from-rose-500 to-transparent",
        solid: "bg-rose-500",
        light: "bg-rose-50",
        overlay: "from-rose-500 to-rose-700",
        text: "text-rose-600",
        oklch: "oklch(0.645 0.246 16.439)",
        oklchLight: "oklch(0.97 0.01 16.439)"
    },
    {
        border: "border-l-cyan-500",
        gradient: "from-cyan-500 to-transparent",
        solid: "bg-cyan-500",
        light: "bg-cyan-50",
        overlay: "from-cyan-600 to-cyan-500",
        text: "text-cyan-600",
        oklch: "oklch(0.723 0.16 192.615)",
        oklchLight: "oklch(0.97 0.01 192.615)"
    },
    {
        border: "border-l-orange-500",
        gradient: "from-orange-500 to-transparent",
        solid: "bg-orange-500",
        light: "bg-orange-50",
        overlay: "from-orange-600 to-orange-500",
        text: "text-orange-600",
        oklch: "oklch(0.705 0.213 47.591)",
        oklchLight: "oklch(0.97 0.01 47.591)"
    },
    {
        border: "border-l-indigo-500",
        gradient: "from-indigo-500 to-transparent",
        solid: "bg-indigo-500",
        light: "bg-indigo-50",
        overlay: "from-indigo-600 to-indigo-500",
        text: "text-indigo-600",
        oklch: "oklch(0.585 0.233 277.117)",
        oklchLight: "oklch(0.97 0.01 277.117)"
    },
    {
        border: "border-l-fuchsia-500",
        gradient: "from-fuchsia-500 to-transparent",
        solid: "bg-fuchsia-500",
        light: "bg-fuchsia-50",
        overlay: "from-fuchsia-600 to-fuchsia-500",
        text: "text-fuchsia-600",
        oklch: "oklch(0.627 0.265 303.9)",
        oklchLight: "oklch(0.97 0.01 303.9)"
    },
];

export function getClassStyle(index: number) {
    return CARD_STYLES[index % CARD_STYLES.length];
}
