import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './action-button.html',
  styleUrls: ['./action-button.css'],
})
export class ActionButtonComponent {
  @Input() label = '';
  @Input() icon = '';
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
