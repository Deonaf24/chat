import { apiClient } from "./client";
import { UserCreate, Token, User } from "@/app/types/auth";


export async function postToken(username: string, password: string): Promise<Token> {

  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const response = await apiClient.post<Token>('/auth/token', body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
}

export async function postGoogleLogin(payload: { id_token?: string, code?: string, is_teacher?: boolean, is_signup?: boolean }): Promise<Token> {
  const response = await apiClient.post<Token>('/auth/auth/google', payload);
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
    first_name: data.first_name,
    last_name: data.last_name,
    password: data.password,
    is_teacher: data.is_teacher,
  });

  return response.data;
}

export async function listUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>("/auth/users");
  return response.data;
}

export async function getUser(userId: number): Promise<User> {
  const response = await apiClient.get<User>(`/auth/users/${userId}`);
  return response.data;
}

export async function deleteUser(userId: number): Promise<User> {
  const response = await apiClient.delete<User>(`/auth/users/${userId}`);
  return response.data;
}