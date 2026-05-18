import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { ProcurementService } from '../../services/procurement.service';
import { CreatePurchasingOrderItemDto } from '../../models/purchase-order.model';

@Component({
  selector: 'app-po-create',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FormsModule, ReactiveFormsModule, StatusCardComponent],
  templateUrl: './po-create.html',
  styleUrl: './po-create.css',
})
export class PoCreate {
  private router = inject(Router);
  private procurementService = inject(ProcurementService);

  itemCount = 1;
  showSuccessPopup = false;
  isSubmitting = false;

  // Remaining properties for manual binding in the "current item" form section
  itemName = '';
  model = '';
  warrantyDuration: number | null = null;
  warrantyUnit: 'Years' | 'Months' = 'Years';
  quantity: number = 0;
  unitPrice: number = 0;
  amount: number = 0;
  discount: number = 0;
  discountedPrice: number = 0;
  vat: number = 0;
  vatAmount: number = 0;
  totalPrice: number = 0;
  specialNote = '';

  private fb = inject(FormBuilder);
  poForm: FormGroup;

  constructor() {
    this.poForm = this.fb.group({
      supplierName: ['', Validators.required],
      items: this.fb.array([]) // භාණ්ඩ කිහිපයක් සඳහා
    });
  }

  // getters
  get items(): FormArray {
    return this.poForm.get('items') as FormArray;
  }

  // භාණ්ඩයක් ඇතුළත් කිරීමට නව FormGroup එකක් සෑදීම
  createItem(): FormGroup {
    return this.fb.group({
      itemName: [this.itemName, Validators.required],
      model: [this.model],
      warranty: [this.warrantyDuration ? `${this.warrantyDuration} ${this.warrantyUnit}` : ''],
      quantity: [this.quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [this.unitPrice, [Validators.required, Validators.min(0)]],
      discount: [this.discount],
      vatPercentage: [this.vat],
      specialNote: [this.specialNote]
    });
  }

  // Collection of added items (Keeping this for direct access if needed by template)
  addedItems: any[] = [];

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

    const newItemForm = this.createItem();
    this.items.push(newItemForm);
    this.addedItems.push(newItemForm.value);

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
    if (this.poForm.get('supplierName')?.invalid) {
      alert('Please enter a Supplier Name.');
      return;
    }

    if (this.items.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    this.isSubmitting = true;
    const request = this.poForm.value;

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
