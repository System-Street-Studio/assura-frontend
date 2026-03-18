import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [
    {
      id: 'PRD-001',
      name: 'Dell XPS 13',
      category: 'Laptops',
      manufacturer: 'Dell',
      modelNumber: 'XPS 13 9315',
      totalAssets: 12,
      availableAssets: 3,
      minQuantity: 5,
      unitCost: 1200,
      depreciation: 'Straight Line',
      eolMonths: 48,
      notes: 'Standard issue for developers and designers.',
      createdAt: '2024-01-15',
    },
    {
      id: 'PRD-002',
      name: 'ThinkPad E15 G4',
      category: 'Laptops',
      manufacturer: 'Lenovo',
      modelNumber: 'E15 Gen4 21ED',
      totalAssets: 18,
      availableAssets: 6,
      minQuantity: 5,
      unitCost: 950,
      depreciation: 'Straight Line',
      eolMonths: 48,
      notes: 'General office use. Durable and cost-effective.',
      createdAt: '2024-02-08',
    },
    {
      id: 'PRD-003',
      name: 'iPhone 15 Pro Max',
      category: 'Mobile Devices',
      manufacturer: 'Apple',
      modelNumber: 'A2849',
      totalAssets: 8,
      availableAssets: 1,
      minQuantity: 3,
      unitCost: 1499,
      depreciation: 'Declining Balance',
      eolMonths: 36,
      notes: 'Issued to senior management and field staff.',
      createdAt: '2024-03-22',
    },
    {
      id: 'PRD-004',
      name: 'Yoga 7 14IAL7',
      category: 'Tablets',
      manufacturer: 'Lenovo',
      modelNumber: '82QE',
      totalAssets: 5,
      availableAssets: 2,
      minQuantity: 2,
      unitCost: 680,
      depreciation: 'Straight Line',
      eolMonths: 36,
      notes: 'Used for training and presentations.',
      createdAt: '2024-04-10',
    },
    {
      id: 'PRD-005',
      name: 'Dell UltraSharp U2723QE',
      category: 'Monitors',
      manufacturer: 'Dell',
      modelNumber: 'U2723QE',
      totalAssets: 20,
      availableAssets: 8,
      minQuantity: 5,
      unitCost: 520,
      depreciation: 'Straight Line',
      eolMonths: 60,
      notes: '4K USB-C hub monitor for workstations.',
      createdAt: '2024-05-18',
    },
    {
      id: 'PRD-006',
      name: 'MacBook Pro 14"',
      category: 'Laptops',
      manufacturer: 'Apple',
      modelNumber: 'MKGR3LL/A',
      totalAssets: 6,
      availableAssets: 0,
      minQuantity: 3,
      unitCost: 1999,
      depreciation: 'Declining Balance',
      eolMonths: 48,
      notes: 'Design and creative team exclusive.',
      createdAt: '2024-06-01',
    },
    {
      id: 'PRD-007',
      name: 'HP LaserJet Pro M404dn',
      category: 'Printers',
      manufacturer: 'HP',
      modelNumber: 'W1A53A',
      totalAssets: 4,
      availableAssets: 1,
      minQuantity: 2,
      unitCost: 350,
      depreciation: 'Straight Line',
      eolMonths: 60,
      notes: 'Floor-level shared printers.',
      createdAt: '2024-07-12',
    },
    {
      id: 'PRD-008',
      name: 'Cisco Catalyst 9200L',
      category: 'Networking',
      manufacturer: 'Cisco',
      modelNumber: 'C9200L-24P-4G',
      totalAssets: 3,
      availableAssets: 0,
      minQuantity: 1,
      unitCost: 2800,
      depreciation: 'Straight Line',
      eolMonths: 72,
      notes: 'Network switches for each building floor.',
      createdAt: '2024-08-05',
    },
    {
      id: 'PRD-009',
      name: 'Logitech MX Keys Combo',
      category: 'Accessories',
      manufacturer: 'Logitech',
      modelNumber: 'MX Keys + MX Master 3S',
      totalAssets: 30,
      availableAssets: 12,
      minQuantity: 10,
      unitCost: 180,
      depreciation: 'None',
      eolMonths: 24,
      notes: 'Keyboard and mouse combo for workstations.',
      createdAt: '2024-09-20',
    },
    {
      id: 'PRD-010',
      name: 'Surface Pro 9',
      category: 'Tablets',
      manufacturer: 'Microsoft',
      modelNumber: 'QEZ-00001',
      totalAssets: 7,
      availableAssets: 3,
      minQuantity: 3,
      unitCost: 1100,
      depreciation: 'Straight Line',
      eolMonths: 36,
      notes: 'Hybrid devices for mobile workforce.',
      createdAt: '2024-10-14',
    },
  ];

  getAll(): Observable<Product[]> {
    return of(this.products.map((p) => ({ ...p })));
  }

  getById(id: string): Observable<Product | undefined> {
    return of(this.products.find((p) => p.id === id));
  }

  create(product: Product): Observable<Product> {
    const newId = 'PRD-' + String(this.products.length + 1).padStart(3, '0');
    const created = { ...product, id: newId };
    this.products.push(created);
    return of(created);
  }

  update(product: Product): Observable<Product> {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      this.products[idx] = { ...product };
    }
    return of(product);
  }

  delete(id: string): Observable<boolean> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx !== -1) this.products.splice(idx, 1);
    return of(true);
  }
}
