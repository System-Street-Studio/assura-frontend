import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Supplier, CreateSupplierRequest } from '../models/supplier.model';

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

    createSupplier(supplier: CreateSupplierRequest): Observable<number> {
        return this.apiService.post<number>('Suppliers', supplier);
    }
}
