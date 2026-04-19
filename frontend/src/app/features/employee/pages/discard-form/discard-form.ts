import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AssetService as AssetRequestService } from '../../services/asset-request.service';
import { AssetService } from '../../../inventory/services/asset.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AssetDetail } from '../../../inventory/models/asset.model';

@Component({
  selector: 'app-discard-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './discard-form.html',
  styleUrl: './discard-form.css',
})
export class DiscardFormComponent implements OnInit {
  private location = inject(Location);
  private assetRequestService = inject(AssetRequestService);
  private assetService = inject(AssetService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // Form Signals
  assignedAssets = signal<AssetDetail[]>([]);
  asset = signal('');
  reason = signal('');

  ngOnInit(): void {
    this.assetService.getAll().subscribe({
      next: (assets) => {
        this.assignedAssets.set(assets);
        
        // Auto-select asset from route state
        const passedAssetName = this.route.snapshot.data['assetName'] || window.history.state.assetName;
        if (passedAssetName) {
          // Find the matching asset and set it with full format
          const matchedAsset = assets.find(a => a.productName === passedAssetName);
          if (matchedAsset) {
            this.asset.set(matchedAsset.productName + ' (' + matchedAsset.assetCode + ')');
          }
        }
      },
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
      description: 'Discard Request',
      reason: this.reason(),
      quantity: 1,
      priority: 'Normal',
      requestType: 'Discard',
      submittedDate: new Date()
    };

    this.assetRequestService.createRequest(requestData).subscribe({
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
