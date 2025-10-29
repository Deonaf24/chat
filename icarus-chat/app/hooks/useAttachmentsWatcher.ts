import { useEffect } from "react";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";

export function useAttachmentsWatcher(onChange: (has: boolean) => void) {
  const { files } = usePromptInputAttachments();
  useEffect(() => { onChange(files.length > 0); }, [files.length, onChange]);
}
