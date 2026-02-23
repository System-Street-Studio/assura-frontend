import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

interface RequestItem {
  id: string;
  type: string;
  date: string;
  priority: 'High' | 'Medium' | 'Urgent' | 'Low' | '—';
  status: 'Pending' | 'Approved' | 'In Progress' | 'Rejected'|'Cancelled';
}

@Component({
  selector: 'app-all-requests',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule,MatIconModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './all-emp-requests.html',
  styleUrl: './all-emp-requests.css'
})
export class AllRequestsComponent {
  searchQuery = signal('');
  
  // Mock Data 
  requests = signal<RequestItem[]>([
    { id: 'REQ001', type: 'New Asset', date: '2025-08-15', priority: 'High', status: 'Pending' },
    { id: 'REQ002', type: 'Transfer', date: '2025-08-15', priority: 'Medium', status: 'Approved' },
    { id: 'REQ002', type: 'Transfer', date: '2025-08-15', priority: 'Urgent', status: 'In Progress' },
    { id: 'REQ003', type: 'Discard', date: '2025-08-15', priority: '—', status: 'Rejected' },
    { id: 'REQ004', type: 'Maintenance', date: '2025-08-15', priority: 'Medium', status: 'Approved' },
    { id: 'REQ005', type: 'New Asset', date: '2025-08-15', priority: 'High', status: 'Pending' },
  ]);

filterStatus = signal<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
isMenuOpen = signal(false); // To toggle the dropdown visibility

  /** Priority classes: */
  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase().replace(' ', '-')}`;
  }

  /** Status classes:*/
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

// Update computed signal to include the status filter
  filteredRequests = computed(() => {
  const query = this.searchQuery().toLowerCase();
  const status = this.filterStatus();
  
  return this.requests().filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(query) || r.type.toLowerCase().includes(query);
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesStatus;
  });
});

toggleMenu() {
  this.isMenuOpen.update(v => !v);
}

setStatus(status: any) {
  this.filterStatus.set(status);
  this.isMenuOpen.set(false); // Close menu after selection
}

// Mock function to handle cancel action
cancelRequest(requestId: string) {
  console.log('Cancelling request with ID:', requestId);
  this.requests.update(reqs => reqs.map(r => r.id === requestId ? { ...r, status: 'Cancelled' } : r));
}
}