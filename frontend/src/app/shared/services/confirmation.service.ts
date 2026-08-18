import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent, ConfirmationDialogData } from '../components/confirmation-modal/confirmation-modal';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private dialog = inject(MatDialog);

  /**
   * Shows a confirmation dialog with the given title and message.
   * Returns an Observable that emits true if confirmed, false if cancelled.
   */
  confirm(title: string, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { title, message } as ConfirmationDialogData,
      panelClass: 'assura-dialog',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Convenience method for delete confirmations
   */
  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm(
      'Confirm Delete',
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    );
  }

  /**
   * Convenience method for password reset confirmations
   */
  confirmPasswordReset(username: string): Observable<boolean> {
    return this.confirm(
      'Reset Password',
      `Are you sure you want to reset the password for ${username}? A new random temporary password will be generated.`
    );
  }

  /**
   * Convenience method for lock/unlock confirmations
   */
  confirmToggleLock(username: string, isLocked: boolean): Observable<boolean> {
    const action = isLocked ? 'Unlock' : 'Lock';
    return this.confirm(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} user ${username}?`
    );
  }
}
