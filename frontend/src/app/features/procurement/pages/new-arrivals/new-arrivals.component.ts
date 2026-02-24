import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusCardComponent],
  templateUrl: './new-arrivals.component.html',
  styleUrls: ['./new-arrivals.component.css']
})
export class NewArrivalsComponent {
  private fb = inject(FormBuilder);

  showSuccess = false;

  arrivalForm: FormGroup = this.fb.group({
    itemName: ['', Validators.required],
    model: ['', Validators.required],
    warranty: [null, Validators.required],
    isYears: [false],
    isMonths: [false],
    quantity: [null, [Validators.required, Validators.min(1)]],
    purchasedDate: ['', Validators.required],
    department: ['', Validators.required],
    purchasedPrice: [null, [Validators.required, Validators.min(0)]]
  });

  onSubmit() {
    if (this.arrivalForm.valid) {
      console.log('Form Submitted:', this.arrivalForm.value);

      // Show success card after 800ms delay as requested
      setTimeout(() => {
        this.showSuccess = true;
      }, 800);
    }
  }

  onCancel() {
    this.arrivalForm.reset();
  }
}
