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
  searchTerm = '';
  
  users: SystemAdminUser[] = [];
  logs: SystemAdminAuditLog[] = [];
  loading = false;

  get filteredUsers(): SystemAdminUser[] {
    if (!this.searchTerm) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(u => 
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
  }

  get filteredLogs(): SystemAdminAuditLog[] {
    if (!this.searchTerm) return this.logs;
    const term = this.searchTerm.toLowerCase();
    return this.logs.filter(l => 
      (l.entityName && l.entityName.toLowerCase().includes(term)) ||
      (l.action && l.action.toLowerCase().includes(term)) ||
      (l.createdBy && l.createdBy.toLowerCase().includes(term))
    );
  }

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: 'users' | 'logs') {
    this.activeTab = tab;
    this.searchTerm = '';
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
