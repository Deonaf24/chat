"use client";

import { usePromptInputAttachments } from "./hooks";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ImageIcon } from "lucide-react";
import type { ComponentProps } from "react";

export type PromptInputActionAddAttachmentsProps = ComponentProps<
    typeof DropdownMenuItem
> & {
    label?: string;
};

export const PromptInputActionAddAttachments = ({
    label = "Add photos or files",
    ...props
}: PromptInputActionAddAttachmentsProps) => {
    const attachments = usePromptInputAttachments();

    return (
        <DropdownMenuItem
            {...props}
            onSelect={(e) => {
                e.preventDefault();
                attachments.openFileDialog();
            }}
        >
            <ImageIcon className="mr-2 size-4" /> {label}
        </DropdownMenuItem>
    );
};
