import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/LostItems`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<LostItem[]> {
    return this.http.get<LostItem[]>(this.apiUrl);
  }
}
