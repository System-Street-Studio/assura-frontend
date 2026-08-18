import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from '../features/my-assets/models/asset.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private apiUrl = `${environment.apiUrl}/Assets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }

  create(asset: Partial<Asset>): Observable<any> {
    return this.http.post(this.apiUrl, asset);
  }

  update(id: string, asset: Partial<Asset>): Observable<any> {
    const numericId = parseInt(id, 10);
    return this.http.put(`${this.apiUrl}/${numericId}`, {
      id: numericId,
      name: asset.name,
      type: asset.type,
      serialNumber: asset.serialNumber,
      division: asset.division,
      status: asset.status
    });
  }
}
