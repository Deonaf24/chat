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

export function ChatMessageList({
  messages,
  loading,
  onRetry,
}: {
  messages: UIMessage[];
  loading: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="h-full min-h-119 overflow-y-auto">
        <Conversation className="flex flex-col">
            <ConversationContent>
                {messages.map((message, mi) => (
                <div key={message.id}>
                    {message.parts.map((part, pi) => (
                    <Fragment key={`${message.id}-${pi}`}>
                        <Message from={message.role}>
                        <MessageContent><Response>{part.text}</Response></MessageContent>
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
