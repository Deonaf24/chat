import Navbar from "@/components/section/navbar/default";
import { PropsWithChildren } from "react";
import { ChatInputBar } from "../chatinputbar/default";
import { ChatMessageList } from "../chatbox/default";
import { useChatController } from "@/app/hooks/useChatController";

export default function ChatLayout({ children }: PropsWithChildren) {

    const { state, set, actions } = useChatController();
    
    return (
    <div
        style={{ ["--chat-h" as any]: "clamp(560px, 70dvh, 720px)" }}
        className="h-dvh grid grid-rows-[auto,var(--chat-h),auto]"
    >
        <div className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-4xl mx-auto w-full">
                <Navbar />
            </div>
        </div>

        {/* Row 2: fixed height container that ONLY the inner list scrolls */}
        <div className="min-h-0"> 
            {/* Don't put overflow here; put it on the list element below */}
            <div className="max-w-4xl mx-auto w-full px-6 py-4 h-full">
            {/* ChatMessageList goes here */}
            <ChatMessageList
                messages={state.messages}
                loading={state.status === "submitted"}
                onRetry={actions.regenerate}
            />
            </div>
        </div>

        {/* Row 3: pinned footer */}
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
            />
            </div>
        </div>
    </div>
    );
}
