import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Receipt {
  id: string;
  assetName: string;
  division: string;
  date: string;
  amount: string;
  status: string;
  fileUrl?: string;
}

export interface CreateReceipt {
  assetName: string;
  division: string;
  date: string;
  amount: string;
}

@Injectable({ providedIn: 'root' })
export class ReceiptsService {
  private apiUrl = '/api/Receipts';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(this.apiUrl);
  }

  create(receipt: CreateReceipt): Observable<Receipt> {
    return this.http.post<Receipt>(this.apiUrl, receipt);
  }

  uploadFile(id: string, file: File): Observable<Receipt> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Receipt>(`${this.apiUrl}/${id}/upload`, formData);
  }
}

