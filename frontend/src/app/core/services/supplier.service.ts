import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Supplier } from '../models/supplier.model';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private apiService = inject(ApiService);

    getSuppliers(): Observable<Supplier[]> {
        return this.apiService.get<Supplier[]>('Suppliers');
    }

    getSupplierById(id: number): Observable<Supplier> {
        return this.apiService.get<Supplier>(`Suppliers/${id}`);
    }
}
