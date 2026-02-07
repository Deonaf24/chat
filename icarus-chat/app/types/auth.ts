
export interface Token {
    access_token: string,
    token_type: string,
}

export interface TokenData {
    username?: string | null,
}

export interface User {
    id?: number;
    username?: string | null;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    disabled?: boolean | null;
    is_teacher?: boolean;
}

export interface UserInDB {
    hashed_password: string,
}

export interface UserCreate {
    username?: string,
    email: string,
    first_name: string,
    last_name: string,
    password: string,
    password_confirm: string,
    is_teacher: boolean,
}