export interface UserProfile {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    divisionName?: string;
    divisionId?: number;
    phoneNumber?: string;
}

export interface UpdateProfileRequest {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password?: string;
}
