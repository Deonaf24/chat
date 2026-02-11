"use client";

import { Fragment, type HTMLAttributes, type ReactNode } from "react";
import { usePromptInputAttachments } from "./hooks";
import type { FileUIPart } from "ai";

export type PromptInputAttachmentsProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    "children"
> & {
    children: (attachment: FileUIPart & { id: string }) => ReactNode;
};

export function PromptInputAttachments({
    children,
}: PromptInputAttachmentsProps) {
    const attachments = usePromptInputAttachments();

    if (!attachments.files.length) {
        return null;
    }

    return attachments.files.map((file) => (
        <Fragment key={file.id}>{children(file)}</Fragment>
    ));
}
