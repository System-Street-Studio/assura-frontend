import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private suppliers: Supplier[] = [
    {
      id: 'SUP-001',
      companyName: 'Dell Technologies',
      contactPerson: 'James Carter',
      email: 'j.carter@dell.com',
      phone: '+1 (800) 624-9897',
      address: '1 Dell Way',
      city: 'Round Rock, TX',
      country: 'USA',
      category: 'IT Equipment',
      status: 'Active',
      rating: 5,
      totalOrders: 48,
      totalValue: 245000,
      contractExpiry: '2026-03-15',
      paymentTerms: 'Net 30',
      notes: 'Preferred vendor for laptops and desktops',
      createdAt: '2023-01-10',
    },
    {
      id: 'SUP-002',
      companyName: 'Lenovo Group',
      contactPerson: 'Sarah Kim',
      email: 's.kim@lenovo.com',
      phone: '+1 (855) 253-6686',
      address: '8001 Development Dr',
      city: 'Morrisville, NC',
      country: 'USA',
      category: 'IT Equipment',
      status: 'Active',
      rating: 4,
      totalOrders: 32,
      totalValue: 178500,
      contractExpiry: '2025-11-30',
      paymentTerms: 'Net 45',
      createdAt: '2023-03-22',
    },
    {
      id: 'SUP-003',
      companyName: 'Cisco Systems',
      contactPerson: 'Robert Nguyen',
      email: 'r.nguyen@cisco.com',
      phone: '+1 (800) 553-6387',
      address: '170 W Tasman Dr',
      city: 'San Jose, CA',
      country: 'USA',
      category: 'Networking',
      status: 'Active',
      rating: 5,
      totalOrders: 21,
      totalValue: 132000,
      contractExpiry: '2026-06-01',
      paymentTerms: 'Net 30',
      notes: 'Exclusive networking equipment supplier',
      createdAt: '2023-02-14',
    },
    {
      id: 'SUP-004',
      companyName: 'Steelcase Inc.',
      contactPerson: 'Emily Watson',
      email: 'e.watson@steelcase.com',
      phone: '+1 (616) 247-2710',
      address: '901 44th St SE',
      city: 'Grand Rapids, MI',
      country: 'USA',
      category: 'Furniture',
      status: 'Active',
      rating: 4,
      totalOrders: 15,
      totalValue: 67800,
      contractExpiry: '2025-09-20',
      paymentTerms: 'Net 60',
      createdAt: '2023-05-08',
    },
    {
      id: 'SUP-005',
      companyName: 'Staples Business',
      contactPerson: 'Michael Brown',
      email: 'm.brown@staples.com',
      phone: '+1 (800) 333-3330',
      address: '500 Staples Dr',
      city: 'Framingham, MA',
      country: 'USA',
      category: 'Office Supplies',
      status: 'Active',
      rating: 3,
      totalOrders: 64,
      totalValue: 28400,
      contractExpiry: '2025-12-31',
      paymentTerms: 'Net 15',
      createdAt: '2023-01-05',
    },
    {
      id: 'SUP-006',
      companyName: 'TechRepair Co.',
      contactPerson: 'Lisa Zhang',
      email: 'l.zhang@techrepair.com',
      phone: '+1 (415) 555-0198',
      address: '42 Mission St',
      city: 'San Francisco, CA',
      country: 'USA',
      category: 'Maintenance',
      status: 'Inactive',
      rating: 3,
      totalOrders: 8,
      totalValue: 12600,
      contractExpiry: '2024-08-15',
      paymentTerms: 'Net 30',
      notes: 'Contract expired — under review for renewal',
      createdAt: '2023-07-19',
    },
    {
      id: 'SUP-007',
      companyName: 'Microsoft Corp.',
      contactPerson: 'David Park',
      email: 'd.park@microsoft.com',
      phone: '+1 (800) 642-7676',
      address: '1 Microsoft Way',
      city: 'Redmond, WA',
      country: 'USA',
      category: 'Software',
      status: 'Active',
      rating: 5,
      totalOrders: 12,
      totalValue: 96000,
      contractExpiry: '2026-01-01',
      paymentTerms: 'Net 30',
      createdAt: '2023-04-01',
    },
    {
      id: 'SUP-008',
      companyName: 'OfficePro Supplies',
      contactPerson: 'Anna Martinez',
      email: 'a.martinez@officepro.com',
      phone: '+1 (212) 555-0147',
      address: '88 Lexington Ave',
      city: 'New York, NY',
      country: 'USA',
      category: 'Office Supplies',
      status: 'Pending',
      rating: 0,
      totalOrders: 0,
      totalValue: 0,
      contractExpiry: '2026-02-28',
      paymentTerms: 'Net 30',
      notes: 'New vendor — awaiting contract approval',
      createdAt: '2024-11-20',
    },
    {
      id: 'SUP-009',
      companyName: 'QuickFix Electronics',
      contactPerson: 'Tom Harris',
      email: 't.harris@quickfix.com',
      phone: '+1 (305) 555-0234',
      address: '221 Brickell Ave',
      city: 'Miami, FL',
      country: 'USA',
      category: 'Electronics',
      status: 'Blacklisted',
      rating: 1,
      totalOrders: 5,
      totalValue: 8200,
      contractExpiry: '2024-03-01',
      paymentTerms: 'Net 15',
      notes: 'Terminated — repeated quality issues',
      createdAt: '2023-06-11',
    },
    {
      id: 'SUP-010',
      companyName: 'HP Enterprise',
      contactPerson: 'Karen Lee',
      email: 'k.lee@hpe.com',
      phone: '+1 (800) 474-6836',
      address: '6280 America Center Dr',
      city: 'San Jose, CA',
      country: 'USA',
      category: 'IT Equipment',
      status: 'Active',
      rating: 4,
      totalOrders: 27,
      totalValue: 154300,
      contractExpiry: '2026-04-30',
      paymentTerms: 'Net 45',
      createdAt: '2023-02-28',
    },
  ];

  getAll(): Observable<Supplier[]> {
    return of(this.suppliers);
  }

  getById(id: string): Observable<Supplier | undefined> {
    return of(this.suppliers.find((s) => s.id === id));
  }

  create(supplier: Supplier): Observable<Supplier> {
    this.suppliers = [supplier, ...this.suppliers];
    return of(supplier);
  }

  update(supplier: Supplier): Observable<Supplier> {
    const idx = this.suppliers.findIndex((s) => s.id === supplier.id);
    if (idx !== -1) this.suppliers[idx] = supplier;
    return of(supplier);
  }

  delete(id: string): Observable<boolean> {
    this.suppliers = this.suppliers.filter((s) => s.id !== id);
    return of(true);
  }
}
