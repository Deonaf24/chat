"use client";

import { useState } from "react";
import { Home, Menu } from "lucide-react";

import { ClassRead } from "@/app/types/school";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type ClassNavigationProps = {
  classes: ClassRead[];
  currentClassId?: number | null;
  loading?: boolean;
  onNavigate: (path: string) => void;
  homePath?: string;
};

export function ClassNavigationSidebar({
  classes,
  currentClassId,
  loading = false,
  onNavigate,
  homePath = "/student",
}: ClassNavigationProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed left-4 top-20 z-40 md:left-6">
        <Button
          variant="outline"
          size="icon"
          className="shadow-sm"
          onClick={() => setOpen(true)}
          aria-label="Open class sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] px-5 py-6 sm:w-80">
          <SheetTitle className="sr-only">Classes navigation</SheetTitle>
          <div className="flex flex-col gap-6 pt-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Classes</h2>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  onNavigate(homePath);
                  setOpen(false);
                }}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <div className="rounded-lg border bg-muted/40 p-2">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : classes.length ? (
                  <div className="space-y-2">
                    {classes.map((classItem) => (
                      <Button
                        key={classItem.id}
                        variant={classItem.id === currentClassId ? "secondary" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => {
                          onNavigate(`/classes/${classItem.id}`);
                          setOpen(false);
                        }}
                      >
                        <span className="truncate text-left">{classItem.name}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 text-sm text-muted-foreground">No enrolled classes yet.</p>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
