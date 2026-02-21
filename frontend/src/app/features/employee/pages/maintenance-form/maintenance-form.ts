import { Component, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './maintenance-form.html',
  styleUrls: ['./maintenance-form.css']
})
export class MaintenanceFormComponent {
  // Services inject 
  private location = inject(Location);

  // Form Signals
  asset = signal('');
  issueType = signal('Damaged');
  description = signal('');
  needsTempAsset = signal(false);

  // Submit logic
  onSubmit() {
    const formData = {
      asset: this.asset(),
      issueType: this.issueType(),
      description: this.description(),
      tempAsset: this.needsTempAsset()
    };
    console.log('Form Submitted:', formData);
    alert('Request Submitted Successfully!');
    this.location.back();
  }

  
  // Cancel button logic 
  onCancel() {
    this.location.back();
  }
}