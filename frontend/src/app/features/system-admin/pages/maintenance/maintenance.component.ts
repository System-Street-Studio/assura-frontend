import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemAdminService, SystemAdminUser, SystemAdminAuditLog } from '../../services/system-admin.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {
  private systemAdminService = inject(SystemAdminService);
  private toastService = inject(ToastService);

  activeTab: 'backup' | 'logs' | 'support' = 'backup';
  
  isBackingUp = false;
  errorLogs: SystemAdminAuditLog[] = [];
  users: SystemAdminUser[] = [];
  
  ngOnInit() {
    this.loadDataForActiveTab();
  }

  setActiveTab(tab: 'backup' | 'logs' | 'support') {
    this.activeTab = tab;
    this.loadDataForActiveTab();
  }

  private loadDataForActiveTab() {
    if (this.activeTab === 'logs' && this.errorLogs.length === 0) {
      this.systemAdminService.getSystemErrorLogs().subscribe({
        next: (logs) => this.errorLogs = logs,
        error: (err) => console.error('Failed to load error logs', err)
      });
    } else if (this.activeTab === 'support' && this.users.length === 0) {
      this.systemAdminService.getUsers().subscribe({
        next: (users: SystemAdminUser[]) => this.users = users,
        error: (err: any) => console.error('Failed to load users', err)
      });
    }
  }

  downloadBackup() {
    this.isBackingUp = true;
    this.toastService.show('Starting database backup. Please wait...', 'info');

    this.systemAdminService.downloadSqlBackup().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `Assura_Database_Backup_${dateStr}.sql`;
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.isBackingUp = false;
        this.toastService.show('Database backup completed successfully!', 'success');
      },
      error: (err) => {
        console.error('Backup failed', err);
        this.isBackingUp = false;
        this.toastService.show('Failed to generate database backup. Please check server logs.', 'error');
      }
    });
  }

  resetPassword(user: SystemAdminUser) {
    if (confirm(`Are you sure you want to reset the password for ${user.username} to the system default?`)) {
      this.systemAdminService.resetUserPassword(user.id).subscribe({
        next: () => {
          this.toastService.show(`Password reset successful for ${user.username}`, 'success');
        },
        error: (err) => {
          console.error('Failed to reset password', err);
          this.toastService.show(`Failed to reset password for ${user.username}`, 'error');
        }
      });
    }
  }
}
