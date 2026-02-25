import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  CheckoutRecord,
  CheckoutStatus,
  CheckoutFormData,
  CheckinFormData,
} from '../models/checkout.model';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private records: CheckoutRecord[] = [
    {
      id: 'CHK-001',
      assetId: '100000',
      assetName: 'XPS 13"',
      category: 'Laptops',
      serial: 'GC1SJL3',
      checkedOutTo: 'Elliott Nolan',
      department: 'Marketing',
      email: 'e.nolan@company.com',
      checkoutDate: '2026-02-20',
      dueDate: '2026-03-20',
      status: 'Checked Out',
      checkoutNotes: 'For upcoming campaign project.',
      checkedOutBy: 'Storekeeper',
    },
    {
      id: 'CHK-002',
      assetId: '100001',
      assetName: 'ThinkPad E15 G4',
      category: 'Laptops',
      serial: 'PW0315CM',
      checkedOutTo: 'Evelyn Lopez',
      department: 'HR',
      email: 'e.lopez@company.com',
      checkoutDate: '2026-01-25',
      dueDate: '2026-02-25',
      status: 'Overdue',
      checkoutNotes: 'Temporary replacement during repair.',
      checkedOutBy: 'Storekeeper',
    },
    {
      id: 'CHK-003',
      assetId: '100002',
      assetName: 'iPhone 15 Pro Max',
      category: 'Mobile Devices',
      serial: 'AN5UL7WMBZZTBIR',
      checkedOutTo: 'Esta K. Ortiz',
      department: 'Sales',
      email: 'e.ortiz@company.com',
      checkoutDate: '2026-02-18',
      dueDate: '2026-04-18',
      status: 'Checked Out',
      checkoutNotes: 'Field work device.',
      checkedOutBy: 'Admin',
    },
    {
      id: 'CHK-004',
      assetId: '100003',
      assetName: 'XPS 13"',
      category: 'Laptops',
      serial: 'F1Z966XPZG6ETZY',
      checkedOutTo: 'Richard K. Cornejo',
      department: 'IT',
      email: 'r.cornejo@company.com',
      checkoutDate: '2026-02-10',
      dueDate: '2026-03-10',
      status: 'Checked Out',
      checkedOutBy: 'Storekeeper',
    },
    {
      id: 'CHK-005',
      assetId: '100005',
      assetName: 'iPhone 15 Pro Max',
      category: 'Mobile Devices',
      serial: 'WTTFP9RDE9FBOSJ',
      checkedOutTo: 'Sarah Kim',
      department: 'Engineering',
      email: 's.kim@company.com',
      checkoutDate: '2026-01-15',
      dueDate: '2026-02-15',
      returnDate: '2026-02-14',
      condition: 'Good',
      status: 'Returned',
      checkoutNotes: 'Testing purpose.',
      checkinNotes: 'Device returned in perfect condition.',
      checkedOutBy: 'Admin',
      checkedInBy: 'Storekeeper',
    },
    {
      id: 'CHK-006',
      assetId: '100007',
      assetName: 'Yoga 7',
      category: 'Tablets',
      serial: 'BRIM1518UEEQBAP',
      checkedOutTo: 'Michael Torres',
      department: 'Design',
      email: 'm.torres@company.com',
      checkoutDate: '2025-12-01',
      dueDate: '2026-01-01',
      returnDate: '2026-01-05',
      condition: 'Damaged',
      status: 'Returned',
      checkoutNotes: 'Presentation at annual summit.',
      checkinNotes: 'Battery drains fast. Sent to repair.',
      checkedOutBy: 'Storekeeper',
      checkedInBy: 'Storekeeper',
    },
    {
      id: 'CHK-007',
      assetId: '100000',
      assetName: 'XPS 13"',
      category: 'Laptops',
      serial: 'GC1SJL3',
      checkedOutTo: 'James Carter',
      department: 'Sales',
      email: 'j.carter@company.com',
      checkoutDate: '2025-11-10',
      dueDate: '2025-12-10',
      returnDate: '2025-12-08',
      condition: 'Fair',
      status: 'Returned',
      checkinNotes: 'Minor cosmetic scratches on lid.',
      checkedOutBy: 'Admin',
      checkedInBy: 'Storekeeper',
    },
    {
      id: 'CHK-008',
      assetId: '100001',
      assetName: 'ThinkPad E15 G4',
      category: 'Laptops',
      serial: 'PW0315CM',
      checkedOutTo: 'Anna Martinez',
      department: 'Operations',
      email: 'a.martinez@company.com',
      checkoutDate: '2026-02-22',
      dueDate: '2026-03-22',
      status: 'Checked Out',
      checkoutNotes: 'Quarterly reporting period.',
      checkedOutBy: 'Storekeeper',
    },
    {
      id: 'CHK-009',
      assetId: '100002',
      assetName: 'iPhone 15 Pro Max',
      category: 'Mobile Devices',
      serial: 'AN5UL7WMBZZTBIR',
      checkedOutTo: 'David Park',
      department: 'IT',
      email: 'd.park@company.com',
      checkoutDate: '2025-10-05',
      dueDate: '2025-11-05',
      returnDate: '2025-11-04',
      condition: 'Good',
      status: 'Returned',
      checkinNotes: 'All good. Factory reset completed.',
      checkedOutBy: 'Storekeeper',
      checkedInBy: 'Admin',
    },
    {
      id: 'CHK-010',
      assetId: '100003',
      assetName: 'XPS 13"',
      category: 'Laptops',
      serial: 'F1Z966XPZG6ETZY',
      checkedOutTo: 'Karen Lee',
      department: 'Design',
      email: 'k.lee@company.com',
      checkoutDate: '2026-02-01',
      dueDate: '2026-02-20',
      status: 'Overdue',
      checkoutNotes: 'Short-term loan for design sprint.',
      checkedOutBy: 'Admin',
    },
  ];

  getAll(): Observable<CheckoutRecord[]> {
    return of(this.records.map((r) => ({ ...r })));
  }

  getById(id: string): Observable<CheckoutRecord | undefined> {
    const rec = this.records.find((r) => r.id === id);
    return of(rec ? { ...rec } : undefined);
  }

  getActiveCheckouts(): Observable<CheckoutRecord[]> {
    return of(
      this.records
        .filter((r) => r.status !== 'Returned')
        .map((r) => ({ ...r }))
    );
  }

  getHistory(): Observable<CheckoutRecord[]> {
    return of(
      this.records
        .filter((r) => r.status === 'Returned')
        .map((r) => ({ ...r }))
    );
  }

  checkout(data: CheckoutFormData): Observable<CheckoutRecord> {
    const newId = 'CHK-' + String(this.records.length + 1).padStart(3, '0');
    const asset = this.records.find((r) => r.assetId === data.assetId);
    const record: CheckoutRecord = {
      id: newId,
      assetId: data.assetId,
      assetName: asset?.assetName || 'Unknown Asset',
      category: asset?.category || '',
      serial: asset?.serial || '',
      checkedOutTo: data.checkedOutTo,
      department: data.department,
      email: data.email,
      checkoutDate: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      status: 'Checked Out',
      checkoutNotes: data.notes,
      checkedOutBy: 'Storekeeper',
    };
    this.records.unshift(record);
    return of({ ...record });
  }

  checkin(id: string, data: CheckinFormData): Observable<CheckoutRecord> {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.records[idx] = {
        ...this.records[idx],
        status: 'Returned',
        returnDate: new Date().toISOString().split('T')[0],
        condition: data.condition,
        checkinNotes: data.notes,
        checkedInBy: 'Storekeeper',
      };
      return of({ ...this.records[idx] });
    }
    return of({} as CheckoutRecord);
  }

  getAvailableAssets(): Observable<{ id: string; name: string; serial: string; category: string }[]> {
    return of([
      { id: '100005', name: 'iPhone 15 Pro Max', serial: 'WTTFP9RDE9FBOSJ', category: 'Mobile Devices' },
      { id: '100007', name: 'Yoga 7', serial: 'BRIM1518UEEQBAP', category: 'Tablets' },
    ]);
  }

  getEmployees(): Observable<{ name: string; department: string; email: string }[]> {
    return of([
      { name: 'Elliott Nolan', department: 'Marketing', email: 'e.nolan@company.com' },
      { name: 'Evelyn Lopez', department: 'HR', email: 'e.lopez@company.com' },
      { name: 'Esta K. Ortiz', department: 'Sales', email: 'e.ortiz@company.com' },
      { name: 'Richard K. Cornejo', department: 'IT', email: 'r.cornejo@company.com' },
      { name: 'Sarah Kim', department: 'Engineering', email: 's.kim@company.com' },
      { name: 'Michael Torres', department: 'Design', email: 'm.torres@company.com' },
      { name: 'James Carter', department: 'Sales', email: 'j.carter@company.com' },
      { name: 'Anna Martinez', department: 'Operations', email: 'a.martinez@company.com' },
      { name: 'David Park', department: 'IT', email: 'd.park@company.com' },
      { name: 'Karen Lee', department: 'Design', email: 'k.lee@company.com' },
      { name: 'Tom Harris', department: 'Engineering', email: 't.harris@company.com' },
      { name: 'Lisa Zhang', department: 'HR', email: 'l.zhang@company.com' },
    ]);
  }
}
