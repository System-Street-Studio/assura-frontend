export interface UserProfile {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    divisionName?: string;
    divisionId?: number;
}

export interface UpdateProfileRequest {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
}
