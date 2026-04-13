import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { ProcurementService } from '../../services/procurement.service';
import { AssetInformingDto, InformStoresRequest } from '../../models/arrival.model';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusCardComponent],
  templateUrl: './new-arrivals.component.html',
  styleUrls: ['./new-arrivals.component.css']
})
export class NewArrivalsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);

  showSuccess = false;
  isSubmitting = false;
  divisions: any[] = [];
  history: AssetInformingDto[] = [];

  arrivalForm: FormGroup = this.fb.group({
    itemName: ['', Validators.required],
    model: [''],
    warranty: [null],
    isYears: [false],
    isMonths: [false],
    quantity: [null, [Validators.required, Validators.min(1)]],
    purchasedDate: [new Date().toISOString().split('T')[0], Validators.required],
    divisionId: [null, Validators.required],
    purchasedPrice: [null, [Validators.required, Validators.min(0)]]
  });

  // පාලකයන් (controls) වෙත පහසුවෙන් පිවිසීමට getter එකක්
  get f() {
    return this.arrivalForm.controls;
  }

  ngOnInit() {
    this.loadDivisions();
    this.loadHistory();
  }

  loadDivisions() {
    this.procurementService.getDivisions().subscribe({
      next: (data) => this.divisions = data,
      error: (err) => console.error('Error loading divisions', err)
    });
  }

  loadHistory() {
    console.log('[DEBUG] NewArrivalsComponent: Loading history...');
    this.procurementService.getAssetInformings().subscribe({
      next: (data) => {
        console.log('[DEBUG] NewArrivalsComponent: History data received:', data);
        this.history = data;
      },
      error: (err) => console.error('[DEBUG] NewArrivalsComponent: Error loading history:', err)
    });
  }

  onSubmit() {
    if (this.arrivalForm.invalid) {
      this.arrivalForm.markAllAsTouched();
      return;
    }

    if (!this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.arrivalForm.value;

      let warrantyStr = '';
      if (formValue.warranty) {
        warrantyStr = `${formValue.warranty} ${formValue.isYears ? 'Years' : formValue.isMonths ? 'Months' : ''}`.trim();
      }

      const request: InformStoresRequest = {
        itemName: formValue.itemName,
        model: formValue.model,
        warranty: warrantyStr,
        quantity: formValue.quantity,
        purchasedDate: formValue.purchasedDate,
        purchasedPrice: formValue.purchasedPrice,
        divisionId: formValue.divisionId
      };

      this.procurementService.informStores(request).subscribe({
        next: () => {
          this.showSuccess = true;
          this.isSubmitting = false;
          this.loadHistory();
          setTimeout(() => {
            this.showSuccess = false;
            this.arrivalForm.reset({
              purchasedDate: new Date().toISOString().split('T')[0],
              divisionId: null
            });
          }, 2000);
        },
        error: (err) => {
          console.error('Error informing stores', err);
          this.isSubmitting = false;
          alert('Failed to inform stores. Please check the logs.');
        }
      });
    }
  }

  onCancel() {
    this.arrivalForm.reset({
      purchasedDate: new Date().toISOString().split('T')[0]
    });
  }
}
