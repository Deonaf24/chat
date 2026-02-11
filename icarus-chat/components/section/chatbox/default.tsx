import { Fragment } from "react";
import { UIMessage } from "@/app/types/ui";
import {
    Conversation, ConversationContent, ConversationScrollButton
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Actions, Action } from "@/components/ai-elements/actions";
import { Loader } from "@/components/ai-elements/loader";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { useRef, useEffect } from "react"

export function ChatMessageList({
    messages,
    loading,
    onRetry,
}: {
    messages: UIMessage[];
    loading: boolean;
    onRetry: () => void;
}) {

    const lastMessageRef = useRef<HTMLDivElement>(null);
    const prevMsgLength = useRef(messages.length);

    useEffect(() => {
        // Only scroll if a NEW message was added
        if (messages.length > prevMsgLength.current) {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        prevMsgLength.current = messages.length;
    }, [messages.length]);

    return (
        <div className="h-full min-h-119 overflow-y-auto">
            <Conversation className="flex flex-col">
                <ConversationContent>
                    {messages.map((message, mi) => (
                        <div
                            key={message.id}
                            ref={mi === messages.length - 1 ? lastMessageRef : null}
                        >
                            {message.parts.map((part, pi) => (
                                <Fragment key={`${message.id}-${pi}`}>
                                    <Message from={message.role}>
                                        <MessageContent variant="flat">
                                            {message.role === "user" ? (
                                                <div className="whitespace-pre-wrap">{part.text}</div>
                                            ) : (
                                                <Response>{part.text}</Response>
                                            )}
                                        </MessageContent>
                                    </Message>
                                    {message.role === "assistant" && mi === messages.length - 1 && (
                                        <Actions className="mt-2">
                                            <Action onClick={onRetry} label="Retry">
                                                <RefreshCcwIcon className="size-3" />
                                            </Action>
                                            <Action
                                                onClick={() => navigator.clipboard.writeText(part.text)}
                                                label="Copy"
                                            >
                                                <CopyIcon className="size-3" />
                                            </Action>
                                        </Actions>
                                    )}
                                </Fragment>
                            ))}
                        </div>
                    ))}
                    {loading && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>
        </div>
    );
}

function useScrollToBottomOnMessageChange(messages: UIMessage[]) {
    const endRef = useRef<HTMLDivElement>(null);
    const lastMessageCount = useRef(messages.length);

    useEffect(() => {
        // Only scroll if a NEW message was added (length increased)
        // This prevents auto-scrolling to bottom while the AI is streaming (updating the same message)
        if (messages.length > lastMessageCount.current) {
            endRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            // block: "start" aligns the top of the element to the top of the viewport
            // But endRef is at the *bottom* of the list.
            // If we scroll endRef to start, we show the bottom filler?
            // Wait, we want to scroll the *new message* to view.
        }
        lastMessageCount.current = messages.length;
    }, [messages.length]);

    return endRef;
}

