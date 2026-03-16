export interface Asset {
    id: string;
    name: string;
    type: string;
    serialNumber: string;
    division: string;
    status: 'Active' | 'Maintenance' | 'Assigned';
    image?: string;
}
