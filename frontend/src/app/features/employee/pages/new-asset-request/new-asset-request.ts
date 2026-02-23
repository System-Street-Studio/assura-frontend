import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../services/asset.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-new-asset-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,MatIconModule],
  templateUrl: './new-asset-request.html',
  styleUrl: './new-asset-request.css',
})
export class NewAssetRequestComponent {

  requestData = {
    id: 0,
    assetCategory: '',
    assetName: '',
    description: '',
    quantity: 1,
    priority: 'Normal',
    reason: '',
    status: 'Pending',
    submittedDate: new Date()
  };

  constructor(private router: Router, private assetService: AssetService) {}

 onSubmit() {
  if (!this.requestData.assetName || !this.requestData.assetCategory) {
    alert('Please fill in Asset Name and Category');
    return;
  }

  this.assetService.saveAssetRequest(this.requestData).subscribe({
    next: (res: any) => {
      console.log('Backend Response:', res);
      alert(res.message || 'Request submitted successfully!');
      this.router.navigate(['/employee/requests-main']);
    },
    error: (err: any) => console.error('Save failed', err)
  });
}
}