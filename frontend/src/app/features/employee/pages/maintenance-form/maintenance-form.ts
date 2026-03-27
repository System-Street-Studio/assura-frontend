import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService } from '../../services/asset-request.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './maintenance-form.html',
  styleUrls: ['./maintenance-form.css']
})
export class MaintenanceFormComponent {
  private location = inject(Location);
  private assetService = inject(AssetService);
  private authService = inject(AuthService);

  // Form Signals
  asset = signal('');
  issueType = signal('Damaged');
  description = signal('');
  needsTempAsset = signal(false);

  // Submit logic
  onSubmit() {
    const requestData = {
      employeeId: this.authService.getUserId() || '',
      submittedBy: this.authService.getUserName() || 'Employee',
      assetCategory: 'N/A',
      assetName: this.asset(),
      description: this.description(),
      reason: `Issue: ${this.issueType()}. Needs Temp: ${this.needsTempAsset()}`,
      quantity: 1,
      priority: 'Normal',
      requestType: 'Maintenance',
      submittedDate: new Date()
    };

    this.assetService.createRequest(requestData).subscribe({
      next: () => {
        alert('Maintenance Request Submitted Successfully!');
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