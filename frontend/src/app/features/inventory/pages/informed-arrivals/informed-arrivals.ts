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
        });
    }

    getStatusClass(status: string): string {
        return (status || 'pending').toLowerCase();
    }

    // The asset for this arrival must already be registered (via Asset > New
    // Asset) before a GRN can be recorded against it, since a GRN links a real
    // Purchasing Order to a real Asset — this arrival record has neither ID.
    // This takes the storekeeper to where they record that GRN once it's in.
    registerArrival(): void {
        this.router.navigate(['/inventory/grns']);
    }

    openInformModal(item: AssetInformingDto): void {
        this.selectedArrival = item;
        this.selectedEmployeeId = '';
        this.notifyDivisionHead = true;
        this.informRemarks = '';
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
            },
            error: () => {
                this.toast.error('Failed to inform stakeholders');
                this.informProcessing = false;
            }
        });
    }
}
