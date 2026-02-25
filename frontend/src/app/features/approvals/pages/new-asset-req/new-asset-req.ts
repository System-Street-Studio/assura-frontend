import { Component , inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-new-asset-req',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './new-asset-req.html',
  styleUrl: './new-asset-req.css',
})
export class NewAssetReqComponent implements OnInit {

  // This 'id' input automatically captures the ID from the URL /details/:id
  id = input.required<string>(); 
  private router = inject(Router);

  // Signal to store data
  requestData = signal<any>(null);

  ngOnInit() {
    // In a real app, you would fetch data from a service here:
    // this.service.getRequest(this.id()).subscribe(data => this.requestData.set(data));
    
    // Mock data based on your screenshot
    this.requestData.set({
      employeeName: 'Jenny Athapaththu',
      employeeId: 'EST001',
      quantity: 1,
      requestedAsset: 'Table',
      assetCategory: 'Furniture',
      requestDate: '15-08-2025',
      priority: 'High',
      status: 'Pending',
      description1: 'due to loose joints and surface damage',
      description2: 'RAM: 16 GB, Processor: Intel Core i5 \nStorage: 512 GB SSD',
      justification: 'New hire requires a development machine to begin projects.'
    });
  }

  approve() {
    console.log('Approved');
    this.router.navigate(['/requests']);
  }

  reject() {
    console.log('Rejected');
    this.router.navigate(['/requests']);
  }
}
