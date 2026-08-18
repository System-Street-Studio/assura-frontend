import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Buyer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  status: string;
}

export interface CreateBuyerRequest {
  name: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
}

export interface UpdateBuyerRequest {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  status?: string;
}

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BuyersService {
  private apiUrl = `${environment.apiUrl}/Buyers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Buyer[]> {
    return this.http.get<Buyer[]>(this.apiUrl);
  }

  create(buyer: CreateBuyerRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, buyer);
  }

  update(id: string | number, buyer: UpdateBuyerRequest): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/${id}`, buyer);
  }
}
