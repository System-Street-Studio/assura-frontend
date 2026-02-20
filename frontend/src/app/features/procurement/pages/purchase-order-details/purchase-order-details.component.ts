import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-purchase-order-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './purchase-order-details.component.html',
    styleUrls: ['./purchase-order-details.component.css']
})
export class PurchaseOrderDetailsComponent implements OnInit {
    poId: string | null = null;

    // Mock Data
    orderDetails = {
        itemNo: '01',
        itemName: '6K Online UPS',
        model: 'KR 6000+',
        warranty: '3 years',
        quantity: '01',
        unitPrice: '460,000',
        amount: '460,000',
        discount: '0',
        discountedPrice: '460,000',
        vat: '18%',
        vatAmount: '82,800',
        totalPrice: '542,800',
        specialNote: 'Installation and commissioning shall be made on or before 22 - 02 - 2026'
    };

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.poId = this.route.snapshot.paramMap.get('id');
    }
}
