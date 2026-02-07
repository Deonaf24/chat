const TOKEN_STORAGE_KEY = "auth_token";

let token: string | null = null;
const isBrowser = () => typeof window !== "undefined";

export const getToken = () => token;

export const setToken = (value: string | null) => {
    token = value;
    if (!isBrowser()) return;
    if (value) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
};

export const initializeToken = () => {
    if (!isBrowser()) return;
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) token = stored;
};
