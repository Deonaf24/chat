import { postToken, getMe, registerUser, postGoogleLogin } from "@/app/lib/api/auth"
import { User, UserCreate } from "@/app/types/auth"
import { setToken, getToken, initializeToken } from "./token";

const USER_STORAGE_KEY = "auth_user";

let currentUser: User | null = null;

const isBrowser = () => typeof window !== "undefined";

const setUser = (user: User | null) => {
    currentUser = user;
    if (!isBrowser()) return;
    if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
    }
};

export const authStore = {
    async register(first_name: string, last_name: string, email: string, password: string, password_confirm: string, is_teacher: boolean): Promise<User> {
        const data: UserCreate = {
            email: email,
            first_name: first_name,
            last_name: last_name,
            password: password,
            password_confirm: password_confirm,
            is_teacher: is_teacher
        }
        await registerUser(data);
        return this.login(email, password)
    },
    async login(email: string, password: string): Promise<User> {
        const response = await postToken(email, password);
        setToken(response.access_token);
        const user = await getMe();
        setUser(user);
        return user;
    },
    async googleLogin(payload: { id_token?: string, code?: string, is_teacher?: boolean, is_signup?: boolean }): Promise<User> {
        const response = await postGoogleLogin(payload);
        setToken(response.access_token);
        const user = await getMe();
        setUser(user);
        return user;
    },
    async hydrate(): Promise<User | null> {
        initializeToken(); // Ensure token is loaded

        if (!isBrowser()) return currentUser;
        const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

        const currentToken = getToken();
        if (!currentToken) return null;

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }

        try {
            const user = await getMe();
            setUser(user);
            return user;
        } catch (error) {
            this.clear();
            return null;
        }
    },
    logout() {
        setToken(null);
        setUser(null);
    },
    getToken: () => getToken(),
    getUser: () => currentUser,
    clear: () => {
        setToken(null);
        setUser(null);
    },
};


