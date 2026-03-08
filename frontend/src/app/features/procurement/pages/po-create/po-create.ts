import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-po-create',
  imports: [CommonModule, ButtonComponent, FormsModule, StatusCardComponent],
  templateUrl: './po-create.html',
  styleUrl: './po-create.css',
})
export class PoCreate {
  private router = inject(Router);
  itemCount = 1;
  showSuccessPopup = false;

  // Form Fields
  itemName = '';
  model = '';
  warrantyYears = false;
  warrantyMonths = false;
  warrantyDuration: number | null = null;
  quantity: number = 0;
  unitPrice: number = 0;
  amount: number = 0;
  discount: number = 0;
  discountedPrice: number = 0;
  vat: number = 0;
  vatAmount: number = 0;
  totalPrice: number = 0;
  specialNote = '';

  calculateTotals() {
    // 1. Calculate Amount
    this.amount = (this.quantity || 0) * (this.unitPrice || 0);

    // 2. Calculate Discounted Price
    const discountVal = (this.amount * (this.discount || 0)) / 100;
    this.discountedPrice = this.amount - discountVal;

    // 3. Calculate VAT Amount based on Discounted Price
    this.vatAmount = (this.discountedPrice * (this.vat || 0)) / 100;

    // 4. Calculate Total Price
    this.totalPrice = this.discountedPrice + this.vatAmount;
  }

  onSaveAndNext() {
    console.log('Saving item:', this.itemCount);

    // Show Popup
    this.showSuccessPopup = true;

    // Wait for 2 seconds then reset
    setTimeout(() => {
      this.showSuccessPopup = false;

      // Increment item count
      this.itemCount++;

      // Reset form fields
      this.itemName = '';
      this.model = '';
      this.warrantyYears = false;
      this.warrantyMonths = false;
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
    }, 800);
  }

  exit() {
    this.router.navigate(['procurement', 'purchase-orders']);
  }
}
