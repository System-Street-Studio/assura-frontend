import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AssetService } from '../../services/asset-request.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-discard-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './discard-form.html',
  styleUrl: './discard-form.css',
})
export class DiscardFormComponent {
  private location = inject(Location);
  private assetService = inject(AssetService);
  private authService = inject(AuthService);

  // Form Signals
  asset = signal('');
  reason = signal('');

  // Submit logic
  onSubmit() {
    const requestData = {
      employeeId: this.authService.getUserId() || '',
      submittedBy: this.authService.getUserName() || 'Employee',
      assetCategory: 'N/A',
      assetName: this.asset(),
      description: 'Discard Request',
      reason: this.reason(),
      quantity: 1,
      priority: 'Normal',
      requestType: 'Discard',
      submittedDate: new Date()
    };

    this.assetService.createRequest(requestData).subscribe({
      next: () => {
        alert('Discard Request Submitted Successfully!');
        this.location.back();
      },
      error: (err) => {
        console.error('Submission failed', err);
        alert('Failed to submit request.');
      }
    });
  }

  // Cancel button logic 
  onCancel() {
    this.location.back();
  }
}
