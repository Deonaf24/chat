export interface PromptRequest {
    level: number,
    subject: string,
    q_number: string,
    user_message: string,
}

export interface GenerateResponse { response: string }
  