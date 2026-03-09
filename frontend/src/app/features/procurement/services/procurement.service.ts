import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreatePurchasingOrderRequest, PurchasingOrderDto, PurchasingOrderSummaryDto, AssetRequestDto } from '../models/purchase-order.model';

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
        console.log(`[DEBUG] ProcurementService: Fetching orders from ${this.apiUrl}`);
        return this.http.get<PurchasingOrderSummaryDto[]>(this.apiUrl).pipe(
            tap(orders => console.log(`[DEBUG] ProcurementService: Successfully fetched ${orders.length} orders`)),
            catchError(err => {
                console.error('[DEBUG] ProcurementService: Error fetching orders', err);
                return throwError(() => err);
            })
        );
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

    /**
     * Get pending asset requests that need a PO
     */
    getPendingRequests(): Observable<AssetRequestDto[]> {
        const url = `${this.apiUrl}/pending-requests`;
        console.log(`[DEBUG] ProcurementService: Fetching pending requests from ${url}`);
        return this.http.get<AssetRequestDto[]>(url).pipe(
            tap(requests => console.log(`[DEBUG] ProcurementService: Successfully fetched ${requests.length} pending requests`)),
            catchError(err => {
                console.error('[DEBUG] ProcurementService: Error fetching pending requests', err);
                return throwError(() => err);
            })
        );
    }
}
