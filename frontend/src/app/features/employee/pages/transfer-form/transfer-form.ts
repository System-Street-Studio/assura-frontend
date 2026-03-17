import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule,
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatFormFieldModule, 
    MatInputModule],
  templateUrl: './transfer-form.html',
  styleUrl: './transfer-form.css',
})
export class TransferFormComponent {
  private location = inject(Location);

  // HTML new Signals
  assetName = signal('');
  category = signal('');
  description = signal('');
  quantity = signal(1); // Default value of 1
  priority = signal('Normal');
  reason = signal('');
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);


  onSubmit() {
    // Collect form data into an object
    const formData = {
      assetName: this.assetName(),
      category: this.category(),
      description: this.description(),
      quantity: this.quantity(),
      priority: this.priority(),
      reason: this.reason(),
      from: this.fromDate(),
      to: this.toDate()
    };

    console.log('Transfer Request Submitted:', formData);
    alert('Transfer Request Submitted Successfully!');
    this.location.back();
  }

  onCancel() {
    this.location.back();
  }

}
