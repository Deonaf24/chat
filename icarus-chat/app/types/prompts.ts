export interface PromptRequest {
    level: string,
    subject: string,
    q_number: string,
    user_message: string,
    history: string,
}

export interface GenerateResponse { answer: string }
  