import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  icon: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  show(message: string, type: ToastType = 'success', duration = 4000): void {
    const icons: Record<ToastType, string> = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning',
    };
    this.toastSubject.next({
      id: ++this.counter,
      message,
      type,
      icon: icons[type],
      duration,
    });
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }
}
