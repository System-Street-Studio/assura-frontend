import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize, throwError, timeout } from 'rxjs';
import { GinService } from '../../services/gin.service';
import { CreateGinRequest, Gin, GrnOption } from '../../models/gin.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
    selector: 'app-gins',
    standalone: true,
    imports: [FormsModule, MatIconModule],
    templateUrl: './gins.html',
    styleUrls: ['./gins.css'],
})
export class GinsComponent implements OnInit {
    private svc = inject(GinService);
    private toast = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    allGins: Gin[] = [];
    viewGins: Gin[] = [];
    loading = true;
    loadError = false;
    searchTerm = '';

    /* ── New GIN modal ── */
    showCreateModal = false;
    creating = false;
    submitted = false;
    grnOptions: GrnOption[] = [];

    createForm: CreateGinRequest = {
        grnId: 0,
        assetId: 0,
        assignedDate: '',
        condition: '',
        notes: '',
    };

    /* ── Detail drawer ── */
    showDetail = false;
    detailGin: Gin | null = null;

    get totalCount(): number {
        return this.allGins.length;
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
                    this.toast.error('GIN data request timed out. Please try again.');
                }
                return throwError(() => err);
            })
        ).subscribe({
            next: (data) => {
                this.allGins = data;
                this.applyFilter();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadError = true;
                this.toast.error('Failed to load Goods Issue Notes.');
                this.allGins = [];
                this.viewGins = [];
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
        this.viewGins = !term
            ? this.allGins
            : this.allGins.filter((g) =>
                g.ginNumber.toLowerCase().includes(term) ||
                g.assetCode.toLowerCase().includes(term) ||
                g.productName.toLowerCase().includes(term) ||
                g.grnNumber.toLowerCase().includes(term) ||
                (g.assignedUserName || '').toLowerCase().includes(term));
    }

    onSearchChange(): void {
        this.applyFilter();
    }

    onGrnChange(): void {
        const selectedGrn = this.grnOptions.find(g => g.id === this.createForm.grnId);
        this.createForm.assetId = selectedGrn ? selectedGrn.assetId : 0;
    }

    /* ── New GIN modal ── */
    openCreateModal(): void {
        this.submitted = false;
        this.creating = false;

        this.createForm = {
            grnId: 0,
            assetId: 0,
            assignedDate: new Date().toISOString().slice(0, 10),
            condition: 'Good',
            notes: '',
        };
        this.showCreateModal = true;

        this.svc.getGrnOptions().subscribe({
            next: (grns) => {
                this.grnOptions = grns;
                if (this.grnOptions.length > 0 && !this.createForm.grnId) {
                    this.createForm.grnId = this.grnOptions[0].id;
                    this.createForm.assetId = this.grnOptions[0].assetId;
                }
                this.cdr.detectChanges();
            },
            error: () => { this.grnOptions = []; this.toast.error('Failed to load GRNs'); },
        });
    }

    cancelCreate(): void {
        if (this.creating) return;
        this.showCreateModal = false;
    }

    confirmCreate(): void {
        this.submitted = true;
        if (!this.createForm.grnId || !this.createForm.assetId || !this.createForm.assignedDate) {
            return;
        }

        this.creating = true;
        this.svc.create(this.createForm).pipe(
            timeout(15000),
            catchError((err) => {
                if (err?.name === 'TimeoutError') {
                    this.toast.error('GIN creation timed out. Please try again.');
                }
                return throwError(() => err);
            }),
            finalize(() => { this.creating = false; })
        ).subscribe({
            next: (gin) => {
                this.showCreateModal = false;
                this.toast.success(`GIN "${gin.ginNumber}" recorded for ${gin.assetCode}.`);
                this.loadData();
            },
            error: (err) => {
                const message = err?.error?.detail || err?.error?.Detail
                    || err?.error?.title || err?.error?.Message
                    || 'Failed to record GIN. Please try again.';
                this.toast.error(message);
            },
        });
    }

    /* ── Detail drawer ── */
    openDetail(gin: Gin): void {
        this.detailGin = gin;
        this.showDetail = true;
    }

    closeDetail(): void {
        this.showDetail = false;
        this.detailGin = null;
    }

    formatDate(dateStr: string | undefined): string {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    }
}
