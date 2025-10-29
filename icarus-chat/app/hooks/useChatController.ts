import { useState, useMemo } from "react";
import { UIMessage } from "@/app/types/ui";
import { uid } from "@/app/lib/chat/ids";
import { toFilesFromUiParts } from "@/app/lib/chat/attachments";
import { llm } from "@/app/lib/llm/llm";
import { rag } from "@/app/lib/rag/rag";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

export function useChatController() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "submitted">("idle");
  const [input, setInput] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [level, setLevel] = useState(1);
  const [subject, setSubject] = useState("math");
  const [qNumber, setQNumber] = useState("1");
  const [hasFiles, setHasFiles] = useState(false);

  const canSubmit = useMemo(
    () => Boolean(input.trim()) || status === "submitted",
    [input, status]
  );

  const push = (role: UIMessage["role"], text: string) =>
    setMessages(m => [...m, { id: uid(), role, parts: [{ type: "text", text }] }]);

  const replaceLastAssistant = (text: string) =>
    setMessages(m => {
      const lastIdx = [...m].reverse().findIndex(x => x.role === "assistant");
      if (lastIdx === -1) return [...m, { id: uid(), role: "assistant", parts: [{ type: "text", text }] }];
      const idx = m.length - 1 - lastIdx;
      const copy = m.slice();
      copy[idx] = { ...copy[idx], parts: [{ type: "text", text }] };
      return copy;
    });

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    const hasAttachments = Boolean(message.files?.length);
    if (!hasText && !hasAttachments) return;

    if (hasAttachments) {
      const realFiles = await toFilesFromUiParts(message.files!);
      await Promise.all(realFiles.map((f) => rag.uploadOne(f)));
      setHasFiles(true);
    }

    if (hasText) {
      const userText = message.text!.trim();
      push("user", userText);
      setInput("");
      setLastUserMessage(userText);

      setStatus("submitted");
      try {
        const reply = await llm.generate(level, subject, qNumber, userText);
        push("assistant", String(reply ?? ""));
      } catch {
        push("assistant", "Sorry — something went wrong generating a reply.");
      } finally {
        setStatus("idle");
      }
    }
  };

  const regenerate = async () => {
    if (!lastUserMessage) return;
    setStatus("submitted");
    try {
      const reply = await llm.generate(level, subject, qNumber, lastUserMessage);
      replaceLastAssistant(String(reply ?? ""));
    } catch {
      replaceLastAssistant("Retry failed — please try again.");
    } finally {
      setStatus("idle");
    }
  };

  return {
    state: { messages, status, input, lastUserMessage, level, subject, qNumber, hasFiles, canSubmit },
    set: { setInput, setLevel, setSubject, setQNumber, setHasFiles },
    actions: { handleSubmit, regenerate },
  };
}
