export interface AssetDepreciation {
  id: number;
  assetCode: string;
  assetTag?: string;
  serialNumber?: string;
  productName?: string;
  categoryId?: number;
  categoryName?: string;
  divisionId?: number;
  divisionName?: string;
  assetDate: string;
  purchaseValue: number;
  depreciationRate: number;
  ageInYears: number;
  completedYears: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  currentValue: number;
  isFullyDepreciated: boolean;
  status: string;
  usefulLifeYears: number;
}

export interface CategoryDepreciationSummary {
  categoryId: number;
  categoryName: string;
  depreciationRate: number;
  totalAssets: number;
  totalPurchaseValue: number;
  totalAccumulatedDepreciation: number;
  totalCurrentValue: number;
  fullyDepreciatedCount: number;
}

export interface DepreciationSummary {
  totalAssets: number;
  totalPurchaseValue: number;
  totalAccumulatedDepreciation: number;
  totalCurrentValue: number;
  fullyDepreciatedAssets: number;
  activeDepreciatingAssets: number;
  overallDepreciationPercentage: number;
  assets: AssetDepreciation[];
  categoryBreakdown: CategoryDepreciationSummary[];
}

export interface AssetDepreciationScheduleRow {
  yearNumber: number;
  calendarYear: number;
  beginningValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingValue: number;
  isCurrentYear: boolean;
}

export interface AssetDepreciationSchedule {
  assetId: number;
  assetCode: string;
  productName?: string;
  categoryName?: string;
  depreciationRate: number;
  purchaseValue: number;
  assetDate: string;
  currentValue: number;
  accumulatedDepreciation: number;
  usefulLifeYears: number;
  schedule: AssetDepreciationScheduleRow[];
}
