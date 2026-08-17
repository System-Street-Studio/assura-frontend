import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, throwError, timeout } from 'rxjs';
import { GrnService } from '../../services/grn.service';
import { AssetOption, CreateGrnRequest, Grn, PurchasingOrderOption } from '../../models/grn.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProcurementService } from '../../../procurement/services/procurement.service';

@Component({
    selector: 'app-grns',
    standalone: true,
    imports: [FormsModule, MatIconModule],
    templateUrl: './grns.html',
    styleUrls: ['./grns.css'],
})
export class GrnsComponent implements OnInit {
    private svc = inject(GrnService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);
    private procurementService = inject(ProcurementService);

    allGrns: Grn[] = [];
    viewGrns: Grn[] = [];
    loading = true;
    loadError = false;
    searchTerm = '';
    informingId: number | null = null;

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
        this.route.queryParams.subscribe((params) => {
            if (params['informingId']) {
                this.informingId = Number(params['informingId']);
            }
            if (params['po'] || params['informingId']) {
                this.openCreateModal(params['po'], params['model']);
            }
        });
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

    onPoChange(): void {
        const selectedPo = this.purchasingOrders.find(p => p.id === this.createForm.purchasingOrderId);
        if (selectedPo) {
            this.createForm.notes = `Received in good condition as per ${selectedPo.orderNumber}.`;
        }
    }

    /* ── New GRN modal ── */
    openCreateModal(preselectPo?: string, preselectModel?: string): void {
        this.submitted = false;
        this.creating = false;

        const currentUserName = this.auth.getUserName() || this.auth.getFirstName() || 'Test Storekeeper';
        const formattedUserName = currentUserName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        this.createForm = {
            purchasingOrderId: 0,
            assetId: 0, // 0 = Auto-register new asset from PO
            receivedDate: new Date().toISOString().slice(0, 10),
            receivedBy: formattedUserName,
            notes: preselectPo ? `Received in good condition as per ${preselectPo}.` : 'Received in good condition.',
            informingId: this.informingId || undefined,
            itemName: preselectPo || undefined,
            model: preselectModel || undefined,
        };
        this.showCreateModal = true;

        this.svc.getPurchasingOrderOptions().subscribe({
            next: (orders) => {
                this.purchasingOrders = orders;
                if (preselectPo) {
                    const cleanPo = preselectPo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    const rawPo = preselectPo.trim().toLowerCase();

                    let match = this.purchasingOrders.find((p) => {
                        const pClean = p.orderNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        const pRaw = p.orderNumber.trim().toLowerCase();
                        return pRaw === rawPo || pClean === cleanPo ||
                               pRaw.includes(rawPo) || rawPo.includes(pRaw) ||
                               pClean.includes(cleanPo) || cleanPo.includes(pClean);
                    });

                    if (!match) {
                        const digits = preselectPo.replace(/\D/g, '');
                        if (digits.length >= 4) {
                            match = this.purchasingOrders.find(p => {
                                const pDigits = p.orderNumber.replace(/\D/g, '');
                                return pDigits.includes(digits) || digits.includes(pDigits);
                            });
                        }
                    }

                    if (match) {
                        this.createForm.purchasingOrderId = match.id;
                        this.createForm.notes = `Received in good condition as per ${match.orderNumber}.`;
                    } else if (this.purchasingOrders.length > 0 && !this.createForm.purchasingOrderId) {
                        this.createForm.purchasingOrderId = this.purchasingOrders[0].id;
                        this.createForm.notes = `Received in good condition as per ${this.purchasingOrders[0].orderNumber}.`;
                    }
                } else if (this.purchasingOrders.length > 0 && !this.createForm.purchasingOrderId) {
                    this.createForm.purchasingOrderId = this.purchasingOrders[0].id;
                }
                this.cdr.detectChanges();
            },
            error: () => { this.purchasingOrders = []; this.toast.error('Failed to load purchasing orders'); },
        });

        this.svc.getAssetOptions().subscribe({
            next: (assets) => {
                this.assets = assets;
                this.cdr.detectChanges();
            },
            error: () => { this.assets = []; this.toast.error('Failed to load assets'); },
        });
    }

    isAssetAlreadyReceived(assetId: number): boolean {
        return this.allGrns.some(g => g.assetId === assetId);
    }

    cancelCreate(): void {
        if (this.creating) return;
        this.showCreateModal = false;
    }

    confirmCreate(): void {
        this.submitted = true;
        if (!this.createForm.purchasingOrderId || !this.createForm.receivedDate) {
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
                this.toast.success(`GRN "${grn.grnNumber}" recorded & Asset ${grn.assetCode} registered.`);
                this.loadData();
            },
            error: (err) => {
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
