import { apiClient } from "./client";
import {Token, User} from "@/app/types/auth";


export async function postToken(username: string, password: string): Promise<Token> {

  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const response = await apiClient.post<Token>('/auth/token', body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/auth/users/me/');
  return response.data;
}