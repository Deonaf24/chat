import { apiClient } from "./client";
import {UserCreate, Token, User} from "@/app/types/auth";


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

export async function registerUser(data: UserCreate): Promise<User> {
  console.log("Data payload:", data);
  const response = await apiClient.post<User>('/auth/register', {
    username: data.username,
    email: data.email,
    password: data.password,
    password_confirm: data.password_confirm,
    is_teacher: data.is_teacher,
  });
  
  return response.data;
}