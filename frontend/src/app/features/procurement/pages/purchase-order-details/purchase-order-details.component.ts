import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcurementService } from '../../services/procurement.service';
import { PurchasingOrderDto } from '../../models/purchase-order.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-purchase-order-details',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './purchase-order-details.component.html',
    styleUrls: ['./purchase-order-details.component.css']
})
export class PurchaseOrderDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private procurementService = inject(ProcurementService);
    private cdr = inject(ChangeDetectorRef);
    private instanceId = Math.random().toString(36).substring(7);

    order: PurchasingOrderDto | null = null;
    isLoading = true;

    ngOnInit(): void {
        console.log(`[DEBUG] PurchaseOrderDetailsComponent [${this.instanceId}]: ngOnInit called`);
        const id = this.route.snapshot.paramMap.get('id');
        console.log(`[DEBUG] PurchaseOrderDetailsComponent [${this.instanceId}]: Route ID parameter: ${id}`);
        if (id) {
            this.loadOrder(parseInt(id));
        } else {
            console.error(`[DEBUG] PurchaseOrderDetailsComponent [${this.instanceId}]: No ID found in route`);
            this.isLoading = false;
        }
    }

    loadOrder(id: number): void {
        console.log(`[DEBUG] PurchaseOrderDetailsComponent [${this.instanceId}]: loadOrder(${id}) started`);
        this.isLoading = true;
        this.cdr.detectChanges();

        this.procurementService.getOrderById(id).subscribe({
            next: (data) => {
                console.log(`[DEBUG] PurchaseOrderDetailsComponent [${this.instanceId}]: Received data for order ${data.orderNumber}`);
                this.order = data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(`[DEBUG] PurchaseOrderDetailsComponent [${this.instanceId}]: Error fetching order:`, err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/procurement/purchase-orders']);
    }
}
