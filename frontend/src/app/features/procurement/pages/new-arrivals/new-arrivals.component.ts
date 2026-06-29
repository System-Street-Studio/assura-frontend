import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';
import { ProcurementService } from '../../services/procurement.service';
import { AssetInformingDto, InformStoresRequest } from '../../models/arrival.model';
import { PurchasingOrderSummaryDto } from '../../models/purchase-order.model';
import { ToastService } from '../../../../shared/services/toast.service';

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
  private toastService = inject(ToastService);

  isSubmitting = false;
  divisions: any[] = [];
  history: AssetInformingDto[] = [];
  purchasingOrders: PurchasingOrderSummaryDto[] = [];

  arrivalForm: FormGroup = this.fb.group({
    purchasingOrderId: [null, Validators.required],
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
    this.loadOrders();

    this.arrivalForm.get('purchasingOrderId')?.valueChanges.subscribe(id => {
      if (id) {
        // Auto-select division and date based on PO summary
        const summary = this.purchasingOrders.find(po => po.id === Number(id));
        if (summary) {
            if (summary.divisionName) {
                const div = this.divisions.find(d => d.name === summary.divisionName);
                if (div) {
                    this.arrivalForm.patchValue({ divisionId: div.id }, { emitEvent: false });
                }
            }
            if (summary.issuedDate) {
                try {
                    const dateStr = new Date(summary.issuedDate).toISOString().split('T')[0];
                    this.arrivalForm.patchValue({ purchasedDate: dateStr }, { emitEvent: false });
                } catch (e) {
                    // ignore invalid date
                }
            }
        }

        // Fetch full PO details to auto-fill item fields
        this.procurementService.getOrderById(Number(id)).subscribe({
          next: (po) => {
            if (po && po.items && po.items.length > 0) {
              const item = po.items[0];
              
              let warrantyVal = null;
              let isYears = false;
              let isMonths = false;
              
              if (item.warranty) {
                  const parts = item.warranty.trim().split(' ');
                  if (parts.length > 0 && !isNaN(Number(parts[0]))) {
                      warrantyVal = Number(parts[0]);
                      if (parts.length > 1) {
                          if (parts[1].toLowerCase().includes('year')) isYears = true;
                          if (parts[1].toLowerCase().includes('month')) isMonths = true;
                      } else {
                          isYears = true; // Default
                      }
                  }
              }

              this.arrivalForm.patchValue({
                model: item.model || '',
                quantity: item.quantity || 1,
                purchasedPrice: item.unitPrice || 0,
                warranty: warrantyVal,
                isYears: isYears,
                isMonths: isMonths
              });
            }
          },
          error: (err) => console.error('Error fetching PO details:', err)
        });
      } else {
          // Reset fields when no PO is selected
          this.arrivalForm.patchValue({
            model: '',
            warranty: null,
            isYears: false,
            isMonths: false,
            quantity: null,
            divisionId: null,
            purchasedPrice: null
          });
      }
    });
  }

  loadOrders() {
    this.procurementService.getOrders().subscribe({
      next: (data) => this.purchasingOrders = data.filter((po) => po.status !== 'Completed'),
      error: (err) => console.error('Error loading orders', err)
    });
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

      const selectedPo = this.purchasingOrders.find(po => po.id === Number(formValue.purchasingOrderId));
      const poOrderNumber = selectedPo ? selectedPo.orderNumber : 'Unknown PO';

      const request: InformStoresRequest = {
        itemName: poOrderNumber,
        purchasingOrderId: Number(formValue.purchasingOrderId),
        model: formValue.model,
        warranty: warrantyStr,
        quantity: formValue.quantity,
        purchasedDate: formValue.purchasedDate,
        purchasedPrice: formValue.purchasedPrice,
        divisionId: formValue.divisionId
      };

      this.procurementService.informStores(request).subscribe({
        next: () => {
          this.toastService.show('Informed Stores Successfully', 'success');
          this.isSubmitting = false;
          this.loadHistory();
          this.arrivalForm.reset({
            purchasedDate: new Date().toISOString().split('T')[0],
            divisionId: null
          });
        },
        error: (err) => {
          console.error('Error informing stores', err);
          this.isSubmitting = false;
          this.toastService.show('Failed to inform stores. Please check the logs.', 'error');
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
