import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AssetService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

/*
  //-- get assets ---
  getAssets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assets`);
  }*/

  // --- get Requests ---
  getRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests`);
  }

  // --put requests--
  saveAssetRequest(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests`, data);
  }

  }



