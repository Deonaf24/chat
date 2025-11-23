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

type AssignmentChatContext = {
  title: string;
  description?: string | null;
  dueAt?: string | Date | null;
  files?: { id: number; filename: string; path: string }[];
};

export default function ChatLayout({ assignment }: { assignment?: AssignmentChatContext }) {
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
      <div className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto w-full">
          <Navbar actions={[{ text: "Logout", variant: "secondary", onClick: handleLogout }]} />
        </div>
      </div>

      <div className="min-h-0">
        <div className="max-w-4xl mx-auto flex h-full w-full flex-col px-6 py-4">
          {assignment ? (
            <div className="mb-4 rounded-xl border bg-card/60 p-4 shadow-sm">
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
                        <span className="truncate max-w-[12rem]" title={file.filename}>
                          {file.filename}
                        </span>
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="min-h-0 flex-1">
            <ChatMessageList
              messages={state.messages}
              loading={state.status === "submitted"}
              onRetry={actions.regenerate}
            />
          </div>
        </div>
      </div>

      <div className="border-t bg-background">
        <div className="max-w-4xl mx-auto w-full px-6 py-3">
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
