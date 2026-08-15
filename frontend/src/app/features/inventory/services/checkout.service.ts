import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, catchError, of } from 'rxjs';
import {
    CheckoutRecord,
    CheckoutFormData,
    CheckinFormData,
    CheckoutEmployee,
} from '../models/checkout.model';
import { AssetService } from './asset.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
    private http = inject(HttpClient);
    private assetService = inject(AssetService);
    private assetsApiUrl = `${environment.apiUrl}/assets`;
    private userApiUrl = `${environment.apiUrl}/users`;

    getAll(): Observable<CheckoutRecord[]> {
        return this.http.get<CheckoutRecord[] | null>(`${this.assetsApiUrl}/checkout-records`).pipe(
            map((records) => Array.isArray(records) ? records : [])
        );
    }

    getById(id: string): Observable<CheckoutRecord | undefined> {
        return this.getAll().pipe(
            map((records) => records.find((r) => r.id === id))
        );
    }

    getActiveCheckouts(): Observable<CheckoutRecord[]> {
        return this.getAll().pipe(map((records) => records.filter((r) => r.status !== 'Returned')));
    }

    getHistory(): Observable<CheckoutRecord[]> {
        return this.getAll().pipe(map((records) => records.filter((r) => r.status === 'Returned')));
    }

    checkout(data: CheckoutFormData): Observable<CheckoutRecord> {
        return this.http.post<CheckoutRecord>(
            `${this.assetsApiUrl}/${data.assetId}/checkout`,
            {
                assigneeUserId: Number(data.checkedOutToUserId),
                dueDate: data.dueDate,
                notes: data.notes,
            }
        );
    }

    checkin(id: string, data: CheckinFormData): Observable<CheckoutRecord> {
        return this.assetService.checkinAsset(
            id,
            data.condition,
            data.notes,
            data.damageSeverity,
            data.repairNeeded,
            data.acknowledged,
            data.evidenceFileName
        ).pipe(
            switchMap((asset) =>
                this.getAll().pipe(
                    map((records) => {
                        const matched = records.find((r) => r.assetId === String(asset.id) && r.status === 'Returned');
                        if (matched) {
                            return matched;
                        }

                        return {
                            id: String(asset.id),
                            assetId: String(asset.id),
                            assetName: asset.productName || asset.assetCode,
                            category: asset.categoryName || '-',
                            serial: asset.serialNumber || '-',
                            checkedOutTo: 'User',
                            division: asset.divisionName || 'N/A',
                            email: '',
                            checkoutDate: new Date().toISOString().split('T')[0],
                            dueDate: new Date().toISOString().split('T')[0],
                            returnDate: new Date().toISOString().split('T')[0],
                            condition: data.condition,
                            damageSeverity: data.damageSeverity,
                            repairNeeded: data.repairNeeded,
                            acknowledged: data.acknowledged,
                            evidenceFileName: data.evidenceFileName,
                            checkinNotes: data.notes,
                            status: 'Returned' as const,
                            checkedOutBy: 'Storekeeper',
                            checkedInBy: 'Storekeeper',
                        };
                    })
                )
            )
        );
    }

    getAvailableAssets(): Observable<{ id: string; name: string; serial: string; category: string }[]> {
        return this.assetService.getAvailableForCheckout().pipe(
            map((assets) =>
                (assets || [])
                    .map((a) => ({
                        id: String(a.id),
                        name: a.productName || a.assetCode,
                        serial: a.serialNumber || '-',
                        category: a.categoryName || '-',
                    }))
            )
        );
    }

    getEmployees(): Observable<CheckoutEmployee[]> {
        return this.http.get<{ id: number; firstName?: string; lastName?: string; fullName?: string; division?: string; department?: string; divisionId?: number; divisionName?: string; email: string }[]>(`${this.userApiUrl}/assignable-users`).pipe(
            map((users) =>
                (users || []).map((u) => {
                    const fullName = (u.firstName && u.lastName)
                        ? `${u.firstName} ${u.lastName}`.trim()
                        : (u.fullName || u.firstName || u.lastName || 'Unknown');
                    return {
                        id: String(u.id),
                        firstName: u.firstName,
                        lastName: u.lastName,
                        name: fullName,
                        division: u.divisionName || u.division || u.department || 'N/A',
                        divisionId: u.divisionId,
                        email: u.email,
                    };
                })
            ),
            catchError(() => of([]))
        );
    }
}
