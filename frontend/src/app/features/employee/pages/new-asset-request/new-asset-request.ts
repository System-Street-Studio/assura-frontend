import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // RouterModule added for back link
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-asset-request',
  standalone: true, // Ensure standalone is true if using imports directly
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './new-asset-request.html',
  styleUrl: './new-asset-request.css',
})
export class NewAssetRequestComponent {
  
  // Initialize the form data
  requestData = {
    id: 0, // Added ID for tracking
    assetCategory: '',
    assetName: '',
    description: '',
    quantity: 1,
    priority: 'Normal',
    reason: '',
    status: 'Pending',
    submittedDate: new Date()
  };

  constructor(private router: Router) {}

  onSubmit() {
    // 1. Validate simple required fields
    if (!this.requestData.assetName || !this.requestData.assetCategory) {
      alert('Please fill in the Asset Name and Category');
      return;
    }

    // 2. Logic to "Save" locally without a backend
    const existingRequests = JSON.parse(localStorage.getItem('myRequests') || '[]');
    
    // Assign a mock ID
    this.requestData.id = Math.floor(Math.random() * 10000);
    this.requestData.submittedDate = new Date();

    // Add to the array
    existingRequests.push(this.requestData);

    // 3. Save back to Local Storage
    localStorage.setItem('myRequests', JSON.stringify(existingRequests));

    // 4. Feedback to user
    alert('Request Submitted Successfully (Saved to Local Storage)!');

    // 5. Navigate back to the main requests page
    this.router.navigate(['/employee/requests-main']);
  }
 
}