import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcurementService } from '../../services/procurement.service';
import { CreateRepairingFirmRequest } from '../../models/maintenance.model';
import { StatusCardComponent } from '../../../../shared/components/status-card/status-card';

@Component({
    selector: 'app-repairing-firm-create',
    standalone: true,
    imports: [CommonModule, FormsModule, StatusCardComponent],
    templateUrl: './repairing-firm-create.component.html',
    styleUrls: ['./repairing-firm-create.component.css']
})
export class RepairingFirmCreateComponent {
    private router = inject(Router);
    private procurementService = inject(ProcurementService);

    showSuccessPopup = false;
    isSaving = false;

    formData: CreateRepairingFirmRequest = {
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: ''
    };

    save(): void {
        if (!this.formData.name) {
            alert('Firm name is required');
            return;
        }

        this.isSaving = true;
        this.procurementService.createRepairingFirm(this.formData).subscribe({
            next: (id) => {
                this.showSuccessPopup = true;
                this.isSaving = false;
                setTimeout(() => {
                    this.showSuccessPopup = false;
                    this.router.navigate(['/procurement/maintenance/repairing-firms']);
                }, 1500);
            },
            error: (err) => {
                console.error('Error saving repairing firm', err);
                this.isSaving = false;
                alert('Error saving firm. Please check logs.');
            }
        });
    }

    close(): void {
        this.router.navigate(['/procurement/maintenance/repairing-firms']);
    }
}
