import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from '../features/my-assets/models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private apiUrl = '/api/Assets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }

  create(asset: Partial<Asset>): Observable<any> {
    return this.http.post(this.apiUrl, asset);
  }
}
