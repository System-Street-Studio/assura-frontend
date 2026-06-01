import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LostItem {
  id: string;
  assetName: string;
  division: string;
  date: string;
  reportedBy: string;
  status: string;
  assetType: string;
  time: string;
  valueAtPurchasing: string;
  currentValue: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class LostItemsService {
  private apiUrl = '/api/LostItems';

  constructor(private http: HttpClient) {}

  getAll(): Observable<LostItem[]> {
    return this.http.get<LostItem[]>(this.apiUrl);
  }
}
