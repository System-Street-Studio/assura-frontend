import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btn" [ngStyle]="btnStyle" (click)="clicked.emit()">
      {{ label }}
    </button>
  `,
  styleUrls: ['./button.css'],
})
export class ButtonComponent {
  @Input() label = '';
  @Input() color: 'teal' | 'red' | 'black' = 'teal';
  @Output() clicked = new EventEmitter<void>();

  private colorMap: Record<string, string> = {
    teal: '#00AFB5',
    red: '#A30000',
    black: '#000000',
  };

  get btnStyle(): Record<string, string> {
    return { 'background-color': this.colorMap[this.color] || '#00AFB5' };
  }
}
