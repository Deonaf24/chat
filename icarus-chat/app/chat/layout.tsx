"use client";

import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { useDashboardData } from "@/app/hooks/dashboard/useDashboardData";
import { SidebarMenu } from "@/components/dashboard/SidebarMenu";
import { SidebarContent } from "@/components/dashboard/SidebarContent";
import { Button } from "@/components/ui/button";
import { authStore } from "@/app/lib/auth/authStore";
import { useRouter } from "next/navigation";

export default function ChatRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, teacher, student } = useDashboardAuth();
    const { classes } = useDashboardData(user, teacher, student);

    const handleLogout = () => {
        authStore.logout();
        router.replace("/");
    };

    const handleBack = () => {
        router.back();
    };

    const role = teacher ? 'teacher' : student ? 'student' : undefined;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Top Navbar (Full Width) */}
            <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0 z-20 w-full">
                <div className="flex items-center gap-4">
                    {/* Mobile Trigger */}
                    <div className="md:hidden">
                        <SidebarMenu classes={classes} role={role} />
                    </div>

                    {/* Back Button */}
                    <Button variant="ghost" onClick={handleBack} className="gap-2">
                        ← Back
                    </Button>

                    <span className="font-bold text-xl ml-2">Socratica</span>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                </div>
            </header>

            {/* Main Content Row */}
            <div className="flex flex-1 overflow-hidden">
                {/* Fixed Sidebar (Desktop) - Starts after navbar */}
                <aside className="hidden w-[250px] flex-col border-r bg-muted/10 md:flex h-full">
                    {/* No header here, as it is in the main navbar now */}
                    <SidebarContent classes={classes} role={role} />
                </aside>

                {/* Page Content */}
                <main className="flex-1 overflow-hidden relative flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
