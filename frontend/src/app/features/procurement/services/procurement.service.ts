import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreatePurchasingOrderRequest, PurchasingOrderDto, PurchasingOrderSummaryDto, AssetRequestDto } from '../models/purchase-order.model';
import { MaintenanceDto, CreateMaintenanceRequest, AssetSummaryDto, RepairingFirmDto, CreateRepairingFirmRequest } from '../models/maintenance.model';

@Injectable({
    providedIn: 'root'
})
export class ProcurementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/PurchasingOrders`;
    private maintenanceUrl = `${environment.apiUrl}/Maintenances`;
    private assetsUrl = `${environment.apiUrl}/Assets`;
    private repairingFirmsUrl = `${environment.apiUrl}/RepairingFirms`;

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
        const url = `${this.apiUrl}/${id}`;
        console.log(`[DEBUG] ProcurementService: Fetching order details from ${url}`);
        return this.http.get<PurchasingOrderDto>(url).pipe(
            tap(order => console.log(`[DEBUG] ProcurementService: Successfully fetched order ${order.orderNumber}`)),
            catchError(err => {
                console.error(`[DEBUG] ProcurementService: Error fetching order ${id}`, err);
                return throwError(() => err);
            })
        );
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

    /**
     * Get all Maintenance records
     */
    getMaintenances(): Observable<MaintenanceDto[]> {
        console.log(`[DEBUG] ProcurementService: Fetching maintenances from ${this.maintenanceUrl}`);
        return this.http.get<MaintenanceDto[]>(this.maintenanceUrl).pipe(
            tap(records => console.log(`[DEBUG] ProcurementService: Successfully fetched ${records.length} maintenance records`)),
            catchError(err => {
                console.error('[DEBUG] ProcurementService: Error fetching maintenances', err);
                return throwError(() => err);
            })
        );
    }

    /**
     * Create a new Maintenance record
     */
    createMaintenance(data: CreateMaintenanceRequest): Observable<number> {
        console.log(`[DEBUG] ProcurementService: Creating maintenance record`, data);
        return this.http.post<number>(this.maintenanceUrl, data).pipe(
            tap(id => console.log(`[DEBUG] ProcurementService: Successfully created maintenance record with ID ${id}`)),
            catchError(err => {
                console.error('[DEBUG] ProcurementService: Error creating maintenance record', err);
                return throwError(() => err);
            })
        );
    }

    /**
     * Get all Assets (Summary)
     */
    getAssets(): Observable<AssetSummaryDto[]> {
        return this.http.get<AssetSummaryDto[]>(this.assetsUrl);
    }

    /**
     * Get all Repairing Firms
     */
    getRepairingFirms(): Observable<RepairingFirmDto[]> {
        return this.http.get<RepairingFirmDto[]>(this.repairingFirmsUrl);
    }

    /**
     * Create a new Repairing Firm
     */
    createRepairingFirm(data: CreateRepairingFirmRequest): Observable<number> {
        console.log(`[DEBUG] ProcurementService: Creating repairing firm`, data);
        return this.http.post<number>(this.repairingFirmsUrl, data).pipe(
            tap(id => console.log(`[DEBUG] ProcurementService: Successfully created repairing firm with ID ${id}`)),
            catchError(err => {
                console.error('[DEBUG] ProcurementService: Error creating repairing firm', err);
                return throwError(() => err);
            })
        );
    }
}
