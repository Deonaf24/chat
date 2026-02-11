"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ClassDetailNavbar } from "@/components/dashboard/ClassDetailNavbar";
import { ChatInputBar } from "../chatinputbar/default";
import { ChatMessageList } from "../chatbox/default";
import { useChatController } from "@/app/hooks/useChatController";
import { authStore } from "@/app/lib/auth/authStore";
import { ClassRead } from "@/app/types/school";
import { useFilePreview } from "@/app/hooks/useFilePreview";
import { AssignmentSidebar } from "./assignment-sidebar";
import { PdfPreviewPanel } from "./pdf-preview-panel";
import { useDashboardAuth } from "@/app/hooks/dashboard/useDashboardAuth";
import { createCalendarEvents } from "@/app/lib/api/calendar";

type AssignmentChatContext = {
  id: string
  title: string;
  description?: string | null;
  dueAt?: string | Date | null;
  files?: { id: number; filename: string; path: string }[];
  level?: number;
};

type ClassNavigationContext = {
  classes: ClassRead[];
  currentClassId?: number | null;
  loading?: boolean;
  onNavigate: (path: string) => void;
};

export default function ChatLayout({
  assignment,
  classNavigation,
  initialPrompt,
  associatedClassId,
}: {
  assignment: AssignmentChatContext;
  classNavigation?: ClassNavigationContext;
  initialPrompt?: string;
  associatedClassId?: number;
}) {
  const router = useRouter();
  const { state: chatState, set, actions } = useChatController(assignment.id, assignment.level, initialPrompt, associatedClassId);
  const { state: previewState, openPreview, closePreview } = useFilePreview();
  const { student } = useDashboardAuth();
  const [isExtracting, setIsExtracting] = useState(false);


  const chatHeightStyle = {
    "--chat-h": "clamp(560px, 70dvh, 720px)",
  } as CSSProperties;

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  const handleAddToSchedule = async () => {
    if (!student?.id) {
      toast.error("Please log in to add events to your calendar");
      return;
    }

    if (chatState.messages.length === 0) {
      toast.error("Generate a study plan first before adding to schedule");
      return;
    }

    setIsExtracting(true);
    toast.loading("Extracting schedule from your study plan...", { id: "schedule-extract" });

    try {
      // Silently extract events from conversation
      const result = await actions.extractScheduleEvents();

      // Convert to calendar API format
      const calendarEvents = result.events.map(e => ({
        title: e.title,
        description: e.description || null,
        start_at: e.start,
        end_at: e.end,
        class_id: associatedClassId || null,
        source: "study_plan",
      }));

      // Save to calendar
      await createCalendarEvents(student.id, calendarEvents);

      toast.success(`Added ${calendarEvents.length} events to your calendar!`, {
        id: "schedule-extract",
        action: {
          label: "View Calendar",
          onClick: () => router.push("/dashboard/calendar"),
        },
      });
    } catch (error) {
      console.error("Schedule extraction error:", error);
      toast.error("Failed to extract schedule. Try generating a more detailed study plan.", {
        id: "schedule-extract"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const formattedDueAt = assignment ? formatDueAt(assignment.dueAt) : null;
  const isPreviewOpen = Boolean(previewState.file);
  const isPlanner = assignment?.id === "planning" || assignment?.id === "study-planning";

  return (
    <div style={chatHeightStyle} className="h-full flex flex-col">
      {/* MAIN CONTENT AREA (CHAT + RIGHT SIDEBAR) */}
      <div className="min-h-0 flex h-full">
        <div className="flex flex-1 min-w-0">

          {/* CHAT AREA (CENTER) */}
          <div
            className={`${isPreviewOpen ? "w-1/2" : "flex-1"} min-w-0 flex flex-col transition-[width] duration-200 bg-background`}
          >
            <div className="flex-1 overflow-y-auto px-6 pt-4 [mask-image:linear-gradient(to_bottom,black_calc(100%-60px),transparent_100%)]">
              <div className="mx-auto w-full pb-16">
                <ChatMessageList
                  messages={chatState.messages}
                  loading={chatState.status === "submitted"}
                  onRetry={actions.regenerate}
                />
              </div>
            </div>

            {/* BOTTOM INPUT BAR - Now inside chat column */}
            <div className="bg-background shrink-0">
              <div className="mx-auto w-full max-w-3xl pb-4">
                <ChatInputBar
                  value={chatState.input}
                  onChange={set.setInput}
                  onSubmit={actions.handleSubmit}
                  status={chatState.status}
                  setHasFiles={set.setHasFiles}
                  placeholder={assignment ? `Ask a question about ${assignment.title}` : undefined}
                  showScheduleButton={assignment?.id === "study-planning"}
                  onAddToSchedule={handleAddToSchedule}
                  isScheduleLoading={isExtracting}
                />
              </div>
            </div>
          </div>

          {/* ASSIGNMENT SIDEBAR / PREVIEW (RIGHT) */}
          {assignment && assignment.id !== "planning" && assignment.id !== "study-planning" ? (
            isPreviewOpen ? (
              <PdfPreviewPanel
                filename={previewState.file?.filename}
                previewUrl={previewState.url}
                loading={previewState.loading}
                error={previewState.error}
                onClose={closePreview}
              />
            ) : (
              <AssignmentSidebar
                title={assignment.title}
                description={assignment.description}
                formattedDueAt={formattedDueAt}
                files={assignment.files}
                onFileClick={openPreview}
              />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatDueAt(value?: string | Date | null) {
  if (!value) return null;
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
