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

@Injectable({ providedIn: 'root' })
export class BuyersService {
  private apiUrl = '/api/Buyers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Buyer[]> {
    return this.http.get<Buyer[]>(this.apiUrl);
  }

  create(buyer: CreateBuyerRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, buyer);
  }
}
