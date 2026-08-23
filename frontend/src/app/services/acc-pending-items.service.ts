import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccPendingItem {
  id: string;
  name: string;
  division: string;
  date: string;
  status: string;
  category: string;
  time: string;
  assetType: string;
  currentUser: string;
  requestedByName: string;
  assigneeName?: string;
  specialNote: string;
  valueAtPurchasing: string;
  currentValue: string;
  isHighlighted: boolean;
  buyerId?: number | null;
  buyerName?: string | null;
  soldPrice?: number | null;
}

@Injectable({ providedIn: 'root' })
export class AccPendingItemsService {
  private apiUrl = `${environment.apiUrl}/AccPendingItems`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AccPendingItem[]> {
    return this.http.get<AccPendingItem[]>(this.apiUrl);
  }

  confirmDiscard(id: string, receiptId?: number | string): Observable<void> {
    // Backend expects int id in route — parse to number to avoid 400 Bad Request
    const numericId = parseInt(id, 10);
    const numericReceiptId = receiptId ? parseInt(receiptId.toString(), 10) : 0;
    return this.http.post<void>(`${this.apiUrl}/${numericId}/discard`, { receiptId: numericReceiptId });
  }
}
