import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Receipt {
  id: string;
  assetName: string;
  division: string;
  date: string;
  amount: number;
  status: string;
  fileUrl?: string;
}

export interface CreateReceipt {
  assetName: string;
  division: string;
  date: string;
  amount: number;
}

// The backend returns file URLs as paths relative to its own origin (e.g. "/uploads/receipts/x.pdf"),
// not the frontend's. Resolve them against the API's origin so <a>/window.open/fetch work outside
// of the dev proxy (which only rewrites /api and /uploads, and isn't present in a production build).
const API_ORIGIN = environment.apiUrl.replace(/\/api\/?$/, '');

function resolveFileUrl(fileUrl?: string): string | undefined {
  if (!fileUrl || /^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }
  return `${API_ORIGIN}${fileUrl}`;
}

function withResolvedFileUrl(receipt: Receipt): Receipt {
  return { ...receipt, fileUrl: resolveFileUrl(receipt.fileUrl) };
}

@Injectable({ providedIn: 'root' })
export class ReceiptsService {
  private apiUrl = `${environment.apiUrl}/Receipts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(this.apiUrl).pipe(
      map(receipts => receipts.map(withResolvedFileUrl))
    );
  }

  create(receipt: CreateReceipt): Observable<Receipt> {
    return this.http.post<Receipt>(this.apiUrl, receipt).pipe(map(withResolvedFileUrl));
  }

  uploadFile(id: string, file: File): Observable<Receipt> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Receipt>(`${this.apiUrl}/${id}/upload`, formData).pipe(map(withResolvedFileUrl));
  }
}
