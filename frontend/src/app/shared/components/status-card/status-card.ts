import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './status-card.html',
  styleUrls: ['./status-card.css'],
})
export class StatusCardComponent {
  @Input() label = '';
  @Input() icon = 'check_box';
  @Input() color = '#00AFB5';
}
