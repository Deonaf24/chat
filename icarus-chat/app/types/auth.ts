
export interface Token {
    access_token: string,
    token_type: string,
}

export interface TokenData {
    username?: string | null,
}

export interface User {
    username: string,
    email?: string | null,
    full_name?: string | null,
    disabled?: boolean | null,
}

export interface UserInDB {
    hashed_password: string,
}