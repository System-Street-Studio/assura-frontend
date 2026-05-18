export interface Supplier {
    id: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    status?: string;
    createdAt?: string;
    contactNumber?: string;
    url?: string;
    dateRegistered?: string;
}
export interface CreateSupplierRequest {
    Name: string;
    ContactPerson?: string;
    Email?: string;
    Phone?: string;
    Address?: string;
    Website?: string;
}
