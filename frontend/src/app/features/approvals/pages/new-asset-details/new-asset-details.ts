import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-new-asset-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './new-asset-details.html',
  styleUrls: ['./new-asset-details.css']
})
export class NewAssetDetailsComponent {
  private router = inject(Router);
  

  request = signal<any>(history.state.data || {
    name: 'Harry Ekanayake',
    employeeId: 'EST001',
    quantity: 1,
    asset: 'Laptop',
    date: '15-08-2025',
    category: 'Electronics',
    specs: 'RAM: 16 GB, Processor: Intel Core i5 , Storage: 512 GB SSD',
    priority: 'High',
    status: 'Pending',
    justification: 'New hire requires a development machine to begin projects.'
  });

 showPopup = signal(false);
 popupMessage = signal('');
 popupType = signal<'success' | 'reject'>('success');

  approveRequest() {
    console.log('Approved:', this.request().name);
   this.popupMessage.set('Request Approved Successfully');
   this.popupType.set('success');
   this.showPopup.set(true);
  }

  rejectRequest() {
    console.log('Rejected:', this.request().id);
    this.popupMessage.set('Request Rejected Successfully!');
    this.popupType.set('reject');
    this.showPopup.set(true);
  }

  close() {
    this.router.navigate(['approvals/requests']); // ආපසු යන මාවත (Route)
  }

  closePopup() {
    this.showPopup.set(false);
    this.router.navigate(['approvals/requests']);
  }
}