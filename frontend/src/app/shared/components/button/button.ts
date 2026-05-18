import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btn" [ngStyle]="btnStyle" [disabled]="isDisabled" (click)="!isDisabled && clicked.emit()">
      <ng-content></ng-content>
      {{ label }}
    </button>
  `,
  styleUrls: ['./button.css'],
})
export class ButtonComponent {
  @Input() label = '';
  @Input() color: 'teal' | 'red' | 'black' = 'teal';
  @Input() isDisabled = false;
  @Output() clicked = new EventEmitter<void>();

  private colorMap: Record<string, string> = {
    teal: '#00AFB5',
    red: '#A30000',
    black: '#000000',
  };

  get btnStyle(): Record<string, string> {
    if (this.isDisabled) {
      return {
        'background-color': '#ccc',
        'cursor': 'not-allowed',
        'opacity': '0.7'
      };
    }
    return { 'background-color': this.colorMap[this.color] || '#00AFB5' };
  }
}
