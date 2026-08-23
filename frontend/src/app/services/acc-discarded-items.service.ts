import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccDiscardedItem {
  id: string;
  name: string;
  division: string;
  date: string;
  assetType: string;
  currentUser: string;
  requestedByName: string;
  specialNote: string;
  valueAtPurchasing: string;
  currentValue: string;
  time: string;
  buyerId?: number | null;
  buyerName?: string | null;
  soldPrice?: number | null;
}

@Injectable({ providedIn: 'root' })
export class AccDiscardedItemsService {
  private apiUrl = `${environment.apiUrl}/AccDiscardedItems`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AccDiscardedItem[]> {
    return this.http.get<AccDiscardedItem[]>(this.apiUrl);
  }
}
