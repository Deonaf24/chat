"use client";

import { createContext, useContext } from "react";
import { ContextSchema } from "./types";

export const ContextContext = createContext<ContextSchema | null>(null);

export const useContextValue = () => {
    const context = useContext(ContextContext);

    if (!context) {
        throw new Error("Context components must be used within Context");
    }

    return context;
};
