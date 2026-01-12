export const CARD_STYLES = [
    {
        border: "border-l-red-500",
        gradient: "from-red-500 to-transparent",
        solid: "bg-red-500",
        overlay: "from-red-500 to-red-700", // For banners
        text: "text-red-600"
    },
    {
        border: "border-l-blue-500",
        gradient: "from-blue-500 to-transparent",
        solid: "bg-blue-500",
        overlay: "from-blue-600 to-blue-500",
        text: "text-blue-600"
    },
    {
        border: "border-l-amber-500",
        gradient: "from-amber-500 to-transparent",
        solid: "bg-amber-500",
        overlay: "from-amber-600 to-amber-500",
        text: "text-amber-600"
    },
    {
        border: "border-l-violet-500",
        gradient: "from-violet-500 to-transparent",
        solid: "bg-violet-500",
        overlay: "from-violet-600 to-violet-500",
        text: "text-violet-600"
    },
    {
        border: "border-l-emerald-500",
        gradient: "from-emerald-500 to-transparent",
        solid: "bg-emerald-500",
        overlay: "from-emerald-600 to-emerald-500",
        text: "text-emerald-600"
    },
    {
        border: "border-l-rose-500",
        gradient: "from-rose-500 to-transparent",
        solid: "bg-rose-500",
        overlay: "from-rose-500 to-rose-700",
        text: "text-rose-600"
    },
    {
        border: "border-l-cyan-500",
        gradient: "from-cyan-500 to-transparent",
        solid: "bg-cyan-500",
        overlay: "from-cyan-600 to-cyan-500",
        text: "text-cyan-600"
    },
    {
        border: "border-l-orange-500",
        gradient: "from-orange-500 to-transparent",
        solid: "bg-orange-500",
        overlay: "from-orange-600 to-orange-500",
        text: "text-orange-600"
    },
    {
        border: "border-l-indigo-500",
        gradient: "from-indigo-500 to-transparent",
        solid: "bg-indigo-500",
        overlay: "from-indigo-600 to-indigo-500",
        text: "text-indigo-600"
    },
    {
        border: "border-l-fuchsia-500",
        gradient: "from-fuchsia-500 to-transparent",
        solid: "bg-fuchsia-500",
        overlay: "from-fuchsia-600 to-fuchsia-500",
        text: "text-fuchsia-600"
    },
];

export function getClassStyle(index: number) {
    return CARD_STYLES[index % CARD_STYLES.length];
}
