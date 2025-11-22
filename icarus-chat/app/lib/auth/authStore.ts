import { postToken, getMe, registerUser } from "@/app/lib/api/auth"
import { User, UserCreate } from "@/app/types/auth"

const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

let token: string | null = null;
let currentUser: User | null = null;

const isBrowser = () => typeof window !== "undefined";

const setToken = (value: string | null) => {
    token = value;
    if (!isBrowser()) return;
    if (value) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
};

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
    async register(username: string, email: string, password: string, password_confirm: string, is_teacher: boolean): Promise<User>{
        const data: UserCreate = {
            username: username,
            email: email,
            password: password,
            password_confirm: password_confirm,
            is_teacher: is_teacher
        }
        await registerUser(data);
        return this.login(username, password)
    },
    async login(username: string, password: string): Promise<User>{
        const response = await postToken(username, password);
        setToken(response.access_token);
        const user = await getMe();
        setUser(user);
        return user;
    },
    async hydrate(): Promise<User | null> {
        if (!isBrowser()) return currentUser;
        const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

        if (!storedToken) return null;

        setToken(storedToken);
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
    getToken: () => token,
    getUser: () => currentUser,
    clear: () => {
        setToken(null);
        setUser(null);
    },
};


