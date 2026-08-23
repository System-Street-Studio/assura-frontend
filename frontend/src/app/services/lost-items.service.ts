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

export interface CreateLostItemPayload {
  assetName: string;
  division: string;
  assetType: string;
  description: string;
  assetId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class LostItemsService {
  private apiUrl = `${environment.apiUrl}/LostItems`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<LostItem[]> {
    return this.http.get<LostItem[]>(this.apiUrl);
  }

  create(payload: CreateLostItemPayload): Observable<number> {
    return this.http.post<number>(this.apiUrl, payload);
  }

  updateStatus(id: string, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, { id: +id, status });
  }
}
