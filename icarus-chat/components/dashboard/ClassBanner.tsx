import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClassBannerProps {
    className: string;
    description?: string | null;
    joinCode: string;
    theme?: string;
}

export function ClassBanner({ className, description, joinCode, theme }: ClassBannerProps) {
    const handleCopyCode = () => {
        navigator.clipboard.writeText(joinCode);
        // Toast can be added here once a provider is installed
    };

    return (
        <div className={cn("relative overflow-hidden rounded-xl bg-gradient-to-r p-6 sm:p-8 text-white shadow-md", theme || "from-pink-600 to-rose-500")}>
            <div className="relative z-10 flex flex-col justify-end h-full min-h-[160px]">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{className}</h1>
                {description && (
                    <p className="text-lg sm:text-xl text-white/90 mb-4 font-medium">{description}</p>
                )}

                <div className="flex items-center gap-3 mt-auto">
                    <span className="text-sm font-medium text-white/80">Class code</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-wider">{joinCode.length === 6 ? `${joinCode.slice(0, 3)} ${joinCode.slice(3)}` : joinCode}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                            onClick={handleCopyCode}
                            title="Copy class code"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Decorative Overlay / Pattern */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none transition-transform hover:scale-110 duration-700" />
        </div>
    );
}
