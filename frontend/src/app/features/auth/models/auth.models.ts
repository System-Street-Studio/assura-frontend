/**
 * Request payload for User Login
 */
export interface LoginRequest {
    username: string;
    password: string;
}

/**
 * Request payload for User Registration
 */
export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
}

/**
 * Response payload after successful login
 */
export interface LoginResponse {
    token: string;
    user: UserDto;
}

/**
 * Basic user information returned after login
 */
export interface UserDto {
    id: string;
    email: string;
    name: string;
    roles: string[];
}
