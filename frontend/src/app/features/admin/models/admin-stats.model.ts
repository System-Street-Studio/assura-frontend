export interface StatItem {
    label: string;
    count: number;
}

export interface AdminStats {
    totalAssets: number;
    totalUsers: number;
    assetsByDivision: StatItem[];
    assetsByStatus: StatItem[];
    assetsByCategory: StatItem[];
}