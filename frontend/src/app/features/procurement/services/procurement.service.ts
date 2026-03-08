import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreatePurchasingOrderRequest, PurchasingOrderDto, PurchasingOrderSummaryDto } from '../models/purchase-order.model';

@Injectable({
    providedIn: 'root'
})
export class ProcurementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/PurchasingOrders`;

    /**
     * Get all Purchasing Orders (Summary)
     */
    getOrders(): Observable<PurchasingOrderSummaryDto[]> {
        return this.http.get<PurchasingOrderSummaryDto[]>(this.apiUrl);
    }

    /**
     * Get a single Purchasing Order by ID
     */
    getOrderById(id: number): Observable<PurchasingOrderDto> {
        return this.http.get<PurchasingOrderDto>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create a new Purchasing Order (POST Request)
     * This is how you pass data from Frontend to Backend
     */
    createOrder(orderData: CreatePurchasingOrderRequest): Observable<number> {
        // The data is automatically converted to JSON and sent in the Request Body
        return this.http.post<number>(this.apiUrl, orderData);
    }

    /**
     * Update an existing Purchasing Order (PUT Request)
     */
    updateOrder(id: number, orderData: Partial<CreatePurchasingOrderRequest>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, orderData);
    }
}
