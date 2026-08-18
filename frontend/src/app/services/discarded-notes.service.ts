import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiscardedNote } from '../features/discarded-notes/models/discarded-note.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DiscardedNotesService {
  private apiUrl = `${environment.apiUrl}/DiscardedNotes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DiscardedNote[]> {
    return this.http.get<DiscardedNote[]>(this.apiUrl);
  }

  updateStatus(id: string, status: string, note: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, { id: +id, status, note });
  }
}
