"use client";

import { ComponentProps } from "react";
import { HoverCard } from "@/components/ui/hover-card";
import { ContextSchema } from "./types";
import { ContextContext } from "./store";

export type ContextProps = ComponentProps<typeof HoverCard> & ContextSchema;

export const Context = ({
    usedTokens,
    maxTokens,
    usage,
    modelId,
    ...props
}: ContextProps) => (
    <ContextContext.Provider
        value={{
            usedTokens,
            maxTokens,
            usage,
            modelId,
        }}
    >
        <HoverCard closeDelay={0} openDelay={0} {...props} />
    </ContextContext.Provider>
);
