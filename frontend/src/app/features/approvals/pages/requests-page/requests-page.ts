import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterModule} from '@angular/router';

// Define the interface for a Request
interface RequestItem {
  id: number;
  name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  asset: string;
  date: string;
  priority: 'High' | 'Normal' | 'Low';
}

@Component({
  selector: 'app-requests-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule,RouterLink],
  templateUrl: './requests-page.html',
  styleUrl: './requests-page.css',
})
export class RequestsPageComponent {


  // Active tab eka track karanna signal ekak
  activeTab = signal<'new' | 'transfer' | 'maintenance'| 'discard'>('new');


  // 1. Signal-based data state
  requests = signal<RequestItem[]>([
    { id: 1, name: 'Harry Ekanayeka', status: 'Pending', asset: 'Laptop (1)', date: '2025-08-15', priority: 'High' },
    { id: 2, name: 'Jenny Athapaththu', status: 'Pending', asset: 'Office Chair (2)', date: '2025-08-15', priority: 'Normal' },
    { id: 3, name: 'Sarah Kodithuwakku', status: 'Approved', asset: 'Monitor (3)', date: '2025-08-15', priority: 'High' },
    { id: 4, name: 'Gavesh Gamage', status: 'Pending', asset: 'Projector (1)', date: '2025-08-15', priority: 'Low' },
    { id: 5, name: 'Rishmi Hans', status: 'Rejected', asset: 'Standing Desk (1)', date: '2025-08-15', priority: 'Low' }
  ]);

  transferRequests = signal([
     { id: 101, date: '2024-10-26', asset: 'Table', category: '3x4', employee: 'Jenny Athapaththu', status: 'Pending' },
    { id: 102, date: '2024-10-26', asset: 'Laptop', category: 'Lenovo X1 Carbon', employee: 'Harry Ekanayeka', status: 'Pending' },
    { id: 103, date: '2024-10-26', asset: 'Keyboard', category: 'Logitech MX Keys', employee: 'Sarah Kodithuwakku', status: 'Rejected' },
    { id: 104, date: '2024-10-26', asset: 'Mouse', category: 'Logitech MX Master 3', employee: 'Gavesh Gamage', status: 'Approved' }
  ]);

  // Maintenance Requests Data
  maintenanceRequests = signal([
    { id: 201, date: '2024-11-05', asset: 'Printer', issue: 'Paper Jam / ink leak', employee: 'Kamal Silva', status: 'Pending' },
    { id: 202, date: '2024-11-06', asset: 'A/C Unit', issue: 'Not Cooling', employee: 'Nimal Perera', status: 'Approved' }
  ]);

  // Discard Requests Data
  discardRequests = signal([
    { id: 301, date: '2024-11-10', asset: 'Old Server', reason: 'Beyond Repair', employee: 'Sunil Shantha', status: 'Pending' }
  ]);

  // 2. Summary Counts (Kept as signals as per your structure)
  newAssetCount = signal(3);
  transferCount = signal(7);
  maintenanceCount = signal(2);
  discardCount = signal(1);

  // 3. Track selected request for details view
  selectedRequest = signal<RequestItem | null>(null);

  /**
   * Action handler for viewing details
   * Fixed: Changed 'asset' type to 'RequestItem' to match the loop variable
   */
  
  /*viewDetails(itemOrId: any) {
    const id = typeof itemOrId === 'object' ? itemOrId.id : itemOrId;
    this.router.navigate(['/new-asset-req', id]);
  }*/


  setTab(tab: 'new' | 'transfer' | 'maintenance'| 'discard') {
    this.activeTab.set(tab);
  }
 
    checkStatus(id: number) {
    console.log('Checking status for ID:', id);
  }

  constructor(private router: Router) {}

    viewDetails(request: any) {
      this.router.navigate(
        ['/approvals/transfer-req', request.id],
        { state: { data: request } }
      );
    }
}