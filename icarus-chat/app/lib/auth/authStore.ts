import { postToken, getMe } from  "@/app/lib/api/auth.ts"
import { User } from "@/app/types/auth.ts"

let token: string | null = null;
let currentUser: User | null = null;

export const authStore = {
    async login(username: string, password: string): Promise<User>{
        const response = await postToken(username, password);
        token = response.access_token;
        const user = await getMe();
        currentUser = user;
        return currentUser;
    },
    logout() {
        token = null;
        currentUser = null;
    },
    getToken: () => token,
    clear: () => {token = null },
};

