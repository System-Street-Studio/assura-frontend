import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Asset, AssetDetail } from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private assets: Asset[] = [
    {
      id: '100000',
      product: 'XPS 13"',
      image: '',
      status: 'Deployed',
      category: 'Laptops',
      location: 'HQ - Floor 3',
      purchaseCost: 1200,
      checkedOutTo: 'Elliott Nolan',
      checkedOutAgo: '(2 days ago)',
      album: 'Laptop-XPS-13-EN',
      serial: 'GC1SJL3',
      warranty: 'Expired 7 months ago (May 12, 2025)',
      endOfLife: '3 months left (March 20, 2026)',
      orderNumber: 'S6C2IQ2',
    },
    {
      id: '100001',
      product: 'ThinkPad E15 G4',
      image: '',
      status: 'Deployed',
      category: 'Laptops',
      location: 'HQ - Floor 2',
      purchaseCost: 950,
      checkedOutTo: 'Evelyn Lopez',
      checkedOutAgo: '(1 month ago)',
      album: 'Laptop-ThinkPad-E15-EL',
      serial: 'PW0315CM',
      warranty: 'Expired 4 months ago (August 15, 2025)',
      endOfLife: 'About 2 years left (December 20, 2027)',
      orderNumber: '9QAHQ8',
    },
    {
      id: '100002',
      product: 'iPhone 15 Pro Max',
      image: '',
      status: 'In Repair',
      category: 'Mobile Devices',
      location: 'Repair Center',
      purchaseCost: 1499,
      checkedOutTo: 'Esta K. Ortiz',
      checkedOutAgo: '(7 days ago)',
      album: 'iPhone-15',
      serial: 'AN5UL7WMBZZTBIR',
      warranty: '7 days left (December 27, 2025)',
      endOfLife: 'Over 1 year left (May 24, 2027)',
      orderNumber: '1PMILDZ',
    },
    {
      id: '100003',
      product: 'XPS 13"',
      image: '',
      status: 'Deployed',
      category: 'Laptops',
      location: 'Branch - East Wing',
      purchaseCost: 1200,
      checkedOutTo: 'Richard K. Cornejo',
      checkedOutAgo: '(2 weeks ago)',
      album: 'Laptop-XPS-13-RC',
      serial: 'F1Z966XPZG6ETZY',
      warranty: 'Expired 7 months ago (February 20, 2026)',
      endOfLife: '2 months left (February 20, 2026)',
      orderNumber: 'F1Z966XPZG6ETZY',
    },
    {
      id: '100005',
      product: 'iPhone 15 Pro Max',
      image: '',
      status: 'Available',
      category: 'Mobile Devices',
      location: 'Store Room A',
      purchaseCost: 1499,
      checkedOutTo: '',
      checkedOutAgo: '',
      album: 'iPhone-15',
      serial: 'WTTFP9RDE9FBOSJ',
      warranty: '3 years left (May 30, 2029)',
      endOfLife: 'Over 1 year left (May 30, 2029)',
      orderNumber: 'Z5XHWP',
    },
    {
      id: '100007',
      product: 'Yoga 7',
      image: '',
      status: 'Retired',
      category: 'Tablets',
      location: 'Warehouse B',
      purchaseCost: 680,
      checkedOutTo: '',
      checkedOutAgo: '',
      album: 'Tablet-Yoga7-RE',
      serial: 'BRIM1518UEEQBAP',
      warranty: 'Expired 4 months ago (August 15, 2025)',
      endOfLife: 'Over 2 years left (August 8, 2028)',
      orderNumber: 'XDPLT',
    },
  ];

  private sampleDetail: AssetDetail = {
    id: '100000',
    name: 'XPS 13"',
    assetId: '100000',
    productName: 'XPS 13 Laptop',
    serial: 'GC15JL3',
    warranty: 'Expired 7 months ago (May 12, 2025)',
    endOfLife: '3 months left (March 20, 2026)',
    orderNumber: 'S6C2IQ2',
    album: 'Laptop-XPS-13-EN',
    value: '$1,200.00',
    category: 'Laptops',
    department: 'IT',
    purchaseDate: 'May 12, 2023',
    supplier: 'Dell',
    notes: 'Standard issue for new employees. Regularly maintained.',
    checkedOutTo: 'Elliott Nolan',
    dueBack: 'December 24, 2025',
    status: 'Deployed',
    owner: {
      name: 'Jane Doe',
      department: 'Marketing Department',
      avatar: '',
      location: 'Building A, 3rd Floor, Room 305',
    },
  };

  private detailStore = new Map<string, AssetDetail>();

  getAll(): Observable<Asset[]> {
    return of(this.assets.map((a) => ({ ...a })));
  }

  getAssetById(id: string): Observable<AssetDetail> {
    const stored = this.detailStore.get(id);
    if (stored) {
      return of({ ...stored });
    }
    const listItem = this.assets.find((a) => a.id === id);
    const detail: AssetDetail = {
      ...this.sampleDetail,
      id,
      assetId: id,
      name: listItem?.product || this.sampleDetail.name,
      productName: listItem?.product || this.sampleDetail.productName,
      serial: listItem?.serial || this.sampleDetail.serial,
      warranty: listItem?.warranty || this.sampleDetail.warranty,
      endOfLife: listItem?.endOfLife || this.sampleDetail.endOfLife,
      orderNumber: listItem?.orderNumber || this.sampleDetail.orderNumber,
      album: listItem?.album || this.sampleDetail.album,
      status: listItem?.status || this.sampleDetail.status,
      checkedOutTo: listItem?.checkedOutTo || this.sampleDetail.checkedOutTo,
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
      this.assets[idx] = {
        ...this.assets[idx],
        product: detail.productName,
        serial: detail.serial,
        warranty: detail.warranty,
        endOfLife: detail.endOfLife,
        orderNumber: detail.orderNumber,
        album: detail.album,
        status: detail.status,
        checkedOutTo: detail.checkedOutTo,
      };
    }
    this.detailStore.set(detail.id, { ...detail });
    return of(detail);
  }

  createAsset(detail: AssetDetail): Observable<AssetDetail> {
    const newId = String(Math.max(...this.assets.map((a) => +a.id)) + 1);
    const created: AssetDetail = {
      ...detail,
      id: newId,
      assetId: newId,
      owner: {
        name: detail.checkedOutTo || '',
        department: detail.department || '',
        location: detail.location || '',
      },
    };
    this.assets.push({
      id: newId,
      product: detail.productName,
      image: '',
      status: detail.status,
      checkedOutTo: detail.checkedOutTo,
      checkedOutAgo: '',
      album: detail.album,
      serial: detail.serial,
      warranty: detail.warranty,
      endOfLife: detail.endOfLife,
      orderNumber: detail.orderNumber,
    });
    this.detailStore.set(newId, { ...created });
    return of(created);
  }

  getNextAssetId(): string {
    return String(Math.max(...this.assets.map((a) => +a.id)) + 1);
  }

  checkinAsset(
    id: string,
    condition: 'Good' | 'Fair' | 'Damaged',
    checkinNotes: string
  ): Observable<AssetDetail> {
    const newStatus = condition === 'Damaged' ? 'In Repair' : 'Available';

    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.assets[idx] = {
        ...this.assets[idx],
        status: newStatus,
        checkedOutTo: '',
        checkedOutAgo: '',
      };
    }

    const stored = this.detailStore.get(id);
    const detail: AssetDetail = stored || ({} as AssetDetail);
    const updated: AssetDetail = {
      ...detail,
      id,
      status: newStatus,
      checkedOutTo: '',
      dueBack: '',
      notes: checkinNotes || detail.notes,
    };
    this.detailStore.set(id, updated);
    return of(updated);
  }
}
