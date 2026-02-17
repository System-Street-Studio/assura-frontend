import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrls: ['./status-badge.css'],
})
export class StatusBadgeComponent {
  @Input() status = '';

  private statusColorMap: Record<string, string> = {
    'in use': '#22B759',
    repairing: '#3B82F6',
    discarded: '#AA3300',
    'in store': '#00AFB5',
  };

  get badgeStyle(): Record<string, string> {
    const key = this.status?.toLowerCase().trim();
    const hex = this.statusColorMap[key] || '#666666';
    const rgb = this.hexToRgb(hex);
    return {
      'background-color': `rgba(${rgb}, 0.25)`,
      color: hex,
      border: `1.5px solid ${hex}`,
    };
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
}
