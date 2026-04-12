import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetDetail } from '../../../inventory/models/asset.model';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './maintenance-form.html',
  styleUrls: ['./maintenance-form.css']
})
export class MaintenanceFormComponent implements OnInit {
  private location = inject(Location);
  private assetRequestService = inject(AssetRequestService);
  private assetService = inject(AssetService);
  private authService = inject(AuthService);

  // Form Signals
  assignedAssets = signal<AssetDetail[]>([]);
  asset = signal('');
  issueType = signal('Damaged');
  description = signal('');
  needsTempAsset = signal(false);

  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (assets) => this.assignedAssets.set(assets),
      error: (err) => console.error('Failed to load assigned assets', err)
    });
  }

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

    this.assetRequestService.createRequest(requestData).subscribe({
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