"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, FileText } from "lucide-react";

import Navbar from "@/components/section/navbar/default";
import { Badge } from "@/components/ui/badge";
import { ChatInputBar } from "../chatinputbar/default";
import { ChatMessageList } from "../chatbox/default";
import { useChatController } from "@/app/hooks/useChatController";
import { authStore } from "@/app/lib/auth/authStore";
import { ClassNavigationSidebar } from "../sidebar/class-navigation";
import { ClassRead } from "@/app/types/school";

type AssignmentChatContext = {
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
  assignment?: AssignmentChatContext;
  classNavigation?: ClassNavigationContext;
}) {
  const router = useRouter();
  const { state, set, actions } = useChatController();

  const chatHeightStyle = {
    "--chat-h": "clamp(560px, 70dvh, 720px)",
  } as CSSProperties;

  const handleLogout = () => {
    authStore.logout();
    router.replace("/");
  };

  const formattedDueAt = assignment ? formatDueAt(assignment.dueAt) : null;

  return (
    <div
      style={chatHeightStyle}
      className="h-dvh grid grid-rows-[auto,var(--chat-h),auto]"
    >
      {classNavigation ? (
        <ClassNavigationSidebar
          classes={classNavigation.classes}
          currentClassId={classNavigation.currentClassId}
          loading={classNavigation.loading}
          onNavigate={classNavigation.onNavigate}
        />
      ) : null}
      <div className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-6xl">
          <Navbar actions={[{ text: "Logout", variant: "secondary", onClick: handleLogout }]} />
        </div>
      </div>

      <div className="min-h-0">
        <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-[minmax(0,1.6fr),minmax(320px,1fr)]">
          <div className="flex min-h-0 flex-col lg:col-start-1 lg:row-start-1">
            <div className="min-h-0 flex-1">
              <ChatMessageList
                messages={state.messages}
                loading={state.status === "submitted"}
                onRetry={actions.regenerate}
              />
            </div>
          </div>

          {assignment ? (
            <aside className="lg:col-start-2 lg:row-start-1 lg:self-start lg:pt-1">
              <div className="rounded-xl border bg-card/60 p-4 shadow-sm lg:sticky lg:top-28">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Assignment Chat</Badge>
                    {formattedDueAt ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        <span>Due {formattedDueAt}</span>
                      </Badge>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-xl font-semibold leading-tight">{assignment.title}</h1>
                    {assignment.description ? (
                      <p className="text-sm text-muted-foreground">{assignment.description}</p>
                    ) : null}
                  </div>
                  {assignment.files && assignment.files.length > 0 ? (
                    <div className="flex flex-wrap gap-2" aria-label="Assignment files">
                      {assignment.files.map((file) => (
                        <Badge key={file.id} variant="outline" className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="max-w-[12rem] truncate" title={file.filename}>
                            {file.filename}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      <div className="border-t bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-3">
          <ChatInputBar
            value={state.input}
            onChange={set.setInput}
            onSubmit={actions.handleSubmit}
            status={state.status}
            level={state.level}
            subject={state.subject}
            qNumber={state.qNumber}
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
