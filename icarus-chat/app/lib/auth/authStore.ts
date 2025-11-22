import { postToken, getMe, registerUser } from  "@/app/lib/api/auth"
import { User, UserCreate } from "@/app/types/auth"

let token: string | null = null;
let currentUser: User | null = null;

export const authStore = {
    async register(username: string, email: string, password: string, password_confirm: string, full_name: string, is_teacher: boolean): Promise<User>{
        const data: UserCreate = {
            username: username, 
            email: email, 
            password: password, 
            password_confirm: password_confirm, 
            full_name: full_name, 
            is_teacher: is_teacher
        }
        const responseUser = await registerUser(data);
        return this.login(username, password)
    },
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

