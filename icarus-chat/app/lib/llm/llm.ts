import { postGenerate } from "@/app/lib/api/generate";
import { PromptRequest, GenerateResponse } from "@/app/types/prompts";

export const llm = {
    async generate(level: number, subject: string, q_number: string, user_message: string): Promise<string> {
        const req: PromptRequest = {
            level: level,
            subject: subject,
            q_number: q_number,
            user_message: user_message,
        }
        const response = await postGenerate(req);
        return response.response;
    }
}