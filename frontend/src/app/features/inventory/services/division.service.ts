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
}
