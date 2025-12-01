"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/section/navbar/default";
import { ChatInputBar } from "../chatinputbar/default";
import { ChatMessageList } from "../chatbox/default";
import { useChatController } from "@/app/hooks/useChatController";
import { authStore } from "@/app/lib/auth/authStore";
import { ClassNavigationSidebar } from "../sidebar/class-navigation";
import { ClassRead } from "@/app/types/school";
import { useFilePreview } from "@/app/hooks/useFilePreview";
import { AssignmentSidebar } from "./assignment-sidebar";
import { PdfPreviewPanel } from "./pdf-preview-panel";

type AssignmentChatContext = {
  id: string
  title: string;
  description?: string | null;
  dueAt?: string | Date | null;
  files?: { id: number; filename: string; path: string }[];
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
}: {
  assignment: AssignmentChatContext;
  classNavigation?: ClassNavigationContext;
}) {
  const router = useRouter();
  const { state: chatState, set, actions } = useChatController(assignment.id);
  const { state: previewState, openPreview, closePreview } = useFilePreview();


  const chatHeightStyle = {
    "--chat-h": "clamp(560px, 70dvh, 720px)",
  } as CSSProperties;

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  const formattedDueAt = assignment ? formatDueAt(assignment.dueAt) : null;
  const isPreviewOpen = Boolean(previewState.file);

  return (
    <div style={chatHeightStyle} className="h-dvh grid grid-rows-[auto,1fr,auto]">

      {/* LEFT CLASS NAVIGATION */}
      {classNavigation ? (
        <ClassNavigationSidebar
          classes={classNavigation.classes}
          currentClassId={classNavigation.currentClassId}
          loading={classNavigation.loading}
          onNavigate={classNavigation.onNavigate}
        />
      ) : null}

      {/* TOP NAVBAR */}
      <div className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-6xl">
          <Navbar actions={[{ text: "Logout", variant: "secondary", onClick: handleLogout }]} />
        </div>
      </div>

      {/* MAIN CONTENT AREA (CHAT + RIGHT SIDEBAR) */}
      <div className="min-h-0 flex h-full">
        <div className="flex flex-1 min-w-0">
          {/* CHAT AREA (CENTER) */}
          <div
            className={`${isPreviewOpen ? "w-1/2" : "flex-1"} min-w-0 flex flex-col px-6 py-4 overflow-y-auto transition-[width] duration-200`}
          >
            <div className="min-h-0 flex-1">
              <div className="mx-auto w-full max-w-6xl">
                <ChatMessageList
                  messages={chatState.messages}
                  loading={chatState.status === "submitted"}
                  onRetry={actions.regenerate}
                />
              </div>
            </div>
          </div>

          {/* ASSIGNMENT SIDEBAR / PREVIEW (RIGHT) */}
          {assignment ? (
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

      {/* BOTTOM INPUT BAR */}
      <div className="border-t bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-3">
          <ChatInputBar
            value={chatState.input}
            onChange={set.setInput}
            onSubmit={actions.handleSubmit}
            status={chatState.status}
            level={chatState.level}
            subject={chatState.subject}
            qNumber={chatState.qNumber}
            setLevel={set.setLevel}
            setSubject={set.setSubject}
            setQNumber={set.setQNumber}
            setHasFiles={set.setHasFiles}
            placeholder={assignment ? `Ask a question about ${assignment.title}` : undefined}
          />
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
