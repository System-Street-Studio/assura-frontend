import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-transfer-req',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './transfer-req.html',
  styleUrls: ['./transfer-req.css']
})
export class TransferReqComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  // Using signals for state management (Angular 18 style)
  requestDetails = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // Mocking the data shown in your image
    this.requestDetails.set({
      id: id,
      asset: 'Table',
      category: 'Furniture',
      quantity: 1,
      employeeName: 'Jenny Athapaththu',
      employeeId: 'EST001',
      submittedDate: '15-08-2025',
      description: {
        height: '28 -30 inches',
        width: '40-72 inches',
        depth: '24-32 inches'
      },
      timeline: {
        from: '15-08-2025',
        to: '15-09-2025'
      },
      reason: 'my table is discarded and need another for temporary use until new table received.'
    });
  }

  approve() {
    console.log('Request Approved');
  }

  reject() {
    console.log('Reject with reason');
  }

  viewInPool() {
    console.log('Viewing in pool');
  }
}
