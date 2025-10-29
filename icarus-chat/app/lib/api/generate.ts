import { apiClient } from "./client";
import { PromptRequest, GenerateResponse } from "@/app/types/prompts";

export async function postGenerate(prompt: PromptRequest): Promise<GenerateResponse> {
    const response = await apiClient.post<GenerateResponse>('/generate', prompt);
    return response.data;
}