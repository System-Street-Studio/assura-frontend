export interface UserWorkspace {
    divisionId?: number;
    divisionName?: string;
    role: string;
    jobTitle?: string;
}

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
    workspaces?: UserWorkspace[];
}

export interface UpdateProfileRequest {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    currentPassword?: string;
    password?: string;
}
