import { CommonModule,Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-discard-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './discard-form.html',
  styleUrl: './discard-form.css',
})
export class DiscardFormComponent {

  // Services inject 
  private location = inject(Location);

  // Form Signals
  asset = signal('');
  reason = signal('');


  // Submit logic
  onSubmit() {
    const formData = {
      asset: this.asset(),
      reason: this.reason(),
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

