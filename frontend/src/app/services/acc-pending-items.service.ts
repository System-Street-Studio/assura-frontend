import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  specialNote: string;
  valueAtPurchasing: string;
  currentValue: string;
  isHighlighted: boolean;
}

@Injectable({ providedIn: 'root' })
export class AccPendingItemsService {
  private apiUrl = '/api/AccPendingItems';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AccPendingItem[]> {
    return this.http.get<AccPendingItem[]>(this.apiUrl);
  }

  confirmDiscard(id: string): Observable<void> {
    // Backend expects int id in route — parse to number to avoid 400 Bad Request
    const numericId = parseInt(id, 10);
    return this.http.post<void>(`${this.apiUrl}/${numericId}/discard`, {});
  }
}
