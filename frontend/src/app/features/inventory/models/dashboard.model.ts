export interface Kpi {
  totalAssets: number;
  ghostAssets: number;
  missingAssets: number;
  totalAssetValue: string;
}

export interface ChartDatasets {
  assetsByCategory: { labels: string[]; data: number[]; colors: string[] };
  assetsByStatus: { labels: string[]; data: number[]; colors: string[] };
  assetsByDepartment: { labels: string[]; data: number[]; colors: string[] };
  assetValueByCategory: { labels: string[]; data: number[]; colors: string[] };
  anomalies: { ghostAssets: number; missingAssets: number };
}
