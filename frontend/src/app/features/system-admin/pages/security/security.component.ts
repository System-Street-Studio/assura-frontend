import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemAdminService, SystemAdminUser, SystemAdminAuditLog } from '../../services/system-admin.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css']
})
export class SecurityComponent implements OnInit {
  private systemAdminService = inject(SystemAdminService);
  private toastService = inject(ToastService);

  activeTab: 'users' | 'logs' = 'users';
  
  users: SystemAdminUser[] = [];
  logs: SystemAdminAuditLog[] = [];
  loading = false;

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: 'users' | 'logs') {
    this.activeTab = tab;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    if (this.activeTab === 'users') {
      this.systemAdminService.getUsers().subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading users', err);
          this.toastService.show('Failed to load users', 'error');
          this.loading = false;
        }
      });
    } else {
      this.systemAdminService.getSecurityLogs().subscribe({
        next: (data) => {
          this.logs = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading security logs', err);
          this.toastService.show('Failed to load security logs', 'error');
          this.loading = false;
        }
      });
    }
  }

  toggleLock(user: SystemAdminUser) {
    if (user.username === 'sysadmin') {
      this.toastService.show('Cannot lock the master sysadmin account!', 'warning');
      return;
    }

    const action = user.isLocked ? 'Unlock' : 'Lock';
    if (confirm(`Are you sure you want to ${action} user ${user.username}?`)) {
      this.systemAdminService.toggleUserLock(user.id).subscribe({
        next: () => {
          this.toastService.show(`User ${user.username} successfully ${action.toLowerCase()}ed.`, 'success');
          this.loadData(); // Refresh list to get updated status
        },
        error: (err) => {
          console.error(`Failed to ${action} user`, err);
          this.toastService.show(`Failed to ${action.toLowerCase()} user ${user.username}.`, 'error');
        }
      });
    }
  }
}
