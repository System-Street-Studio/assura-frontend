import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { catchError, throwError, timeout } from 'rxjs';
import { GrnService } from '../../services/grn.service';
import { Grn, PurchasingOrderOption } from '../../models/grn.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-grns',
    standalone: true,
    imports: [FormsModule, MatIconModule],
    templateUrl: './grns.html',
    styleUrls: ['./grns.css'],
})
export class GrnsComponent implements OnInit {
    private svc = inject(GrnService);
    private toast = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);

    allGrns: Grn[] = [];
    viewGrns: Grn[] = [];
    loading = true;
    loadError = false;
    searchTerm = '';

    /* ── "New GRN" -> pick a Purchasing Order, then go register the asset against it ── */
    showPoPicker = false;
    loadingPos = false;
    submitted = false;
    purchasingOrders: PurchasingOrderOption[] = [];
    selectedPoId = 0;

    /* ── Detail drawer ── */
    showDetail = false;
    detailGrn: Grn | null = null;

    get totalCount(): number {
        return this.allGrns.length;
    }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.loadError = false;
        this.svc.getAll().pipe(
            timeout(10000),
            catchError((err) => {
                if (err?.name === 'TimeoutError') {
                    this.toast.error('GRN data request timed out. Please try again.');
                }
                return throwError(() => err);
            })
        ).subscribe({
            next: (data) => {
                this.allGrns = data;
                this.applyFilter();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadError = true;
                this.toast.error('Failed to load Goods Received Notes.');
                this.allGrns = [];
                this.viewGrns = [];
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }

    retryLoad(): void {
        this.loadData();
    }

    applyFilter(): void {
        const term = this.searchTerm.trim().toLowerCase();
        this.viewGrns = !term
            ? this.allGrns
            : this.allGrns.filter((g) =>
                g.grnNumber.toLowerCase().includes(term) ||
                g.assetCode.toLowerCase().includes(term) ||
                g.productName.toLowerCase().includes(term) ||
                g.purchasingOrderNumber.toLowerCase().includes(term) ||
                g.supplierName.toLowerCase().includes(term));
    }

    onSearchChange(): void {
        this.applyFilter();
    }

    checkoutGrn(grn: Grn): void {
        this.router.navigate(['/inventory/check-out'], {
            queryParams: {
                assetId: grn.assetId ? String(grn.assetId) : undefined,
                item: grn.productName,
                poId: grn.purchasingOrderId ? String(grn.purchasingOrderId) : undefined,
            }
        });
    }

    /**
     * A GRN records goods physically received against a Purchasing Order, and receiving goods
     * means an asset needs to be registered for them — so "New GRN" opens a Purchasing Order
     * picker, then takes the storekeeper to asset registration with that PO already selected
     * (so its Supplier/Division/Product/Value/Warranty auto-fill fires immediately, not only
     * after they separately pick the PO again on that page). Saving the asset there is what
     * creates the GRN's linked record.
     */
    goToNewAsset(): void {
        this.submitted = false;
        this.selectedPoId = 0;
        this.showPoPicker = true;
        this.loadingPos = true;

        this.svc.getPurchasingOrderOptions().subscribe({
            next: (orders) => {
                this.purchasingOrders = orders;
                if (orders.length === 1) {
                    this.selectedPoId = orders[0].id;
                }
                this.loadingPos = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.purchasingOrders = [];
                this.loadingPos = false;
                this.toast.error('Failed to load purchasing orders');
                this.cdr.detectChanges();
            },
        });
    }

    cancelPoPicker(): void {
        this.showPoPicker = false;
    }

    continueToAssetForm(): void {
        this.submitted = true;
        if (!this.selectedPoId) return;

        this.showPoPicker = false;
        this.router.navigate(['/inventory/assets/new'], { queryParams: { poId: this.selectedPoId } });
    }

    /** Lets a storekeeper register an asset with no PO behind it (e.g. a donation or a find). */
    skipToAssetFormWithoutPo(): void {
        this.showPoPicker = false;
        this.router.navigate(['/inventory/assets/new']);
    }

    /* ── Detail drawer ── */
    openDetail(grn: Grn): void {
        this.detailGrn = grn;
        this.showDetail = true;
    }

    closeDetail(): void {
        this.showDetail = false;
        this.detailGrn = null;
    }

    /**
     * From the detail drawer: if a GRN already has a linked asset, open it for editing
     * (all fields are already saved). If there is no asset yet, go to the create form
     * with the GRN's PO pre-selected so Supplier/Division/Product/Value/Warranty auto-fill.
     */
    goToAsset(grn: Grn): void {
        this.showDetail = false;
        this.detailGrn = null;
        if (grn.assetId && grn.assetId > 0) {
            this.router.navigate(['/inventory/assets', grn.assetId, 'edit']);
        } else {
            this.router.navigate(
                ['/inventory/assets/new'],
                { queryParams: { poId: grn.purchasingOrderId } }
            );
        }
    }

    formatDate(dateStr: string | undefined): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    }
}
