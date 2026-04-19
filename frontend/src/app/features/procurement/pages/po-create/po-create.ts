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
  private fb = inject(FormBuilder);

  itemCount = 1;
  showSuccessPopup = false;
  isSubmitting = false;

  poForm: FormGroup;
  itemForm: FormGroup;

  // Display-only variables for the UI totals
  amount = 0;
  discountedPrice = 0;
  vatAmount = 0;
  totalPrice = 0;

  constructor() {
    this.poForm = this.fb.group({
      supplierName: ['', Validators.required],
      items: this.fb.array([])
    });

    this.itemForm = this.initItemForm();
    this.setupCalculation();
  }

  private initItemForm(): FormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      model: [''],
      warrantyDuration: [null],
      warrantyUnit: ['Years'],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      vat: [0, [Validators.min(0), Validators.max(100)]],
      specialNote: ['']
    });
  }

  private setupCalculation() {
    this.itemForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  // Collection of added items for display
  addedItems: any[] = [];

  get items(): FormArray {
    return this.poForm.get('items') as FormArray;
  }

  calculateTotals() {
    const { quantity, unitPrice, discount, vat } = this.itemForm.getRawValue();

    this.amount = (quantity || 0) * (unitPrice || 0);
    const discountVal = (this.amount * (discount || 0)) / 100;
    this.discountedPrice = this.amount - discountVal;
    this.vatAmount = (this.discountedPrice * (vat || 0)) / 100;
    this.totalPrice = this.discountedPrice + this.vatAmount;
  }

  onSaveAndNext() {
    this.itemForm.markAllAsTouched();
    if (this.itemForm.invalid) {
      alert('Please fill in all mandatory item fields with valid values.');
      return;
    }

    const val = this.itemForm.getRawValue();
    // Format warranty for the final submission if needed, or keep as discrete fields
    const itemData = {
      ...val,
      warranty: val.warrantyDuration ? `${val.warrantyDuration} ${val.warrantyUnit}` : ''
    };

    const newItemForm = this.fb.group(itemData);
    this.items.push(newItemForm);
    this.addedItems.push(itemData);

    this.showSuccessPopup = true;

    setTimeout(() => {
      this.showSuccessPopup = false;
      this.itemCount++;
      this.resetItemForm();
    }, 800);
  }

  resetItemForm() {
    this.itemForm.reset({
      itemName: '',
      model: '',
      warrantyDuration: null,
      warrantyUnit: 'Years',
      quantity: 0,
      unitPrice: 0,
      discount: 0,
      vat: 0,
      specialNote: ''
    });
    // Resetting totals
    this.amount = 0;
    this.discountedPrice = 0;
    this.vatAmount = 0;
    this.totalPrice = 0;
  }

  onSubmitOrder() {
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      alert('Please ensure the Supplier Name is entered.');
      return;
    }

    if (this.items.length === 0) {
      alert('Please add at least one item to the order.');
      return;
    }

    this.isSubmitting = true;
    const request = this.poForm.getRawValue();

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
