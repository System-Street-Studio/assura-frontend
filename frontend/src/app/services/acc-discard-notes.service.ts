import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccDiscardNote {
  id: string;
  assetName: string;
  division: string;
  date: string;
  note: string;
  status: string;
  assetType: string;
  currentUser: string;
  time: string;
  valueAtPurchasing: string;
  currentValue: string;
}

@Injectable({ providedIn: 'root' })
export class AccDiscardNotesService {
  private apiUrl = `${environment.apiUrl}/AccDiscardNotes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AccDiscardNote[]> {
    return this.http.get<AccDiscardNote[]>(this.apiUrl);
  }
}
