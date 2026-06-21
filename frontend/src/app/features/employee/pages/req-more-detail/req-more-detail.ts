import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AssetRequest } from '../../services/asset-request.service';

@Component({
  selector: 'app-req-more-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule ],
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

  //get status class for styling
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  //get priority class 
  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase().replace(' ', '-')}`;
  }

 // Extract text before "(Transfer periods:"
  extractTransferReason(reason: string): string { 
    const match = reason.match(/^(.*?)\s*\(Transfer periods:/);
    return match ? match[1].trim() : reason;
  }

  // Extract the period part including dates
  extractTransferPeriod(reason: string): string {
    const match = reason.match(/\(Transfer periods:.*\)/);
    return match ? match[0].replace(/[()]/g, '').replace('Transfer periods:', '').trim() : 'Not specified';
  }

   // Extract issue type from reason (format: "Issue: <type>")
  extractIssueType(reason: string): string {
    const match = reason.match(/Issue:\s*(.+)$/);
    return match ? match[1].trim() : reason;
  }

  // Extract asset ID from format "ProductName (AssetCode)"
  extractAssetId(assetName: string): string { 
    const match = assetName.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : '';
  }

  // Extract asset name without brackets from format "ProductName (AssetCode)"
  extractAssetName(assetName: string): string {
    return assetName.replace(/\s*\([^)]*\)$/, '').trim();
  }

  //format file sizes
  formatFileSize(bytes?: number): string {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  //downloard files
  downloadFile(attachment: any): void {
    if (attachment.fileUrl) {
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.fileName;
      link.click();
    }
  }

  //get file types
  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    
    const iconMap: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image'
    };
    
    return iconMap[ext] || 'attach_file';
  }

 

}

      
