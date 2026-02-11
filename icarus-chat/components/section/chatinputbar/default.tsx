import { useEffect } from "react";

import {
  PromptInput, PromptInputHeader, PromptInputAttachments, PromptInputAttachment,
  PromptInputBody, PromptInputTextarea, PromptInputFooter, PromptInputTools,
  PromptInputActionMenu, PromptInputActionMenuTrigger, PromptInputActionMenuContent,
  PromptInputActionAddAttachments, PromptInputButton, PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

import { CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInputBar({
  value, onChange, onSubmit, status,
  setHasFiles,
  placeholder,
  showScheduleButton,
  onAddToSchedule,
  isScheduleLoading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (m: PromptInputMessage) => void;
  status: "idle" | "submitted";
  setHasFiles: (b: boolean) => void;
  placeholder?: string;
  showScheduleButton?: boolean;
  onAddToSchedule?: () => void;
  isScheduleLoading?: boolean;
}) {
  useEffect(() => {
    setHasFiles(false);
  }, [setHasFiles]);
  const submitStatus = status === "submitted" ? "submitted" : undefined;

  return (
    <div className="relative bg-background">
      {/* Floating Add to Schedule button */}
      {showScheduleButton && (
        <div className="absolute -top-12 right-6 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddToSchedule}
            disabled={isScheduleLoading}
            className="gap-2 text-muted-foreground hover:text-foreground bg-background shadow-sm"
          >
            {isScheduleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarPlus className="h-4 w-4" />
            )}
            {isScheduleLoading ? "Adding..." : "Add to Schedule"}
          </Button>
        </div>
      )}
      <div className="max-w-4xl mx-auto w-full px-6 py-2">
        {/* Clean pill-shaped input container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) {
              onSubmit({ text: value });
            }
          }}
          className="flex items-end gap-3 px-4 py-3 bg-muted border border-border rounded-[28px] focus-within:border-foreground/20 transition-colors"
        >
          {/* Left: + attachment button */}
          <button
            type="button"
            className="h-9 w-9 rounded-full bg-transparent hover:bg-background/50 flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>

          {/* Center: Textarea */}
          <textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (value.trim()) {
                  onSubmit({ text: value });
                }
              }
            }}
            placeholder={placeholder || "Ask anything"}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-base placeholder:text-muted-foreground/60 min-h-[24px] max-h-[200px] py-1 transition-[height] duration-150 ease-out"
          />

          {/* Right: Send button */}
          <button
            type="submit"
            disabled={status === "submitted" || !value.trim()}
            className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground/40 mt-3 font-light">
          Socratica can generate incorrect information. Please verify important details.
        </p>
      </div>
    </div>
  );
}
