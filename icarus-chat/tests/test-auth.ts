// scripts/test-auth.ts
import { authStore } from "@/app/lib/auth/authStore";
import { apiClient } from "@/app/lib/api/client";
import { getMe } from "@/app/lib/api/auth"
import { llm } from "@/app/lib/llm/llm"

async function main() {
  // 1) Expect 401 without token
  try {
    const res = await getMe();
    console.log("UNEXPECTED success (should be 401):");
  } catch (e: any) {
    console.log("Before login -> status:", e?.response?.status);
  }

  // 2) Login
  await authStore.login("deon", "deon123");

  // 3) Expect 200 with token auto-attached by interceptor
  const me = await getMe();
  console.log("After login -> data:", me.username);

  const chat_response = await llm.generate(1, "math", "3", "How do I do 2 + 2?", "U: hello\n A: Hi! How can I help?\n");
  console.log("User: How do I do 2 + 2? \nIcarus: " + chat_response);

  // 4) Logout
  authStore.logout();

  // 5) Expect 401 without token
  try {
    const res = await getMe();
    console.log("UNEXPECTED success (should be 401):");
  } catch (e: any) {
    console.log("After logout -> status:", e?.response?.status);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
