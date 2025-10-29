export type Role = "user" | "assistant";

export type Part = {
  type: "text"; // we only use text per your backend
  text: string;
};

export type UIMessage = {
  id: string;
  role: Role;
  parts: Part[];
};