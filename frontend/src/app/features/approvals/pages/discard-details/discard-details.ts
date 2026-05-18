import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule ,ActivatedRoute} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-discard-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './discard-details.html',
  styleUrls: ['./discard-details.css']
})
export class DiscardDetailsComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // පෙර පිටුවෙන් එන දත්ත signal එකක් ලෙස ලබා ගැනීම
  request = signal<any>(history.state.data || {
    asset: 'Table',
    category: 'Furniture',
    name: 'Jenny Athapaththu (ID:EST001)',
    submittedDate: '15-08-2025',
    reason: 'Beyond economic repair due to structural damage.',
    description: 'Due to loose joints and surface damage that cannot be fixed.',
    needTemporary: 'Yes',
    status: 'Pending'
  });

  approveRequest() { 
    console.log('Discard Approved for:', this.request().asset); 
  }

  rejectRequest() { 
    console.log('Discard Rejected'); 
  }
  
  close() {
   const returnTab = this.route.snapshot.queryParamMap.get('tab') || 'new';
    
    // නැවත Requests page එකට යන විට එම tab එකම open කරන්න
    this.router.navigate(['/approvals/requests'], { 
      queryParams: { tab: returnTab } 
    });
  }
}