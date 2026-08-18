import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface QueueItem {
  id: string;
  name: string;
  division: string;
  date: string;
  status: string;
  time: string;
  assetType: string;
  specialNote: string;
  reviewNote?: string;
}

@Injectable({ providedIn: 'root' })
export class QueueItemsService {
  private apiUrl = `${environment.apiUrl}/QueueItems`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<QueueItem[]> {
    return this.http.get<QueueItem[]>(this.apiUrl);
  }

  updateStatus(id: string, status: string, reviewNote?: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, { id: +id, status, reviewNote });
  }
}
