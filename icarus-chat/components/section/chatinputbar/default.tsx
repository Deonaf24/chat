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
  setHasFiles,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (m: PromptInputMessage) => void;
  status: "idle" | "submitted";
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
                {/* Inputs removed as per request */}
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
