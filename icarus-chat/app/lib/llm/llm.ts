import { postGenerate } from "@/app/lib/api/generate";
import { PromptRequest, GenerateResponse } from "@/app/types/prompts";

export const llm = {
    async generate(assignment_id: string, level: number, subject: string, user_message: string, history: string): Promise<string> {
        const req: PromptRequest = {
            assignment_id: assignment_id.toString(),
            level: "L" + level,
            subject: subject,
            user_message: user_message,
            history: history,
        }
        console.log(req);
        const response = await postGenerate(req);
        return response.answer;
    }
}