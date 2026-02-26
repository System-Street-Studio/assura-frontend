import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule,ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';


@Component({
  selector: 'app-transfer-asset-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './transfer-details.html',
  styleUrls: ['./transfer-details.css']
})
export class TransferDetailsComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute); // මේ line එක අනිවාර්යයෙන් එක් කරන්න
  private location = inject(Location);
  
  // Navigation state එකෙන් එන දත්ත ලබා ගැනීම
  request = signal<any>(history.state.data || {
    asset: 'Table',
    category: 'Furniture',
    quantity: 1,
    name: 'Jenny Athapaththu (ID:EST001)',
    submittedDate: '15-08-2025',
    timelineFrom: '15-08-2025',
    timelineTo: '15-09-2025',
    specs: 'Height: 28-30 inches \n Width: 40-72 inches \n Depth: 24-32 inches',
    reason: 'my table is discarded and need another for temporary use until new table received.'
  });

  

  approveRequest() { console.log('Approved'); }
  rejectRequest() { console.log('Rejected'); }
  viewInPool() { console.log('Viewing in Pool'); }

  close() {
   
    // URL එකෙන් tab එක කියවගන්නවා
    const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'new';
    
    // ආපසු යන විට එම tab එක query parameter එකක් ලෙස යවනවා
    this.router.navigate(['/approvals/requests'], { 
      queryParams: { tab: returnTab } 
    });
  }
}