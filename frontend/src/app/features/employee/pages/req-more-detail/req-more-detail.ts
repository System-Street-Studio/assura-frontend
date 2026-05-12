import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetRequest, AssetService } from '../../services/asset-request.service';

@Component({
  selector: 'app-req-more-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './req-more-detail.html',
  styleUrl: './req-more-detail.css',
})
export class ReqMoreDetail implements OnInit {
  request = signal<AssetRequest | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

 
  private router = inject(Router);


  ngOnInit() {
    // Use history.state to get data passed during navigation
    const historyState = this.router.getCurrentNavigation()?.extras.state || (window.history.state as any);
    
    if (historyState && historyState['request']) {
      this.request.set(historyState['request'] as AssetRequest);
      return;
    }
    
    // If no data passed, show error message
    this.error.set('No request data available. Please go back and select a request.');
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase().replace(' ', '-')}`;
  }

  extractTransferReason(reason: string): string {
    // Extract text before "(Transfer periods:"
    const match = reason.match(/^(.*?)\s*\(Transfer periods:/);
    return match ? match[1].trim() : reason;
  }

  extractTransferPeriod(reason: string): string {
    // Extract the period part including dates
    const match = reason.match(/\(Transfer periods:.*\)/);
    return match ? match[0].replace(/[()]/g, '').replace('Transfer periods:', '').trim() : 'Not specified';
  }

  extractIssueType(reason: string): string {
    // Extract issue type from reason (format: "Issue: <type>")
    const match = reason.match(/Issue:\s*(.+)$/);
    return match ? match[1].trim() : reason;
  }

  extractAssetId(assetName: string): string {
    // Extract asset ID from format "ProductName (AssetCode)"
    const match = assetName.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : '';
  }

  extractAssetName(assetName: string): string {
    // Extract asset name without brackets from format "ProductName (AssetCode)"
    return assetName.replace(/\s*\([^)]*\)$/, '').trim();
  }
}
