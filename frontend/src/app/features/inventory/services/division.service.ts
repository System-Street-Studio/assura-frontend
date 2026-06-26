import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Division } from '../models/division.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DivisionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/divisions`;

    getAll(): Observable<Division[]> {
        return this.http.get<Division[]>(this.apiUrl);
    }

    create(division: Partial<Division>): Observable<Division> {
        return this.http.post<Division>(this.apiUrl, division);
    }

    update(id: number, division: Partial<Division>): Observable<Division> {
        return this.http.put<Division>(`${this.apiUrl}/${id}`, { id, ...division });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
