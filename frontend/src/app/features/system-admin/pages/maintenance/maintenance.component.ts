import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemAdminService } from '../../services/system-admin.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent {
  private systemAdminService = inject(SystemAdminService);
  private toastService = inject(ToastService);

  isBackingUp = false;

  downloadBackup() {
    this.isBackingUp = true;
    this.toastService.show('Starting database backup. Please wait...', 'info');

    this.systemAdminService.downloadSqlBackup().subscribe({
      next: (blob) => {
        // Create an invisible anchor to trigger file download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate a filename with the current date/time
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `Assura_Database_Backup_${dateStr}.sql`;
        
        document.body.appendChild(a);
        a.click();
        
        // Clean up
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
}
