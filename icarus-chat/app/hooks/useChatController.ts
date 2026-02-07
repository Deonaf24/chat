import { useState, useMemo, useEffect, useRef } from "react";
import { UIMessage } from "@/app/types/ui";
import { uid } from "@/app/lib/chat/ids";
import { toFilesFromUiParts } from "@/app/lib/chat/attachments";
import { llm } from "@/app/lib/llm/llm";
import { rag } from "@/app/lib/rag/rag";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

export function useChatController(assignment_id: string, initialLevel: number = 1, initialPrompt?: string, class_id?: number) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "submitted">("idle");
  const [input, setInput] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [level, setLevel] = useState(initialLevel);
  const [subject, setSubject] = useState("math");

  const [history, setHistory] = useState("");
  const [hasFiles, setHasFiles] = useState(false);
  const [bugFix, setBugFix] = useState("")

  const initialPromptSent = useRef(false);

  // Auto-submit initial prompt
  useEffect(() => {
    if (initialPrompt && !initialPromptSent.current && messages.length === 0 && status === "idle") {
      initialPromptSent.current = true;
      submitHiddenPrompt(initialPrompt);
    }
  }, [initialPrompt]);

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

  const submitHiddenPrompt = async (text: string) => {
    const userText = text.trim();
    const pendingHistory = history + `U: ${userText}\n`;
    setStatus("submitted");
    try {
      if (level == 2) {
        const newprompt = bugFix + userText;
        const reply = await llm.generate(assignment_id, level, subject, newprompt, history, class_id);
        push("assistant", String(reply ?? ""));
        setHistory(pendingHistory + `A: ${reply}\n`);
      } else {
        const reply = await llm.generate(assignment_id, level, subject, userText, history, class_id);
        push("assistant", String(reply ?? ""));
        setHistory(pendingHistory + `A: ${reply}\n`);
      }
    } catch {
      push("assistant", "You must be logged in in order to send a request.");
    } finally {
      setStatus("idle");
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    const hasAttachments = Boolean(message.files?.length);
    if (!hasText && !hasAttachments) return;

    if (hasAttachments) {
      const realFiles = await toFilesFromUiParts(message.files!);
      await Promise.all(realFiles.map((f) => rag.uploadOne(f, assignment_id)));
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

        if (level == 2) {
          const newprompt = bugFix + userText;
          const reply = await llm.generate(assignment_id, level, subject, newprompt, history, class_id);
          push("assistant", String(reply ?? ""));
          setHistory(pendingHistory + `A: ${reply}\n`);
        }
        else {
          const reply = await llm.generate(assignment_id, level, subject, userText, history, class_id);
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
      const reply = await llm.generate(assignment_id, level, subject, lastUserMessage, history);
      replaceLastAssistant(String(reply ?? ""));
    } catch {
      replaceLastAssistant("Retry failed — please try again.");
    } finally {
      setStatus("idle");
    }
  };

  /**
   * Silently extract schedule events from the conversation.
   * Does NOT add any messages to the chat.
   * Returns parsed events or throws error.
   */
  const extractScheduleEvents = async (): Promise<{
    events: Array<{
      title: string;
      description?: string;
      start: string;
      end: string;
    }>;
  }> => {
    const now = new Date();
    const dateContext = `Current Date/Time: ${now.toISOString()} (${now.toDateString()})`;

    const extractionPrompt = `Based on the study plan we discussed, extract all study tasks and return ONLY a JSON object (no other text).

${dateContext}

Format:
{"events":[{"title":"Task Name","description":"Brief description","start":"YYYY-MM-DDTHH:MM:SS","end":"YYYY-MM-DDTHH:MM:SS"}]}

Rules:
1. Use realistic dates starting from ${now.toDateString()}.
2. Do not schedule events in the past.
3. Each session should be 30-60 minutes.
4. Return VALID JSON only.`;

    const reply = await llm.generate(assignment_id, level, subject, extractionPrompt, history);
    const replyStr = String(reply ?? "");

    // Parse JSON from response (may be wrapped in ```json blocks)
    // Match outermost braces to capture the JSON object
    const jsonMatch = replyStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse schedule from AI response");
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.events) throw new Error("Missing events array");
      return parsed;
    } catch (e) {
      console.error("JSON Parse Error", e);
      throw new Error("Failed to parse extracted JSON");
    }
  };

  return {
    state: { messages, status, input, lastUserMessage, hasFiles, canSubmit, history },
    set: { setInput, setHasFiles, setHistory },
    actions: { handleSubmit, regenerate, extractScheduleEvents },
  };
}

