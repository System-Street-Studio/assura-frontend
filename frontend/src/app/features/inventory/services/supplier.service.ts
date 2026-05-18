import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupplierService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/suppliers`;

    getAll(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(this.apiUrl);
    }
}
