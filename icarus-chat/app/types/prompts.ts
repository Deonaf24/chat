export interface PromptRequest {
    assignment_id: string,
    level: string,
    subject: string,
    q_number: string,
    user_message: string,
    history: string,
}

export interface GenerateResponse { answer: string }
  