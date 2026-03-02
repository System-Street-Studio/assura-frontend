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
  quantity: number | null = null;
  unitPrice: number | null = null;
  amount: number | null = null;
  discount: number | null = null;
  discountedPrice: number | null = null;
  vat: number | null = null;
  vatAmount: number | null = null;
  totalPrice: number | null = null;
  specialNote = '';

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
      this.quantity = null;
      this.unitPrice = null;
      this.amount = null;
      this.discount = null;
      this.discountedPrice = null;
      this.vat = null;
      this.vatAmount = null;
      this.totalPrice = null;
      this.specialNote = '';
    }, 800);
  }

  exit() {
    this.router.navigate(['procurement', 'purchase-orders']);
  }
}
