import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Asset, AssetDetail } from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private assets: Asset[] = [
    {
      id: '1',
      assetCode: 'AST-001',
      assetTag: 'TAG-001',
      assetDate: '2024-01-15',
      status: 'InUse',
      serialNumber: 'GC1SJL3',
      purchaseValue: 1200,
      warranty: '2025-05-12',
      notes: 'Standard issue.',
      categoryId: 1,
      divisionId: 1,
      productId: 1,
      supplierId: 1,
      assignedUserId: 1,
    },
    {
      id: '2',
      assetCode: 'AST-002',
      assetTag: 'TAG-002',
      assetDate: '2024-02-08',
      status: 'InUse',
      serialNumber: 'PW0315CM',
      purchaseValue: 950,
      warranty: '2025-08-15',
      categoryId: 1,
      divisionId: 1,
      productId: 2,
      supplierId: 1,
      assignedUserId: 2,
    },
    {
      id: '3',
      assetCode: 'AST-003',
      assetTag: 'TAG-003',
      assetDate: '2024-03-22',
      status: 'UnderMaintenance',
      serialNumber: 'AN5UL7WMBZZTBIR',
      purchaseValue: 1499,
      warranty: '2025-12-27',
      categoryId: 2,
      divisionId: 2,
      productId: 3,
      supplierId: 2,
      assignedUserId: 3,
    },
  ];

  getAll(): Observable<AssetDetail[]> {
    const details = this.assets.map(a => ({
      ...a,
      productName: a.productId === 1 ? 'Dell XPS 13' : a.productId === 2 ? 'ThinkPad E15 G4' : 'iPhone 15 Pro Max',
      categoryName: a.categoryId === 1 ? 'Laptops' : 'Mobile Devices',
      divisionName: a.divisionId === 1 ? 'HQ - Floor 3' : 'Branch - East Wing',
      supplierName: a.supplierId === 1 ? 'Dell' : 'Apple',
      assignedUserName: a.assignedUserId === 1 ? 'Elliott Nolan' : a.assignedUserId === 2 ? 'Evelyn Lopez' : 'Esta K. Ortiz',
    }));
    return of(details);
  }

  getAssetById(id: string): Observable<AssetDetail> {
    const asset = this.assets.find(a => a.id === id);
    if (!asset) throw new Error('Asset not found');

    const detail: AssetDetail = {
      ...asset,
      productName: asset.productId === 1 ? 'Dell XPS 13' : asset.productId === 2 ? 'ThinkPad E15 G4' : 'iPhone 15 Pro Max',
      categoryName: asset.categoryId === 1 ? 'Laptops' : 'Mobile Devices',
      divisionName: asset.divisionId === 1 ? 'HQ - Floor 3' : 'Branch - East Wing',
      supplierName: asset.supplierId === 1 ? 'Dell' : 'Apple',
      assignedUserName: asset.assignedUserId === 1 ? 'Elliott Nolan' : asset.assignedUserId === 2 ? 'Evelyn Lopez' : 'Esta K. Ortiz',
    };
    return of(detail);
  }

  deleteAsset(id: string): Observable<boolean> {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.assets.splice(idx, 1);
    }
    return of(true);
  }

  updateAsset(detail: AssetDetail): Observable<AssetDetail> {
    const idx = this.assets.findIndex((a) => a.id === detail.id);
    if (idx !== -1) {
      this.assets[idx] = { ...detail };
    }
    return of(detail);
  }

  createAsset(detail: AssetDetail): Observable<AssetDetail> {
    const newId = String(this.assets.length + 1);
    const created: Asset = { ...detail, id: newId };
    this.assets.push(created);
    return of({ ...detail, id: newId });
  }

  checkinAsset(id: string, condition: string, notes: string): Observable<AssetDetail> {
    const asset = this.assets.find(a => a.id === id);
    if (!asset) throw new Error('Asset not found');

    asset.status = condition === 'Damaged' ? 'UnderMaintenance' : 'InStore';
    asset.assignedUserId = undefined;
    if (notes) asset.notes = (asset.notes || '') + ' | Check-in: ' + notes;

    return this.getAssetById(id);
  }
}
