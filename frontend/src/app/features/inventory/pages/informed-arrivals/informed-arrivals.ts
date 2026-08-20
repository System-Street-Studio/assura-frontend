import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ProcurementService } from '../../../procurement/services/procurement.service';
import { AssetInformingDto } from '../../../procurement/models/arrival.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutEmployee } from '../../models/checkout.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-informed-arrivals',
    standalone: true,
    imports: [CommonModule, MatIconModule, FormsModule],
    templateUrl: './informed-arrivals.html',
    styleUrls: ['./informed-arrivals.css'],
})
export class InformedArrivalsComponent implements OnInit {
    private procurementService = inject(ProcurementService);
    private checkoutService = inject(CheckoutService);
    private toast = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);

    arrivals: AssetInformingDto[] = [];
    loading = true;

    // Modal state
    showInformModal = false;
    informProcessing = false;
    selectedArrival: AssetInformingDto | null = null;
    employees: CheckoutEmployee[] = [];
    selectedEmployeeId: string = '';
    notifyDivisionHead = true;
    informRemarks = '';

    ngOnInit(): void {
        this.loadArrivals();
        this.loadEmployees();
    }

    loadArrivals(): void {
        this.loading = true;
        this.procurementService.getAssetInformings().subscribe({
            next: (data) => {
                this.arrivals = data || [];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.toast.error('Failed to load informed arrivals');
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }

    loadEmployees(): void {
        this.checkoutService.getEmployees().subscribe((data) => {
            this.employees = data || [];
            if (this.showInformModal && !this.selectedEmployeeId) {
                this.autoFillTargetEmployee();
                this.cdr.detectChanges();
            }
        });
    }

    autoFillTargetEmployee(): void {
        if (!this.selectedArrival || !this.employees || this.employees.length === 0) {
            return;
        }

        const arrivalDivId = this.selectedArrival.divisionId;
        const arrivalDivName = (this.selectedArrival.divisionName || '').trim().toLowerCase();

        // 1. Match by Division ID if present
        if (arrivalDivId) {
            const matchById = this.employees.find(e => e.divisionId != null && Number(e.divisionId) === Number(arrivalDivId));
            if (matchById) {
                this.selectedEmployeeId = String(matchById.id);
                return;
            }
        }

        // 2. Match by Division Name
        if (arrivalDivName) {
            const matchByName = this.employees.find(e => {
                const empDiv = (e.division || '').trim().toLowerCase();
                return empDiv === arrivalDivName || empDiv.includes(arrivalDivName) || arrivalDivName.includes(empDiv);
            });
            if (matchByName) {
                this.selectedEmployeeId = String(matchByName.id);
                return;
            }
        }
    }

    getStatusClass(status: string): string {
        const s = (status || 'pending').toLowerCase();
        if (s === 'confirmed' || s === 'completed' || s === 'grn recorded' || s === 'received') return 'assura-badge-success';
        if (s === 'informed') return 'assura-badge-info';
        return 'assura-badge-warning';
    }

    // Takes the storekeeper straight to full asset registration (serial number, product,
    // category, etc.) instead of the old GRN-only modal, which had no serial number field and
    // no way to add a product that doesn't already exist. `informingId` lets the asset form
    // record the formal GRN and mark this arrival fulfilled once the asset is saved.
    registerArrival(item: AssetInformingDto): void {
        const productName = item.model && item.itemName.startsWith('PO-') ? item.model : item.itemName;
        this.router.navigate(['/inventory/assets/new'], {
            queryParams: {
                informingId: item.id,
                productName: productName || '',
                warranty: item.warranty || '',
                price: item.purchasedPrice || undefined,
                divisionId: item.divisionId || undefined,
            }
        });
    }

    checkoutArrival(item: AssetInformingDto): void {
        const itemName = item.model && item.itemName.startsWith('PO-') ? item.model : item.itemName;
        this.router.navigate(['/inventory/check-out'], {
            queryParams: {
                informingId: item.id,
                employeeId: item.targetEmployeeId ? String(item.targetEmployeeId) : undefined,
                item: itemName,
                assetId: item.assetId ? String(item.assetId) : undefined
            }
        });
    }

    openInformModal(item: AssetInformingDto): void {
        this.selectedArrival = item;
        this.selectedEmployeeId = item.targetEmployeeId ? String(item.targetEmployeeId) : '';
        this.notifyDivisionHead = true;
        this.informRemarks = item.remarks || '';
        if (!this.selectedEmployeeId) {
            this.autoFillTargetEmployee();
        }
        this.showInformModal = true;
    }

    closeInformModal(): void {
        this.showInformModal = false;
        this.selectedArrival = null;
    }

    confirmInform(): void {
        if (!this.selectedArrival || !this.selectedEmployeeId) {
            this.toast.warning('Please select an employee');
            return;
        }

        this.informProcessing = true;
        const request = {
            informingId: this.selectedArrival.id,
            employeeId: Number(this.selectedEmployeeId),
            divisionHeadNotify: this.notifyDivisionHead,
            remarks: this.informRemarks || undefined
        };

        this.procurementService.informStakeholders(request).subscribe({
            next: () => {
                this.toast.success('Stakeholders informed successfully');
                this.informProcessing = false;
                this.closeInformModal();
                this.loadArrivals();
            },
            error: () => {
                this.toast.error('Failed to inform stakeholders');
                this.informProcessing = false;
            }
        });
    }
}
