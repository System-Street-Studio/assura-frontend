import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let t of toasts"
        class="toast"
        [class]="'toast ' + t.type"
        [class.leaving]="t.leaving"
      >
        <mat-icon class="toast-icon">{{ t.icon }}</mat-icon>
        <span class="toast-msg">{{ t.message }}</span>
        <button class="toast-close" (click)="dismiss(t)">
          <mat-icon>close</mat-icon>
        </button>
        <div class="toast-progress" [style.animation-duration]="t.duration + 'ms'"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px;
        border-radius: 10px;
        min-width: 320px;
        max-width: 460px;
        font-family: 'Jost', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        color: #fff;
        pointer-events: auto;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        position: relative;
        overflow: hidden;
      }

      .toast.leaving {
        animation: slideOut 0.3s ease-in forwards;
      }

      .toast.success {
        background: #0b6c78;
      }
      .toast.error {
        background: #d93025;
      }
      .toast.warning {
        background: #e8860c;
      }
      .toast.info {
        background: #1a73e8;
      }

      .toast-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .toast-msg {
        flex: 1;
        line-height: 1.4;
      }

      .toast-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        padding: 2px;
        display: flex;
        border-radius: 4px;
        transition: color 0.15s;
        flex-shrink: 0;
      }
      .toast-close:hover {
        color: #fff;
      }
      .toast-close mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.35);
        animation: shrink linear forwards;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      @keyframes shrink {
        from {
          width: 100%;
        }
        to {
          width: 0;
        }
      }
    `,
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private sub!: Subscription;

  toasts: (Toast & { leaving?: boolean })[] = [];

  ngOnInit(): void {
    this.sub = this.toastService.toast$.subscribe((t) => {
      const toast = { ...t, leaving: false };
      this.toasts.push(toast);
      this.cdr.detectChanges();

      setTimeout(() => this.dismiss(toast), t.duration);
    });
  }

  dismiss(toast: Toast & { leaving?: boolean }): void {
    const idx = this.toasts.indexOf(toast);
    if (idx === -1) return;
    toast.leaving = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      const i = this.toasts.indexOf(toast);
      if (i !== -1) {
        this.toasts.splice(i, 1);
        this.cdr.detectChanges();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
