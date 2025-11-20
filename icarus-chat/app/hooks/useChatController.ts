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
  const [history, setHistory] = useState("");
  const [hasFiles, setHasFiles] = useState(false);
  const [bugFix, setBugFix] = useState("THE FOLLOWING SENTENCE IS VERY IMPORTANT AND TAKES PRECEDANCE OVER ALL ELSE: NEVER EVER mention outline and micro steps in the output. Do not use a formulaic template style answer such including the outline plan and microstep when answering this question. Instead give a an depth but socratic natural language response:\n")

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

      const pendingHistory = history + `U: ${userText}\n`;

      setStatus("submitted");
      try {
        
        if (level == 2){
            const newprompt = bugFix + userText;
            const reply = await llm.generate(level, subject, qNumber, newprompt, history);
            push("assistant", String(reply ?? ""));
            setHistory(pendingHistory + `A: ${reply}\n`);
        }
        else{
            const reply = await llm.generate(level, subject, qNumber, userText, history);
            push("assistant", String(reply ?? ""));
            setHistory(pendingHistory + `A: ${reply}\n`);
        }
      } catch {
        push("assistant", "You must be logged in in order to send a request.");
      } finally {
        setStatus("idle");
      }
    }
  };

  const regenerate = async () => {
    if (!lastUserMessage) return;
    setStatus("submitted");
    try {
      const reply = await llm.generate(level, subject, qNumber, lastUserMessage, history);
      replaceLastAssistant(String(reply ?? ""));
    } catch {
      replaceLastAssistant("Retry failed — please try again.");
    } finally {
      setStatus("idle");
    }
  };

  return {
    state: { messages, status, input, lastUserMessage, level, subject, qNumber, hasFiles, canSubmit, history },
    set: { setInput, setLevel, setSubject, setQNumber, setHasFiles, setHistory },
    actions: { handleSubmit, regenerate },
  };
}
