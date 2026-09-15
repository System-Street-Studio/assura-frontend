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
            if (this.showInformModal && !this.selectedEmployeeId && this.selectedArrival?.targetEmployeeId) {
                this.autoFillTargetEmployee();
                this.cdr.detectChanges();
            }
        });
    }

    autoFillTargetEmployee(): void {
        if (!this.selectedArrival || !this.employees || this.employees.length === 0) {
            return;
        }

        // 1. Only pre-select if targetEmployeeId is explicitly known
        if (this.selectedArrival.targetEmployeeId) {
            const matchById = this.employees.find(e => Number(e.id) === Number(this.selectedArrival?.targetEmployeeId));
            if (matchById) {
                this.selectedEmployeeId = String(matchById.id);
                return;
            }
        }

        // 2. Try matching by targetEmployeeName if available
        if (this.selectedArrival.targetEmployeeName) {
            const targetName = this.selectedArrival.targetEmployeeName.trim().toLowerCase();
            const matchByName = this.employees.find(e => (e.name || '').trim().toLowerCase() === targetName);
            if (matchByName) {
                this.selectedEmployeeId = String(matchByName.id);
                return;
            }
        }

        // Leave unselected so storekeeper deliberately chooses the intended employee
        this.selectedEmployeeId = '';
    }

    isRequester(emp: CheckoutEmployee): boolean {
        if (!this.selectedArrival) return false;
        if (this.selectedArrival.targetEmployeeId && Number(emp.id) === Number(this.selectedArrival.targetEmployeeId)) {
            return true;
        }
        if (this.selectedArrival.targetEmployeeName && emp.name && emp.name.trim().toLowerCase() === this.selectedArrival.targetEmployeeName.trim().toLowerCase()) {
            return true;
        }
        return false;
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
        const rawName = item.model && item.itemName.startsWith('PO-') ? item.model : item.itemName;
        // Strip embedded asset-code suffixes like "(AST-0050)" that sometimes get appended
        // by the procurement flow, so the asset form can match the product name cleanly.
        const productName = (rawName || '').replace(/\s*\(AST-[A-Z0-9-]+\)\s*/gi, '').trim();
        this.router.navigate(['/inventory/assets/new'], {
            queryParams: {
                informingId: item.id,
                productName: productName || '',
                warranty: item.warranty || '',
                // Always send the price — even 0 — so the form shows the value from the
                // informing record rather than silently defaulting to 0 with no context.
                price: Number(item.purchasedPrice) || 0,
                divisionId: item.divisionId || undefined,
                poId: item.purchasingOrderId || undefined,
            }
        });
    }

    checkoutArrival(item: AssetInformingDto): void {
        const rawName = item.model && item.itemName.startsWith('PO-') ? item.model : item.itemName;
        const itemName = (rawName || '').replace(/\s*\(AST-[A-Z0-9-]+\)\s*/gi, '').trim();
        this.router.navigate(['/inventory/check-out'], {
            queryParams: {
                informingId: item.id,
                employeeId: item.targetEmployeeId ? String(item.targetEmployeeId) : undefined,
                item: itemName || item.itemName,
                assetId: item.assetId ? String(item.assetId) : undefined,
                poId: item.purchasingOrderId ? String(item.purchasingOrderId) : undefined,
            }
        });
    }

    openInformModal(item: AssetInformingDto): void {
        this.selectedArrival = item;
        this.notifyDivisionHead = true;
        this.informRemarks = item.remarks || '';
        this.selectedEmployeeId = '';
        this.autoFillTargetEmployee();
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
