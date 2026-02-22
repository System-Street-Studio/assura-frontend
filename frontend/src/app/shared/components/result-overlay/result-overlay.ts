import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-result-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="result-overlay" [class.leaving]="leaving">
      <div class="result-card" [class.leaving]="leaving">
        <button class="close-btn" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>

        <div class="icon-wrap" [class.success]="type === 'success'" [class.error]="type === 'error'">
          <div class="icon-glow"></div>
          <div class="icon-circle">
            <mat-icon class="icon">{{ type === 'success' ? 'check' : 'close' }}</mat-icon>
          </div>
        </div>

        <h2 class="result-title">{{ title }}</h2>
        <p class="result-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .result-overlay {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        animation: fadeIn 0.25s ease-out;
      }

      .result-overlay.leaving {
        animation: fadeOut 0.35s ease-in forwards;
      }

      .result-card {
        background: #fff;
        border-radius: 20px;
        padding: 44px 40px 40px;
        width: 340px;
        max-width: 90vw;
        text-align: center;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
        animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .result-card.leaving {
        animation: popOut 0.3s ease-in forwards;
      }

      .close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        background: none;
        border: none;
        color: #b0bec5;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        transition: color 0.15s, background 0.15s;
      }
      .close-btn:hover {
        color: #546e7a;
        background: #f0f4f4;
      }
      .close-btn mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      /* ── Icon ── */
      .icon-wrap {
        position: relative;
        width: 96px;
        height: 96px;
        margin: 0 auto 20px;
      }

      .icon-glow {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        animation: pulse 1.5s ease-in-out infinite;
      }

      .icon-wrap.success .icon-glow {
        background: rgba(11, 108, 120, 0.12);
      }
      .icon-wrap.error .icon-glow {
        background: rgba(217, 48, 37, 0.1);
      }

      .icon-circle {
        position: absolute;
        top: 14px;
        left: 14px;
        width: 68px;
        height: 68px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
      }

      .icon-wrap.success .icon-circle {
        background: #0b6c78;
      }
      .icon-wrap.error .icon-circle {
        background: #d93025;
      }

      .icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: #fff;
      }

      /* ── Text ── */
      .result-title {
        font-family: 'Jost', sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 8px;
      }

      .result-message {
        font-family: 'Jost', sans-serif;
        font-size: 0.9rem;
        color: #6b7f80;
        line-height: 1.55;
        margin: 0;
      }

      /* ── Animations ── */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes popIn {
        from { transform: scale(0.85); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes popOut {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.85); opacity: 0; }
      }
      @keyframes scaleIn {
        from { transform: scale(0); }
        to { transform: scale(1); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.08); opacity: 1; }
      }
    `,
  ],
})
export class ResultOverlayComponent {
  @Input() type: 'success' | 'error' = 'success';
  @Input() title = 'Success!';
  @Input() message = 'Your action was completed successfully.';
  @Output() closed = new EventEmitter<void>();

  leaving = false;

  onClose(): void {
    this.leaving = true;
    setTimeout(() => this.closed.emit(), 300);
  }

  dismiss(): void {
    this.onClose();
  }
}
