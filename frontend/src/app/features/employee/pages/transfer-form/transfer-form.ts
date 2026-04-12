import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetDetail } from '../../../inventory/models/asset.model';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './transfer-form.html',
  styleUrl: './transfer-form.css',
})
export class TransferFormComponent implements OnInit {
  private location = inject(Location);
  private assetRequestService = inject(AssetRequestService);
  private assetService = inject(AssetService);
  private authService = inject(AuthService);

  // Signals
  assignedAssets = signal<AssetDetail[]>([]);
  assetName = signal('');
  category = signal('');
  description = signal('');
  quantity = signal(1);
  priority = signal('Normal');
  reason = signal('');
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (assets) => this.assignedAssets.set(assets),
      error: (err) => console.error('Failed to load assigned assets', err)
    });
  }

  onSubmit() {
    const requestData = {
      employeeId: this.authService.getUserId() || '',
      submittedBy: this.authService.getUserName() || 'Employee',
      assetCategory: this.category(),
      assetName: this.assetName(),
      description: this.description(),
      reason: `${this.reason()} (Transfer periods: ${this.fromDate()?.toLocaleDateString()} to ${this.toDate()?.toLocaleDateString()})`,
      quantity: this.quantity(),
      priority: this.priority(),
      requestType: 'Transfer',
      submittedDate: new Date()
    };

    this.assetRequestService.createRequest(requestData).subscribe({
      next: () => {
        alert('Transfer Request Submitted Successfully!');
        this.location.back();
      },
      error: (err) => {
        console.error('Submission failed', err);
        alert('Failed to submit request.');
      }
    });
  }

  onCancel() {
    this.location.back();
  }
}
