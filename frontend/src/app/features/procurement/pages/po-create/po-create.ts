import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { ProcurementService } from '../../services/procurement.service';
import { CreatePurchasingOrderItemDto } from '../../models/purchase-order.model';

@Component({
  selector: 'app-po-create',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FormsModule, StatusCardComponent],
  templateUrl: './po-create.html',
  styleUrl: './po-create.css',
})
export class PoCreate {
  private router = inject(Router);
  private procurementService = inject(ProcurementService);

  itemCount = 1;
  showSuccessPopup = false;
  isSubmitting = false;

  // Header Info
  supplierName = '';

  // Current Item Form Fields
  itemName = '';
  model = '';
  warrantyDuration: number | null = null;
  warrantyUnit: 'Years' | 'Months' = 'Years';
  quantity = 0;
  unitPrice = 0;
  amount = 0;
  discount = 0;
  discountedPrice = 0;
  vat = 0;
  vatAmount = 0;
  totalPrice = 0;
  specialNote = '';

  // Collection of added items
  addedItems: CreatePurchasingOrderItemDto[] = [];

  calculateTotals() {
    this.amount = (this.quantity || 0) * (this.unitPrice || 0);
    const discountVal = (this.amount * (this.discount || 0)) / 100;
    this.discountedPrice = this.amount - discountVal;
    this.vatAmount = (this.discountedPrice * (this.vat || 0)) / 100;
    this.totalPrice = this.discountedPrice + this.vatAmount;
  }

  onSaveAndNext() {
    if (!this.itemName || this.quantity <= 0 || this.unitPrice <= 0) {
      alert('Please fill in all mandatory item fields.');
      return;
    }

    const newItem: CreatePurchasingOrderItemDto = {
      itemName: this.itemName,
      model: this.model,
      warranty: this.warrantyDuration ? `${this.warrantyDuration} ${this.warrantyUnit}` : undefined,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      discount: this.discount,
      vatPercentage: this.vat,
      specialNote: this.specialNote
    };

    this.addedItems.push(newItem);
    this.showSuccessPopup = true;

    setTimeout(() => {
      this.showSuccessPopup = false;
      this.itemCount++;
      this.resetItemForm();
    }, 800);
  }

  resetItemForm() {
    this.itemName = '';
    this.model = '';
    this.warrantyDuration = null;
    this.quantity = 0;
    this.unitPrice = 0;
    this.amount = 0;
    this.discount = 0;
    this.discountedPrice = 0;
    this.vat = 0;
    this.vatAmount = 0;
    this.totalPrice = 0;
    this.specialNote = '';
  }

  onSubmitOrder() {
    if (!this.supplierName) {
      alert('Please enter a Supplier Name.');
      return;
    }

    if (this.addedItems.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    this.isSubmitting = true;
    const request = {
      supplierName: this.supplierName,
      items: this.addedItems
    };

    this.procurementService.createOrder(request).subscribe({
      next: (id) => {
        console.log('Order created successfully with ID:', id);
        this.router.navigate(['procurement', 'purchase-orders']);
      },
      error: (err) => {
        console.error('Error creating order:', err);
        alert('Failed to create order. Please check the console for details.');
        this.isSubmitting = false;
      }
    });
  }

  exit() {
    this.router.navigate(['procurement', 'purchase-orders']);
  }
}
