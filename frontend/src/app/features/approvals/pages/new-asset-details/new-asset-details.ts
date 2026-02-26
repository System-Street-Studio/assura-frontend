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

  approveRequest() {
    console.log('Approved:', this.request().name);

   this.popupMessage.set('Request Approved Successfully');
  this.showPopup.set(true);
    // ඔබේ API Call එක මෙතැනට
  }

  rejectRequest() {
    console.log('Rejected:', this.request().id);
    this.popupMessage.set('Request Rejected Successfully!');
    this.showPopup.set(true);
    // Reject Logic එක මෙතැනට
  }

  close() {
    this.router.navigate(['approvals/requests']); // ආපසු යන මාවත (Route)
  }

  closePopup() {
    this.showPopup.set(false);
    this.router.navigate(['approvals/requests']);
  }
}