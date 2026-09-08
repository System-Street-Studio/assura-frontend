import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemAdminService, SystemAdminUser, SystemAdminAuditLog } from '../../services/system-admin.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmationService } from '../../../../shared/services/confirmation.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {
  private systemAdminService = inject(SystemAdminService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  activeTab: 'backup' | 'logs' | 'support' = 'backup';
  
  isBackingUp = false;
  searchTerm = '';
  errorLogs: SystemAdminAuditLog[] = [];
  users: SystemAdminUser[] = [];
  
  get filteredLogs(): SystemAdminAuditLog[] {
    if (!this.searchTerm) return this.errorLogs;
    const term = this.searchTerm.toLowerCase();
    return this.errorLogs.filter(log => 
      (log.entityName && log.entityName.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.createdBy && log.createdBy.toLowerCase().includes(term))
    );
  }

  get filteredUsers(): SystemAdminUser[] {
    if (!this.searchTerm) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user => 
      (user.username && user.username.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.role && user.role.toLowerCase().includes(term))
    );
  }

  ngOnInit() {
    this.loadDataForActiveTab();
  }

  setActiveTab(tab: 'backup' | 'logs' | 'support') {
    this.activeTab = tab;
    this.searchTerm = '';
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
    this.confirmationService.confirmPasswordReset(user.username).subscribe(confirmed => {
      if (confirmed) {
        this.systemAdminService.resetUserPassword(user.id).subscribe({
          next: (result) => {
            if (result.success) {
              if (result.emailSent) {
                this.toastService.show(
                  `Password reset for ${user.username}. The temporary password has been sent to ${user.email}.`,
                  'success'
                );
              } else {
                this.toastService.show(
                  `Password reset for ${user.username}, but email delivery failed. Please contact the user directly.`,
                  'warning'
                );
              }
            } else {
              this.toastService.show(`Failed to reset password for ${user.username}`, 'error');
            }
          },
          error: (err) => {
            console.error('Failed to reset password', err);
            this.toastService.show(`Failed to reset password for ${user.username}`, 'error');
          }
        });
      }
    });
  }
}
