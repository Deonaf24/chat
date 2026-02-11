"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type ClipboardEventHandler,
    type ComponentProps,
    type KeyboardEventHandler,
} from "react";
import { cn } from "@/lib/utils";
import { InputGroupTextarea } from "@/components/ui/input-group";
import {
    useOptionalPromptInputController,
    usePromptInputAttachments,
} from "./hooks";

export type PromptInputTextareaProps = ComponentProps<
    typeof InputGroupTextarea
>;

export const PromptInputTextarea = ({
    onChange,
    className,
    placeholder = "What would you like to know?",
    value,
    ...props
}: PromptInputTextareaProps) => {
    const controller = useOptionalPromptInputController();
    const attachments = usePromptInputAttachments();
    const [isComposing, setIsComposing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-resize using scrollHeight
    const autosize = useCallback(() => {
        const el = textareaRef.current;
        if (!el) {
            return;
        }
        el.style.height = "0px";
        el.style.height = `${el.scrollHeight}px`;
    }, []);

    // Re-run autosize when value changes (controlled component)
    useEffect(() => {
        autosize();
    }, [value, controller?.textInput.value, autosize]);

    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === "Enter") {
            if (isComposing || e.nativeEvent.isComposing) {
                return;
            }
            if (e.shiftKey) {
                return;
            }
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }

        // Remove last attachment when Backspace is pressed and textarea is empty
        if (
            e.key === "Backspace" &&
            e.currentTarget.value === "" &&
            attachments.files.length > 0
        ) {
            e.preventDefault();
            const lastAttachment = attachments.files.at(-1);
            if (lastAttachment) {
                attachments.remove(lastAttachment.id);
            }
        }
    };

    const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
        const items = event.clipboardData?.items;

        if (!items) {
            return;
        }

        const files: File[] = [];

        for (const item of items) {
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }

        if (files.length > 0) {
            event.preventDefault();
            attachments.add(files);
        }
    };

    const controlledProps = controller
        ? {
            value: controller.textInput.value,
            onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
                controller.textInput.setInput(e.currentTarget.value);
                onChange?.(e);
            },
        }
        : {
            value,
            onChange,
        };

    return (
        <InputGroupTextarea
            ref={textareaRef}
            className={cn("min-h-[44px] overflow-hidden", className)}
            name="message"
            onCompositionEnd={() => setIsComposing(false)}
            onCompositionStart={() => setIsComposing(true)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onInput={autosize}
            placeholder={placeholder}
            {...props}
            {...controlledProps}
        />
    );
};
