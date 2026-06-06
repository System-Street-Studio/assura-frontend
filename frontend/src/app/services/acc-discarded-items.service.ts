import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccDiscardedItem {
  id: string;
  name: string;
  division: string;
  date: string;
  assetType: string;
  currentUser: string;
  specialNote: string;
  valueAtPurchasing: string;
  currentValue: string;
  time: string;
}

@Injectable({ providedIn: 'root' })
export class AccDiscardedItemsService {
  private apiUrl = '/api/AccDiscardedItems';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AccDiscardedItem[]> {
    return this.http.get<AccDiscardedItem[]>(this.apiUrl);
  }
}
