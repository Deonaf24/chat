import { useEffect } from "react";

import {
    PromptInput, PromptInputHeader, PromptInputAttachments, PromptInputAttachment,
    PromptInputBody, PromptInputTextarea, PromptInputFooter, PromptInputTools,
    PromptInputActionMenu, PromptInputActionMenuTrigger, PromptInputActionMenuContent,
    PromptInputActionAddAttachments, PromptInputButton, PromptInputSubmit,
  } from "@/components/ai-elements/prompt-input";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
  
  export function ChatInputBar({
    value, onChange, onSubmit, status,
    level, subject, qNumber,
    setLevel, setSubject, setQNumber,
    setHasFiles,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    onSubmit: (m: PromptInputMessage) => void;
    status: "idle" | "submitted";
    level: number; subject: string; qNumber: string;
    setLevel: (n: number) => void;
    setSubject: (s: string) => void;
    setQNumber: (s: string) => void;
    setHasFiles: (b: boolean) => void;
    placeholder?: string;
  }) {
    useEffect(() => {
      setHasFiles(false);
    }, [setHasFiles]);
    const submitStatus = status === "submitted" ? "submitted" : undefined;
    return (
      <div className=" bg-background">
        <div className="max-w-4xl mx-auto w-full px-6 py-3">
          <PromptInput onSubmit={onSubmit} className="mt-0" globalDrop multiple>
            {/* Attachments */}
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>
  
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => onChange(e.target.value)}
                value={value}
                placeholder={placeholder}
              />
            </PromptInputBody>
  
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
  
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Level</label>
                  <input
                    type="number" min={1}
                    className="w-16 rounded-md border px-2 py-1 text-sm"
                    value={level} onChange={(e) => setLevel(parseInt(e.target.value || "1", 10))}
                  />
                  <label className="text-xs text-muted-foreground">Subject</label>
                  <input
                    type="text"
                    className="w-28 rounded-md border px-2 py-1 text-sm"
                    value={subject} onChange={(e) => setSubject(e.target.value)}
                  />
                  <label className="text-xs text-muted-foreground">Question</label>
                  <input
                    type="text"
                    className="w-16 rounded-md border px-2 py-1 text-sm"
                    value={qNumber}
                    onChange={(e) => setQNumber(e.target.value)}
                  />
                </div>
  
                <PromptInputButton variant="ghost" disabled>{/* slot */}</PromptInputButton>
              </PromptInputTools>
  
              <PromptInputSubmit
                disabled={status === "submitted" && !value.trim()}
                status={submitStatus}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    );
  }
  