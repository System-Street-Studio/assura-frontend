import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize, throwError, timeout } from 'rxjs';
import { GrnService } from '../../services/grn.service';
import { AssetOption, CreateGrnRequest, Grn, PurchasingOrderOption } from '../../models/grn.model';
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

    allGrns: Grn[] = [];
    viewGrns: Grn[] = [];
    loading = true;
    loadError = false;
    searchTerm = '';

    /* ── New GRN modal ── */
    showCreateModal = false;
    creating = false;
    submitted = false;
    purchasingOrders: PurchasingOrderOption[] = [];
    assets: AssetOption[] = [];

    createForm: CreateGrnRequest = {
        purchasingOrderId: 0,
        assetId: 0,
        receivedDate: '',
        receivedBy: '',
        notes: '',
    };

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

    /* ── New GRN modal ── */
    openCreateModal(): void {
        this.submitted = false;
        this.creating = false;
        this.createForm = {
            purchasingOrderId: 0,
            assetId: 0,
            receivedDate: new Date().toISOString().slice(0, 10),
            receivedBy: '',
            notes: '',
        };
        this.showCreateModal = true;

        this.svc.getPurchasingOrderOptions().subscribe({
            next: (orders) => { this.purchasingOrders = orders; },
            error: () => { this.purchasingOrders = []; this.toast.error('Failed to load purchasing orders'); },
        });
        this.svc.getAssetOptions().subscribe({
            next: (assets) => { this.assets = assets; },
            error: () => { this.assets = []; this.toast.error('Failed to load assets'); },
        });
    }

    cancelCreate(): void {
        if (this.creating) return;
        this.showCreateModal = false;
    }

    confirmCreate(): void {
        this.submitted = true;
        if (!this.createForm.purchasingOrderId || !this.createForm.assetId || !this.createForm.receivedDate) {
            return;
        }

        this.creating = true;
        this.svc.create(this.createForm).pipe(
            timeout(15000),
            catchError((err) => {
                if (err?.name === 'TimeoutError') {
                    this.toast.error('GRN creation timed out. Please try again.');
                }
                return throwError(() => err);
            }),
            finalize(() => { this.creating = false; })
        ).subscribe({
            next: (grn) => {
                this.showCreateModal = false;
                this.toast.success(`GRN "${grn.grnNumber}" recorded for ${grn.assetCode}.`);
                this.loadData();
            },
            error: (err) => {
                // The backend's global exception middleware serializes error
                // bodies as PascalCase (Detail/Message), unlike the rest of
                // the API which is camelCase — check both until that's fixed.
                const message = err?.error?.detail || err?.error?.Detail
                    || err?.error?.title || err?.error?.Message
                    || 'Failed to record GRN. Please try again.';
                this.toast.error(message);
            },
        });
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

    formatDate(dateStr: string | undefined): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    }
}
