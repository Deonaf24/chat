import type { LanguageModelUsage } from "ai";

export type ModelId = string;

export type ContextSchema = {
    usedTokens: number;
    maxTokens: number;
    usage?: LanguageModelUsage;
    modelId?: ModelId;
};

export const PERCENT_MAX = 100;
export const ICON_RADIUS = 10;
export const ICON_VIEWBOX = 24;
export const ICON_CENTER = 12;
export const ICON_STROKE_WIDTH = 2;
